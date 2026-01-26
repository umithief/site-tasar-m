
import Post from '../models/Post.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import VibeConfig from '../models/VibeConfig.js';
import mongoose from 'mongoose';
import redis from '../config/redis.js';

// --- Helper: Get Config (Cached) ---
const getConfig = async () => {
    try {
        // Try Redis first
        const cacheKey = 'vibe:config';
        const cached = await redis.get(cacheKey);
        if (cached) return JSON.parse(cached);
    } catch (err) {
        // Redis failure shouldn't stop flow
    }

    // Fetch or Create DB
    let config = await VibeConfig.findById('default_config');
    if (!config) {
        config = await VibeConfig.create({ _id: 'default_config' });
    }

    // Cache for 1 hour
    try {
        await redis.set('vibe:config', JSON.stringify(config), 'EX', 3600);
    } catch (err) { }

    return config;
};

// --- Helper: Node.js VibeScore Calculator (For updates) ---
export const calculateVibeScore = (post, viewerContext = {}, config = null) => {
    // defaults
    const w = config?.weights || { like: 10, comment: 30, share: 50, save: 60 };
    const m = config?.multipliers || { telemetry: 1.5, affinity: 1.3, pro: 1.2 };
    const decay = config?.timeDecay || { enabled: true, factor: 1.8 };

    // 1. Engagement Score
    const likes = post.likeCount || 0;
    const comments = post.commentCount || 0;
    const shares = post.shareCount || 0;
    const saves = post.saveCount || 0;

    let score = (likes * w.like) + (comments * w.comment) + (shares * w.share) + (saves * w.save);

    // 2. Multipliers
    // Telemetry
    if (post.telemetryQuality || (post.telemetry && post.telemetry.speed > 0)) {
        score *= m.telemetry;
    }

    // Garage Match (Affinity)
    if (viewerContext.activeBikeModel && post.bikeModel &&
        viewerContext.activeBikeModel.toLowerCase() === post.bikeModel.toLowerCase()) {
        score *= m.affinity;
    }

    // Verified Pro
    if (post.userRank === 'Pro Rider' || post.userRank === 'MotoVibe Pro') {
        score *= m.pro;
    }

    // 3. Time Decay
    if (decay.enabled) {
        const hoursSincePosted = (Date.now() - new Date(post.createdAt).getTime()) / (1000 * 60 * 60);
        const decayFactor = Math.pow(hoursSincePosted + 2, decay.factor);
        return score / decayFactor;
    }

    return score;
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

            // Inject sponsored content even on cache hit (dynamically)
            await injectSponsoredContent(feed);

            return res.status(200).json({
                status: 'success',
                results: feed.length,
                data: { feed }
            });
        }

        // 2. CACHE MISS: Run Aggregation
        console.log(`🌪️ VibeEngine: Generating fresh feed for ${userId}`);

        // Fetch Dynamic Config
        const config = await getConfig();
        const w = config.weights;
        const m = config.multipliers;
        const decay = config.timeDecay;

        // Get Current User Context
        let currentUser = null;
        if (userId) {
            currentUser = await User.findById(userId).select('primaryBike blockedUsers');
        }

        const activeBikeModel = currentUser?.primaryBike || '';
        const blockedUsers = currentUser?.blockedUsers || [];

        // Date Filter (Dynamic based on Config)
        const daysToLookBack = decay.maxAgeDays || 30; // Default to 30 if not set
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysToLookBack);

        const pipeline = [
            // A. Match Stage
            {
                $match: {
                    createdAt: { $gte: cutoffDate },
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
                            { $multiply: [{ $ifNull: ["$likeCount", 0] }, w.like] },
                            { $multiply: [{ $ifNull: ["$commentCount", 0] }, w.comment] },
                            { $multiply: [{ $ifNull: ["$shareCount", 0] }, w.share] },
                            { $multiply: [{ $ifNull: ["$saveCount", 0] }, w.save] }
                        ]
                    },
                    telemetryMult: {
                        $cond: [{ $or: ["$telemetryQuality", { $gt: ["$telemetry.speed", 0] }] }, m.telemetry, 1.0]
                    },
                    affinityMult: {
                        $cond: [{ $eq: ["$bikeModel", activeBikeModel] }, m.affinity, 1.0]
                    },
                    proMult: {
                        $cond: [{ $in: ["$posterDef.rank", ["Pro Rider", "MotoVibe Pro"]] }, m.pro, 1.0]
                    }
                }
            },
            // D. Formula
            {
                $addFields: {
                    finalVibeScore: {
                        $cond: [
                            { $eq: [decay.enabled, true] },
                            {
                                $divide: [
                                    { $multiply: ["$baseScore", "$telemetryMult", "$affinityMult", "$proMult"] },
                                    { $pow: [{ $add: ["$hoursOld", 2] }, decay.factor] }
                                ]
                            },
                            { $multiply: ["$baseScore", "$telemetryMult", "$affinityMult", "$proMult"] }
                        ]
                    }
                }
            },
            // E. Sort & Limit (Calculate top 100 for cache)
            { $sort: { finalVibeScore: -1 } },
            { $limit: 100 },
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
        const pageIds = rankedIds.slice(start, end + 1);

        const posts = await Post.find({ _id: { $in: pageIds } })
            .populate('user', 'name username avatar rank');

        let feed = pageIds.map(id => posts.find(p => p._id.toString() === id)).filter(Boolean);

        await injectSponsoredContent(feed);

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

