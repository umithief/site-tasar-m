import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CONFIG } from '../services/config';

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    onlineUsers: []
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token'); // Assumes authService saves it here
        if (!token) return;

        // Initialize Socket
        // Ensure CONFIG.API_URL points to backend base URL (e.g. http://localhost:5000)
        // Adjust if your API_URL includes /api suffix
        const socketUrl = CONFIG.API_URL.replace('/api', '');

        const socketInstance = io(socketUrl, {
            auth: { token },
            query: { token },
            reconnection: true,
        });

        socketInstance.on('connect', () => {
            console.log('⚡ Socket connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('disconnect', () => {
            console.log('🚫 Socket disconnected');
            setIsConnected(false);
        });

        socketInstance.on('user_online', (data: { userId: string }) => {
            // For simplicity, just logging or handling a list if backend broadcasts full list
            // Backend currently broadcasts single user online event
            // To maintain a list, we'd need more robust state management
            // For now, simpler implementation
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
