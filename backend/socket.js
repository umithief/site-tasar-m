import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/Message.js';
import MeetupEvent from './models/MeetupEvent.js';
import mongoose from 'mongoose';

let io;
const userSocketMap = new Map(); // userId -> socketId

export const initSync = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://192.168.1.36:5173", "http://192.168.1.36:3000", 'https://motovibe.vercel.app', 'https://motovibe-frontend.onrender.com'],
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Authenticate Socket Connection
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token || socket.handshake.query.token;

            if (!token) {
                console.error('❌ [Socket Auth] No token provided for handshake');
                return next(new Error('Authentication error: No token'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli-anahtar-123');
            const user = await User.findById(decoded.id);

            if (!user) {
                console.error('❌ [Socket Auth] User not found for token payload');
                return next(new Error('User not found'));
            }

            // console.log(`✅ [Socket Auth] Valid: ${user.name}`);
            socket.user = user;
            next();
        } catch (err) {
            console.error('Socket Auth Error:', err.message);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user._id.toString();
        const username = socket.user.name;

        // 1. Map User
        userSocketMap.set(userId, socket.id);
        console.log(`⚡ Premium Rider Joined: ${username} (${userId})`);

        // 2. Broadcast Online Status (to followers ideally, but globally for now)
        socket.broadcast.emit('user_online', { userId });

        // Join personal room
        socket.join(userId);

        // 3. Private Messaging (Refactored for Conversation Model)
        socket.on('join_room', ({ conversationId }) => {
            if (conversationId) {
                socket.join(conversationId);
                // console.log(`⚡ ${username} joined convo: ${conversationId}`);
            }
        });

        socket.on('send_message', async (data) => {
            try {
                // Support both old (userId) and new (conversationId) styles
                let { conversationId, receiverId, content, text, type = 'TEXT' } = data;

                const messageText = text || content; // Handle alias
                const finalType = type.toUpperCase();

                let convo;

                if (conversationId) {
                    convo = await import('./models/Conversation.js').then(m => m.default.findById(conversationId));
                    if (!convo) throw new Error('Conversation not found');

                    // Determine receiver from convo participants
                    receiverId = convo.participants.find(p => p.toString() !== userId).toString();
                } else if (receiverId) {
                    // Legacy/Direct fallback: Find or Create Convo
                    const Conversation = await import('./models/Conversation.js').then(m => m.default);
                    convo = await Conversation.findOne({
                        participants: { $all: [userId, receiverId] }
                    });

                    if (!convo) {
                        convo = await Conversation.create({
                            participants: [userId, receiverId],
                            unreadCounts: { [userId]: 0, [receiverId]: 0 }
                        });
                    }
                    conversationId = convo._id;
                } else {
                    throw new Error('No recipient specified');
                }

                // Save Message
                const newMessage = await Message.create({
                    conversationId,
                    senderId: userId,
                    receiver: receiverId, // Legacy field
                    text: messageText,
                    type: finalType,
                    isRead: false
                });

                // Update Conversation
                if (convo) {
                    convo.lastMessage = finalType === 'TEXT' ? messageText : `[${finalType}]`;
                    convo.updatedAt = new Date();

                    // Increment unread for receiver
                    const currentUnread = convo.unreadCounts.get(receiverId) || 0;
                    convo.unreadCounts.set(receiverId, currentUnread + 1);

                    await convo.save();
                }

                // Populate for frontend
                const populatedMsg = await newMessage.populate('senderId', 'name profileImage');

                // Emit to Conversation Room
                io.to(conversationId.toString()).emit('receive_message', populatedMsg);

                // Also upd chat list for both users (Real-time sort)
                const updatePayload = {
                    conversationId,
                    lastMessage: convo.lastMessage,
                    lastMessageTime: convo.updatedAt,
                    unreadIncrement: true // Hint for frontend to ++
                };

                io.to(userId).emit('update_chat_list', updatePayload);
                io.to(receiverId).emit('update_chat_list', updatePayload);

            } catch (err) {
                console.error('Message Send Error:', err);
                socket.emit('error', { message: 'Message failed to send' });
            }
        });

        // 4. Typing Indicators
        socket.on('typing_indicator', ({ conversationId, isTyping }) => {
            socket.to(conversationId).emit('typing_indicator', {
                conversationId,
                userId,
                isTyping
            });
        });

        socket.on('disconnect', () => {
            console.log(`🚫 Rider Disconnected: ${username}`);
            userSocketMap.delete(userId);
            socket.broadcast.emit('user_offline', { userId });
        });

        // 5. Public Rooms (Community Chat)
        socket.on('join_public_room', ({ room }) => {
            socket.join(room);
            // console.log(`⚡ [Socket] ${username} joined public room: ${room}`);
        });

        socket.on('leave_public_room', ({ room }) => {
            socket.leave(room);
            // console.log(`⚡ [Socket] ${username} left public room: ${room}`);
        });

        socket.on('send_public_message', ({ room, content }) => {
            // console.log(`💬 [Public] ${username} -> ${room}: ${content}`);
            io.to(room).emit('receive_public_message', {
                userId: userId,
                userName: username,
                userAvatar: socket.user.avatar,
                text: content,
                timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
            });
        });

        // 6. Event Specific Chat
        socket.on('join_event_room', ({ eventId }) => {
            const room = `event_${eventId}`;
            socket.join(room);
            // console.log(`⚡ [Socket] ${username} joined event room: ${room}`);
        });

        socket.on('leave_event_room', ({ eventId }) => {
            const room = `event_${eventId}`;
            socket.leave(room);
        });

        socket.on('send_event_message', async ({ eventId, content }) => {
            const room = `event_${eventId}`;
            const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

            try {
                // Save to DB
                const event = await MeetupEvent.findById(eventId);
                if (event) {
                    const newMessage = {
                        id: new mongoose.Types.ObjectId().toString(),
                        userId: userId,
                        userName: username,
                        text: content,
                        time: time
                    };
                    event.messages.push(newMessage);
                    await event.save();
                }
            } catch (err) {
                console.error('Error saving event message:', err);
            }

            io.to(room).emit('receive_event_message', {
                userId: userId,
                userName: username,
                text: content,
                time: time
            });
        });
    });

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized!');
    }
    return io;
};

// Helper: Send Notification via Socket
// Used by Controllers (User/Post)
export const sendNotification = (userId, type, payload) => {
    if (!io) return;
    io.to(userId.toString()).emit('new_notification', {
        type,
        ...payload,
        timestamp: new Date()
    });
};

export const getUserSocketId = (userId) => {
    return userSocketMap.get(userId.toString());
};
