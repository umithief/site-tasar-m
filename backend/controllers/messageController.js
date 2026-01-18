import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// @desc    Get all conversation threads for current user
// @route   GET /api/messages/threads
// @access  Private
export const getThreads = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const conversations = await Conversation.find({
        participants: userId
    })
        .populate({
            path: 'participants',
            select: 'name username avatar'
        })
        .populate({
            path: 'lastMessage',
            select: 'content sender createdAt readBy'
        })
        .sort({ updatedAt: -1 });

    // Format for frontend
    const threads = conversations.map(conv => {
        const otherParticipant = conv.participants.find(p => p._id.toString() !== userId.toString());
        return {
            id: conv._id,
            user: otherParticipant ? {
                id: otherParticipant._id,
                name: otherParticipant.name,
                username: otherParticipant.username,
                avatar: otherParticipant.avatar
            } : { name: 'Unknown User' },
            lastMessage: conv.lastMessage ? {
                content: conv.lastMessage.content,
                senderId: conv.lastMessage.sender,
                createdAt: conv.lastMessage.createdAt,
                read: conv.lastMessage.readBy.includes(userId)
            } : null,
            unreadCount: conv.unreadCount.get(userId.toString()) || 0
        };
    });

    res.status(200).json({
        status: 'success',
        data: { threads }
    });
});

// @desc    Get messages for a specific conversation
// @route   GET /api/messages/conversation/:userId
// @access  Private
export const getConversation = catchAsync(async (req, res, next) => {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    // Find conversation first
    let conversation = await Conversation.findOne({
        participants: { $all: [currentUserId, otherUserId] }
    });

    if (!conversation) {
        return res.status(200).json({
            status: 'success',
            data: { messages: [], conversationId: null }
        });
    }

    // Reset unread count
    if (conversation.unreadCount.get(currentUserId.toString()) > 0) {
        conversation.unreadCount.set(currentUserId.toString(), 0);
        await conversation.save();
    }

    const messages = await Message.find({
        conversationId: conversation._id
    })
        .sort({ createdAt: 1 });

    res.status(200).json({
        status: 'success',
        data: {
            messages: messages.map(m => ({
                id: m._id,
                senderId: m.sender,
                content: m.content,
                createdAt: m.createdAt,
                read: m.readBy.includes(currentUserId)
            })),
            conversationId: conversation._id
        }
    });
});

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
export const sendMessage = catchAsync(async (req, res, next) => {
    const { recipientId, content } = req.body;
    const senderId = req.user.id;

    if (!recipientId || !content) {
        return next(new AppError('Alıcı ve mesaj içeriği zorunludur.', 400));
    }

    // Find or create conversation
    let conversation = await Conversation.findOne({
        participants: { $all: [senderId, recipientId] }
    });

    if (!conversation) {
        conversation = await Conversation.create({
            participants: [senderId, recipientId],
            unreadCount: {
                [senderId]: 0,
                [recipientId]: 0
            }
        });
    }

    // Create message
    const newMessage = await Message.create({
        conversationId: conversation._id,
        sender: senderId,
        content,
        readBy: [senderId]
    });

    // Update conversation
    conversation.lastMessage = newMessage._id;
    conversation.updatedAt = Date.now();

    // Increment unread count for recipient
    const recipientUnread = conversation.unreadCount.get(recipientId.toString()) || 0;
    conversation.unreadCount.set(recipientId.toString(), recipientUnread + 1);

    await conversation.save();

    // Socket Notification
    try {
        const { getIO } = await import('../socket.js');
        const io = getIO();

        io.to(recipientId).emit('newMessage', {
            message: newMessage,
            conversationId: conversation._id,
            senderId
        });
    } catch (err) {
        console.error('Socket notification failed', err);
    }

    res.status(201).json({
        status: 'success',
        data: { message: newMessage }
    });
});
