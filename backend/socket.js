import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
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
