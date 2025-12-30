import mongoose from 'mongoose';
import User from './backend/models/User.js';
import Message from './backend/models/Message.js';

const MONGO_URI = 'mongodb+srv://umithief:14531453@motovibe.mslnxhq.mongodb.net/?appName=motovibe';

async function verify() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        console.log('--- TEST 1: User.find() with REAL Model ---');
        const users = await User.find().limit(5).select('-password');
        console.log(`User.find() success. Count: ${users.length}`);

        if (users.length > 0) {
            console.log('Sample User:', users[0].name);
        }

        console.log('--- TEST 2: Message Aggregation with REAL Model ---');
        // We need a valid user ID for the match. Let's use the first user found or a specific ID if known.
        // The user reporting the error is using the app, so they likely have an ID.
        // Let's use the first user found in DB.
        if (users.length > 0) {
            const userId = users[0]._id;
            console.log(`Using User ID: ${userId}`);

            const threads = await Message.aggregate([
                {
                    $match: {
                        $or: [{ sender: userId }, { receiver: userId }]
                    }
                },
                {
                    $sort: { timestamp: -1 }
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ["$sender", userId] },
                                "$receiver",
                                "$sender"
                            ]
                        },
                        lastMessage: { $first: "$content" },
                        lastMessageTime: { $first: "$timestamp" },
                        lastMessageId: { $first: "$_id" },
                        unreadCount: {
                            $sum: {
                                $cond: [
                                    { $and: [{ $ne: ["$sender", userId] }, { $eq: ["$isRead", false] }] },
                                    1,
                                    0
                                ]
                            }
                        }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $unwind: '$user'
                },
                {
                    $project: {
                        id: '$_id',
                        userId: '$_id',
                        userName: '$user.name',
                        userAvatar: '$user.profileImage', // Note: Model has 'avatar' or 'profileImage'?
                        lastMessage: 1,
                        lastMessageTime: 1,
                        unreadCount: 1
                    }
                }
            ]);
            console.log(`Message aggregation success. Threads: ${threads.length}`);
        }

        console.log('ALL TESTS PASSED');

    } catch (error) {
        console.error('TEST FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
