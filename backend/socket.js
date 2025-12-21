import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Message from './models/Message.js';

let io;
const userSocketMap = new Map(); // userId -> socketId

export const initSync = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: "*", // Adjust for production
            methods: ["GET", "POST"]
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

        // 3. Private Messaging
        socket.on('send_message', async (data) => {
            try {
                const { receiverId, content, type = 'text', mediaUrl } = data;

                // Save to DB
                const newMessage = await Message.create({
                    sender: userId,
                    receiver: receiverId,
                    content,
                    type,
                    mediaUrl
                });

                // Emit to Receiver
                // Option A: Use Room (Preferred)
                io.to(receiverId).emit('receive_message', {
                    message: newMessage,
                    sender: { _id: userId, name: username, avatar: socket.user.avatar }
                });

                // Option B: Use Socket Map (Fallback)
                const receiverSocketId = userSocketMap.get(receiverId);
                if (receiverSocketId) {
                    // console.log(`📨 [Socket] Pushing private message to socket: ${receiverSocketId}`);
                } else {
                    console.warn(`⚠️ [Socket] Receiver ${receiverId} not found in socket map (Offline?)`);
                }

                // Ack to Sender
                socket.emit('message_sent', newMessage);

            } catch (err) {
                console.error('Message Send Error:', err);
                socket.emit('error', { message: 'Message failed to send' });
            }
        });

        // 4. Typing Indicators
        socket.on('typing_start', ({ receiverId }) => {
            io.to(receiverId).emit('user_typing', { userId, isTyping: true });
        });

        socket.on('typing_stop', ({ receiverId }) => {
            io.to(receiverId).emit('user_typing', { userId, isTyping: false });
        });

        socket.on('disconnect', () => {
            console.log(`🚫 Rider Disconnected: ${username}`);
            userSocketMap.delete(userId);
            socket.broadcast.emit('user_offline', { userId });
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
