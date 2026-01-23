import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
// 1. Map User
import MeetupEvent from './models/MeetupEvent.js';
import mongoose from 'mongoose';

let io;
const userSocketMap = new Map(); // userId -> socketId
const activeRiders = new Map(); // userId -> { lat, lng, speed, bearing }

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

        socket.on('disconnect', () => {
            console.log(`🚫 Rider Disconnected: ${username}`);
            userSocketMap.delete(userId);
            activeRiders.delete(userId); // Remove from tracking
            socket.broadcast.emit('user_offline', { userId });
            socket.broadcast.emit('rider_left', { userId }); // Notify map
        });

        // --- 3. LIVE RIDE TRACKING ---
        socket.on('update_location', ({ lat, lng, speed, bearing }) => {
            // Update in memory
            activeRiders.set(userId, {
                id: userId,
                name: username,
                lat,
                lng,
                speed,
                bearing,
                lastUpdate: Date.now()
            });

            // Broadcast to everyone (or room 'riders')
            socket.broadcast.emit('rider_moved', {
                userId,
                name: username,
                lat,
                lng,
                speed,
                bearing
            });
        });

        // Send initial state to the connecting user
        socket.emit('active_riders_snapshot', Array.from(activeRiders.values()));

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
