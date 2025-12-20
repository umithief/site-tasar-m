import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';

let io;

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
            // Get token from handshake auth or query
            const token = socket.handshake.auth.token || socket.handshake.query.token;

            if (!token) return next(new Error('Authentication error: No token'));

            const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli-anahtar-123'); // Match server.js secret
            const user = await User.findById(decoded.id);

            if (!user) return next(new Error('User not found'));

            socket.user = user;
            next();
        } catch (err) {
            console.error('Socket Auth Error:', err.message);
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        const username = socket.user ? socket.user.username || socket.user.name : 'Unknown';
        console.log(`⚡ Premium Rider Joined: ${username} (${socket.id})`);

        // Join a private room with own User ID to receive personal messages/notifs
        if (socket.user) {
            socket.join(socket.user._id.toString());

            // Handle connection status
            socket.broadcast.emit('user_online', { userId: socket.user._id });
        }

        // Private Message Event
        // In a real scalability scenario, use Redis adapter.
        // For MERN logic, we rely on client sending the message via HTTP API to persist DB, 
        // AND then we emit via socket, or we do everything via socket.
        // The implementation plan says: "implement send_message in backend/controllers/messageController.js"
        // So HTTP is primary. Socket is for notification.
        // We will expose a helper to emit events from controllers.

        socket.on('disconnect', () => {
            if (socket.user) {
                console.log(`🚫 Rider Disconnected: ${username}`);
                socket.broadcast.emit('user_offline', { userId: socket.user._id });
            }
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