// --- Helper: Inject Sponsored Content ---
const injectSponsoredContent = async (feed) => {
    // Only inject if feed is substantial
    if (feed.length <= 5) return;

    // Fetch Config for Frequency
    const config = await getConfig();
    if (!config.sponsored.enabled) return;

    try {
        const products = await mongoose.model('Product').find({
            stock: { $gt: 0 },
            rating: { $gte: config.sponsored.minRating || 4.5 }
        }).limit(3);

        if (products.length > 0) {
            let injectIndex = config.sponsored.frequency || 8;
            let prodIndex = 0;

            while (injectIndex < feed.length && prodIndex < products.length) {
                const product = products[prodIndex].toObject();

                const sponsoredItem = {
                    ...product,
                    _id: `sponsored_${product._id}`,
                    type: 'product',
                    isSponsored: true,
                    user: {
                        name: 'MotoVibe Shop',
                        username: 'motovibe_shop',
                        avatar: 'https://motovibe.vercel.app/logo-square.png',
                        rank: 'Official Partner'
                    },
                    content: product.description,
                    images: product.images || [product.image],
                    likes: 0,
                    comments: 0,
                    createdAt: new Date()
                };

                feed.splice(injectIndex, 0, sponsoredItem);
                injectIndex += (config.sponsored.frequency || 8) + 1;
                prodIndex++;
            }
        }
    } catch (err) {
        console.error('Sponsored injection error:', err);
    }
};

// --- ADMIN CONTROLLERS ---

export const getVibeSettings = async (req, res) => {
    try {
        const config = await getConfig();
        res.status(200).json({ status: 'success', data: config });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};

export const updateVibeSettings = async (req, res) => {
    try {
        const updates = req.body;

        // Update in DB
        // Update in DB
        // Fetch existing first to merge (Deep merge protection)
        const existing = await VibeConfig.findById('default_config').lean();

        let finalUpdates = { ...updates };

        if (existing && updates.timeDecay) {
            finalUpdates.timeDecay = {
                ...existing.timeDecay,
                ...updates.timeDecay
            };

            // Explicitly ensure maxAgeDays is defined if still missing
            if (finalUpdates.timeDecay.maxAgeDays === undefined) {
                finalUpdates.timeDecay.maxAgeDays = 30;
            }
        }

        console.log('🔄 VibeEngine Update Payload:', JSON.stringify(finalUpdates.timeDecay, null, 2));

        const config = await VibeConfig.findByIdAndUpdate(
            'default_config',
            { ...finalUpdates, lastUpdated: Date.now() },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        // Invalidate Config Cache
        try {
            await redis.del('vibe:config');

            // Optional: Invalidate ALL user feed caches so they get new algorithm immediately
            const keys = await redis.keys('feed:discover:*');
            if (keys.length > 0) {
                await redis.del(...keys);
            }
        } catch (redisErr) {
            console.warn('⚠️ VibeEngine Cache Invalidation Failed:', redisErr.message);
            // Don't fail the request, just warn
        }

        res.status(200).json({ status: 'success', data: config, message: 'Settings updated & Caches cleared' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
