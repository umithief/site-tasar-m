
import Post from '../models/Post.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import mongoose from 'mongoose';
import redis from '../config/redis.js';

// --- Helper: Node.js VibeScore Calculator (For updates) ---
export const calculateVibeScore = (post, viewerContext = {}) => {
    // 1. Engagement Score
    const likes = post.likeCount || 0;
    const comments = post.commentCount || 0;
    const shares = post.shareCount || 0;
    const saves = post.saveCount || 0;

    let score = (likes * 10) + (comments * 30) + (shares * 50) + (saves * 60);

    // 2. Multipliers
    // Telemetry
    if (post.telemetryQuality || (post.telemetry && post.telemetry.speed > 0)) {
        score *= 1.5;
    }

    // Garage Match (Affinity)
    if (viewerContext.activeBikeModel && post.bikeModel &&
        viewerContext.activeBikeModel.toLowerCase() === post.bikeModel.toLowerCase()) {
        score *= 1.3;
    }

    // Verified Pro
    if (post.userRank === 'Pro Rider' || post.userRank === 'MotoVibe Pro') {
        score *= 1.2;
    }

    // 3. Time Decay
    const hoursSincePosted = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
    const decayFactor = Math.pow(hoursSincePosted + 2, 1.8);

    return score / decayFactor;
};

