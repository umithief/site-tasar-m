import { create } from 'zustand';
import { notificationService, Notification } from '../services/notificationApiService';

interface NotificationState {
    notifications: Notification[];
    unreadCount: number;
    isLoading: boolean;
    error: string | null;

    fetchNotifications: () => Promise<void>;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    deleteNotification: (id: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null,

    fetchNotifications: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await notificationService.getNotifications();
            const { notifications, totalUnread } = response.data;
            set({ notifications, unreadCount: totalUnread, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
        }
    },

    addNotification: (notification) => {
        set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1
        }));
    },

    markAsRead: async (id) => {
        // Optimistic update
        set((state) => {
            const notification = state.notifications.find(n => n._id === id);
            if (!notification || notification.isRead) return state;

            return {
                notifications: state.notifications.map(n =>
                    n._id === id ? { ...n, isRead: true } : n
                ),
                unreadCount: Math.max(0, state.unreadCount - 1)
            };
        });

        try {
            await notificationService.markAsRead(id);
        } catch (error) {
            console.error('Failed to mark as read', error);
            // Revert could be implemented here if strict consistency is needed
        }
    },

    markAllAsRead: async () => {
        // Optimistic update
        set((state) => ({
            notifications: state.notifications.map(n => ({ ...n, isRead: true })),
            unreadCount: 0
        }));

        try {
            await notificationService.markAllAsRead();
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    },

    deleteNotification: async (id) => {
        // Optimistic update
        set((state) => {
            const notification = state.notifications.find(n => n._id === id);
            const wasUnread = notification && !notification.isRead;

            return {
                notifications: state.notifications.filter(n => n._id !== id),
                unreadCount: wasUnread ? Math.max(0, state.unreadCount - 1) : state.unreadCount
            };
        });

        try {
            await notificationService.deleteNotification(id);
        } catch (error) {
            console.error('Failed to delete notification', error);
        }
    }
}));
