import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { CONFIG } from '../services/config';
import { useNotificationStore } from '../store/useNotificationStore';
import { notify } from '../services/notificationService';
import { NotificationToastUI } from '../components/ui/NotificationToast';

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

    const [activeNotification, setActiveNotification] = useState<any>(null);

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

        socketInstance.on('new_notification', (data) => {
            console.log('🔔 [Socket] New Notification:', data);

            // Normalize data to match store interface (nested sender object)
            const normalizedNotification = {
                ...data,
                sender: data.sender || {
                    _id: data.senderId,
                    name: data.senderName,
                    avatar: data.senderAvatar,
                    username: data.senderName // fallback
                }
            };

            useNotificationStore.getState().addNotification(normalizedNotification);
            setActiveNotification(normalizedNotification);
            // Optional: Play sound here
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
            {/* Global Notification Toast */}
            {import.meta.env.MODE !== 'test' && (
                <React.Suspense fallback={null}>
                    {/* Lazy load helps? Or just direct import is fine since it's small */}
                    {activeNotification && (
                        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 9999, pointerEvents: 'none' }}>
                            <div style={{ pointerEvents: 'auto' }}>
                                {/* We need to import NotificationToastUI. It's not imported yet. 
                                    I will include the import at the top of the file in a separate edit or assume I can do it here if I rewrite imports.
                                    Actually, I should rewrite the whole file or huge chunk to include imports.
                                    Let me do a smaller edit for the state/effect and a separate valid one for imports + rendering.
                                    Wait, I can just use the replace_file_content to swap the whole component body if needed, but imports are at top.
                                 */}
                            </div>
                        </div>
                    )}
                </React.Suspense>
            )}
            <NotificationToastUI
                notification={activeNotification}
                visible={!!activeNotification}
                onDismiss={() => setActiveNotification(null)}
            />
        </SocketContext.Provider>
    );
};