// --- Controller: Get Personalized Feed ---
export const getDiscoveryFeed = async (req, res) => {
    try {
        const userId = req.user?._id?.toString(); // Ensure string
        const page = parseInt(req.query.page) || 1;
        const limit = 10; // Page size
        const cacheKey = `feed:discover:${userId}`;
        const cacheTTL = 600; // 10 minutes

        // 1. Try Fetch from Redis
        const start = (page - 1) * limit;
        const end = start + limit - 1;

        let cachedIds = [];
        try {
            cachedIds = await redis.lrange(cacheKey, start, end);
        } catch (err) {
            console.warn('⚠️ Redis Cache error (skipping):', err.message);
        }

        if (cachedIds && cachedIds.length > 0) {
            // CACHE HIT: Hydrate posts from MongoDB
            console.log(`⚡ VibeEngine: Serving page ${page} from cache for ${userId}`);

            const posts = await Post.find({ _id: { $in: cachedIds } })
                .populate('user', 'name username avatar rank');

            // Restore order (Critical because $in does not check order)
            const feed = cachedIds.map(id => posts.find(p => p._id.toString() === id)).filter(Boolean);

            return res.status(200).json({
                status: 'success',
                results: feed.length,
                data: { feed }
            });
        }

        // 2. CACHE MISS: Run Aggregation
        console.log(`🌪️ VibeEngine: Generating fresh feed for ${userId}`);

        // Get Current User Context
        let currentUser = null;
        if (userId) {
            currentUser = await User.findById(userId).select('primaryBike blockedUsers');
        }

        const activeBikeModel = currentUser?.primaryBike || '';
        const blockedUsers = currentUser?.blockedUsers || [];

        // Date Filter (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const pipeline = [
            // A. Match Stage
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo },
                    user: { $nin: blockedUsers.map(id => new mongoose.Types.ObjectId(id)) }
                }
            },
            // B. Lookup Poster
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'posterDef'
                }
            },
            { $unwind: '$posterDef' },
            // C. Scoring
            {
                $addFields: {
                    hoursOld: { $divide: [{ $subtract: [new Date(), "$createdAt"] }, 3600000] },
                    baseScore: {
                        $add: [
                            { $multiply: [{ $ifNull: ["$likeCount", 0] }, 10] },
                            { $multiply: [{ $ifNull: ["$commentCount", 0] }, 30] },
                            { $multiply: [{ $ifNull: ["$shareCount", 0] }, 50] },
                            { $multiply: [{ $ifNull: ["$saveCount", 0] }, 60] }
                        ]
                    },
                    telemetryMult: {
                        $cond: [{ $or: ["$telemetryQuality", { $gt: ["$telemetry.speed", 0] }] }, 1.5, 1.0]
                    },
                    affinityMult: {
                        $cond: [{ $eq: ["$bikeModel", activeBikeModel] }, 1.3, 1.0]
                    },
                    proMult: {
                        $cond: [{ $in: ["$posterDef.rank", ["Pro Rider", "MotoVibe Pro"]] }, 1.2, 1.0]
                    }
                }
            },
            // D. Formula
            {
                $addFields: {
                    finalVibeScore: {
                        $divide: [
                            { $multiply: ["$baseScore", "$telemetryMult", "$affinityMult", "$proMult"] },
                            { $pow: [{ $add: ["$hoursOld", 2] }, 1.8] }
                        ]
                    }
                }
            },
            // E. Sort & Limit (Calculate top 100 for cache)
            { $sort: { finalVibeScore: -1 } },
            { $limit: 100 },
            // F. Project ID only (for lightweight passing to next stage, but we need full docs if we return immediately)
            // Actually, better to just project ID for caching step, then re-fetch? 
            // No, efficient workflow: Get full docs locally, map IDs to Redis, return page slice.
            {
                $project: {
                    baseScore: 0, telemetryMult: 0, affinityMult: 0, proMult: 0, hoursOld: 0, posterDef: 0, finalVibeScore: 0
                }
            }
        ];

        const rankedPosts = await Post.aggregate(pipeline);

        // 3. Store in Redis
        const rankedIds = rankedPosts.map(p => p._id.toString());

        if (rankedIds.length > 0 && userId) {
            try {
                await redis.del(cacheKey);
                await redis.rpush(cacheKey, ...rankedIds);
                await redis.expire(cacheKey, cacheTTL);
            } catch (err) {
                console.warn('⚠️ Redis Write error:', err.message);
            }
        }

        // 4. Return Requested Page
        // Use the hydration logic similar to cache hit to ensure consistent population
        const pageIds = rankedIds.slice(start, end + 1);

        // We already have the raw docs in 'rankedPosts' but they might miss population or have extra fields defined in schema but not in aggregation result? 
        // Aggregation returns POJOs. Ideally we want Mongoose Documents or at least populated user.
        // Let's just fetch the specific page IDs again to be safe and consistent with "hydrate" logic.

        const posts = await Post.find({ _id: { $in: pageIds } })
            .populate('user', 'name username avatar rank');


        // Hydrate posts
        let feed = pageIds.map(id => posts.find(p => p._id.toString() === id)).filter(Boolean);

        // --- SPONSORED CONTENT INJECTION ---
        // Fetch 3 random/top products to inject if feed is long enough
        if (feed.length > 5) {
            try {
                const products = await mongoose.model('Product').find({
                    stock: { $gt: 0 },
                    rating: { $gte: 4.5 }
                }).limit(3);

                if (products.length > 0) {
                    // Inject at index 8, 16, 24...
                    let injectIndex = 8;
                    let prodIndex = 0;

                    while (injectIndex < feed.length && prodIndex < products.length) {
                        const product = products[prodIndex].toObject();

                        // Transform to feed item shape
                        const sponsoredItem = {
                            ...product,
                            _id: `sponsored_${product._id}`, // Unique ID for key
                            type: 'product',
                            isSponsored: true,
                            user: {
                                name: 'MotoVibe Shop',
                                username: 'motovibe_shop',
                                avatar: 'https://motovibe.vercel.app/logo-square.png', // Fallback/Default
                                rank: 'Official Partner'
                            },
                            content: product.description,
                            images: product.images || [product.image],
                            likes: 0,
                            comments: 0,
                            createdAt: new Date()
                        };

                        feed.splice(injectIndex, 0, sponsoredItem);
                        injectIndex += 9; // Skip next 8 + the one we just added
                        prodIndex++;
                    }
                }
            } catch (err) {
                console.error('Sponsored injection error:', err);
                // Continue without injection
            }
        }

        res.status(200).json({
            status: 'success',
            results: feed.length,
            data: {
                feed
            }
        });

    } catch (error) {
        console.error('VibeEngine Error:', error);
        res.status(500).json({ status: 'error', message: 'Feed generation failed' });
    }
};
