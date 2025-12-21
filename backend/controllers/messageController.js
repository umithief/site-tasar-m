import Message from '../models/Message.js';
import catchAsync from '../utils/catchAsync.js';

export const getConversation = catchAsync(async (req, res, next) => {
    // Get messages between current user and target user
    const messages = await Message.find({
        $or: [
            { sender: req.user._id, receiver: req.params.userId },
            { sender: req.params.userId, receiver: req.user._id }
        ]
    }).sort('timestamp');

    res.status(200).json({
        status: 'success',
        data: messages
    });
});

export const sendMessage = catchAsync(async (req, res, next) => {
    const { receiverId, content } = req.body;

    const newMessage = await Message.create({
        sender: req.user._id,
        receiver: receiverId,
        content
    });

});

res.status(201).json({
    status: 'success',
    data: newMessage
});
});

export const getThreads = catchAsync(async (req, res, next) => {
    // Aggregation to find last message for each unique conversation partner
    const userId = req.user._id;

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
                userId: '$_id', // standardized for frontend
                userName: '$user.name',
                userAvatar: '$user.profileImage', // Ensure this field matches your User model Schema
                lastMessage: 1,
                lastMessageTime: 1,
                unreadCount: 1
            }
        },
        {
            $sort: { lastMessageTime: -1 }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: threads
    });
});
