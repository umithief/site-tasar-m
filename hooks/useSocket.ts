import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = () => {
    const { token, user } = useAuthStore();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    
    useEffect(() => {
        if (!token) return;

        // Initialize Socket
        const socketInstance = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
            reconnection: true,
        });

        socketInstance.on('connect', () => {
            console.log('⚡ Socket connected:', socketInstance.id);
            setIsConnected(true);
            
            // Register user presence
            if (user) {
                socketInstance.emit('register_user', user._id);
            }
        });

        socketInstance.on('disconnect', () => {
            console.log('🔌 Socket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        setSocket(socketInstance);

        // Cleanup
        return () => {
            socketInstance.disconnect();
        };
    }, [token, user]);

    return { socket, isConnected };
};
