import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CONFIG } from '../services/config';
import { useNotificationStore } from '../store/useNotificationStore';
import { notify } from '../services/notificationService';

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
    const socketRef = React.useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.warn('🔌 [Socket] No token found, skipping connection');
            return;
        }

        // Prevent double initialization
        if (socketRef.current) {
            console.log('🔌 [Socket] reusing existing connection');
            return;
        }

        console.log('🔌 [Socket] Initializing connection...');

        // Initialize Socket
        const socketUrl = CONFIG.API_URL.replace('/api', '');

        const socketInstance = io(socketUrl, {
            auth: { token },
            query: { token },
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketInstance.on('connect', () => {
            console.log('⚡ [Socket] Connected:', socketInstance.id);
            setIsConnected(true);
        });

        socketInstance.on('connect_error', (err) => {
            console.error('❌ [Socket] Connection Error:', err.message);
        });

        socketInstance.on('disconnect', (reason) => {
            console.log('🚫 [Socket] Disconnected:', reason);
            setIsConnected(false);
            if (reason === 'io server disconnect') {
                // If server disconnects (e.g. invalid token), don't auto reconnect?
                // socketInstance.connect();
            }
        });

        socketInstance.on('user_online', (data: { userId: string }) => {
            console.debug('🟢 [Socket] User Online:', data.userId);
        });

        socketInstance.on('new_notification', (notification) => {
            console.log('🔔 [Socket] New Notification:', notification);
            useNotificationStore.getState().addNotification(notification);
            notify.success('Yeni bir bildiriminiz var!');
        });

        socketRef.current = socketInstance;
        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            if (socketRef.current) {
                console.log('🔌 [Socket] Cleaning up connection');
                socketRef.current.disconnect();
                socketRef.current = null;
                setSocket(null);
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
};
