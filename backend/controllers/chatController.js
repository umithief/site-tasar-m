import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';

export const getChats = catchAsync(async (req, res, next) => {
    const userId = req.user._id;

    // Find all conversations where user is a participant
    const conversations = await Conversation.find({
        participants: userId
    })
        .populate('participants', 'name avatar email username primaryBike')
        .sort({ updatedAt: -1 });

    // Format for frontend
    const chats = conversations.map(chat => {
        // Identify the "other" participant
        const otherUser = chat.participants.find(p => p._id.toString() !== userId.toString());

        // Safety check if user is deleted
        if (!otherUser) return null;

        // Get unread count for current user
        const unread = chat.unreadCounts ? (chat.unreadCounts.get(userId.toString()) || 0) : 0;

        return {
            id: chat._id,
            partnerId: otherUser._id,
            name: otherUser.name,
            avatar: otherUser.avatar, // Fixed field name
            username: otherUser.username,
            primaryBike: otherUser.primaryBike,
            lastMessage: chat.lastMessage,
            lastMessageTime: chat.updatedAt,
            unreadCount: unread,
            isOnline: false // This will be handled by Socket.io on frontend
        };
    }).filter(Boolean);

    res.status(200).json({
        status: 'success',
        data: chats
    });
});

export const getMessages = catchAsync(async (req, res, next) => {
    const { id } = req.params; // Conversation ID
    const { page = 1, limit = 50 } = req.query;

    const messages = await Message.find({ conversationId: id })
        .sort({ createdAt: -1 }) // Newest first for pagination
        .skip((page - 1) * limit)
        .limit(limit * 1)
        .populate('senderId', 'name avatar');

    // Mark as read logic could go here or separate endpoint

    res.status(200).json({
        status: 'success',
        results: messages.length,
        data: messages.reverse() // Return oldest-to-newest for display
    });
});

// Helper route to create or get existing conversation
export const getOrCreateChat = catchAsync(async (req, res, next) => {
    const { partnerId } = req.body;
    const userId = req.user._id;

    if (!partnerId) {
        return res.status(400).json({ status: 'fail', message: 'Partner ID required' });
    }

    // Check existing
    let conversation = await Conversation.findOne({
        participants: { $all: [userId, partnerId] }
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [userId, partnerId],
            unreadCounts: { [userId]: 0, [partnerId]: 0 }
        });
    }

    res.status(200).json({
        status: 'success',
        data: {
            id: conversation._id
        }
    });
});
