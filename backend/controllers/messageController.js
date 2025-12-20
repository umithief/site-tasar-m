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

    res.status(201).json({
        status: 'success',
        data: newMessage
    });
});
