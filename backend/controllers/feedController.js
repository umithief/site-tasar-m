
import Post from '../models/Post.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
// import redisClient from '../config/redis'; // Assuming redis is setup, or we mock it.

// --- Helper: Node.js VibeScore Calculator (For updates) ---
export const calculateVibeScore = (post, viewerContext = {}) => {
    // 1. Engagement Score
    const likes = post.likeCount || 0;
    const comments = post.commentCount || 0;
    const shares = post.shareCount || 0; // Assuming field exists or 0
    const saves = post.saveCount || 0;   // Assuming field exists or 0

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
        const userId = req.user?._id;
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        // 1. Get Current User Context (for Affinity)
        let currentUser = null;
        if (userId) {
            currentUser = await User.findById(userId).select('primaryBike activeGarageId blockedUsers interestVector');
        }

        const activeBikeModel = currentUser?.primaryBike || '';
        const blockedUsers = currentUser?.blockedUsers || [];

        // 2. Date Filter (Last 7 Days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // 3. Aggregation Pipeline
        const pipeline = [
            // A. Match Stage
            {
                $match: {
                    createdAt: { $gte: sevenDaysAgo },
                    user: { $nin: blockedUsers.map(id => new mongoose.Types.ObjectId(id)) }
                }
            },

            // B. Lookup Poster Details (if not fully denormalized)
            {
                $lookup: {
                    from: 'users',
                    localField: 'user',
                    foreignField: '_id',
                    as: 'posterDef'
                }
            },
            { $unwind: '$posterDef' },

            // C. Scoring Projection
            {
                $addFields: {
                    // Time Decay Inputs
                    hoursOld: {
                        $divide: [
                            { $subtract: [new Date(), "$createdAt"] },
                            1000 * 60 * 60
                        ]
                    },
                    // Engagement Base
                    baseScore: {
                        $add: [
                            { $multiply: [{ $ifNull: ["$likeCount", 0] }, 10] },
                            { $multiply: [{ $ifNull: ["$commentCount", 0] }, 30] },
                            { $multiply: [{ $ifNull: ["$shareCount", 0] }, 50] },
                            { $multiply: [{ $ifNull: ["$saveCount", 0] }, 60] }
                        ]
                    },
                    // Multipliers
                    telemetryMult: {
                        $cond: [
                            { $or: ["$telemetryQuality", { $gt: ["$telemetry.speed", 0] }] },
                            1.5,
                            1.0
                        ]
                    },
                    affinityMult: {
                        $cond: [
                            { $eq: ["$bikeModel", activeBikeModel] }, // Simple string match
                            1.3,
                            1.0
                        ]
                    },
                    proMult: {
                        $cond: [
                            { $in: ["$posterDef.rank", ["Pro Rider", "MotoVibe Pro"]] },
                            1.2,
                            1.0
                        ]
                    }
                }
            },

            // D. Final Formula Calculation
            {
                $addFields: {
                    finalVibeScore: {
                        $divide: [
                            {
                                $multiply: [
                                    "$baseScore",
                                    "$telemetryMult",
                                    "$affinityMult",
                                    "$proMult"
                                ]
                            },
                            { $pow: [{ $add: ["$hoursOld", 2] }, 1.8] }
                        ]
                    }
                }
            },

            // E. Sort & Pagination
            { $sort: { finalVibeScore: -1 } },
            { $skip: skip },
            { $limit: limit },

            // F. Cleanup (Optional, remove temp fields)
            {
                $project: {
                    baseScore: 0,
                    telemetryMult: 0,
                    affinityMult: 0,
                    proMult: 0,
                    hoursOld: 0,
                    posterDef: 0 // Keep populated user data if needed, or rely on existing standard fields
                }
            }
        ];

        const feed = await Post.aggregate(pipeline);

        // Populate standard user field for frontend compatibility
        await Post.populate(feed, { path: 'user', select: 'name username avatar rank' });

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
