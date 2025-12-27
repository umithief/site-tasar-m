import { api } from './api';

export interface Notification {
    _id: string;
    recipient: string;
    sender: {
        _id: string;
        name: string;
        username: string;
        avatar: string;
    };
    type: 'LIKE' | 'COMMENT' | 'FOLLOW';
    post?: {
        _id: string;
        mediaUrl: string;
        type: 'image' | 'video';
    };
    commentId?: string;
    isRead: boolean;
    createdAt: string;
}

export const notificationService = {
    getNotifications: (page = 1, limit = 20) => {
        return api.get(`/notifications?page=${page}&limit=${limit}`);
    },

    markAsRead: (id: string) => {
        return api.put(`/notifications/${id}/read`);
    },

    markAllAsRead: () => {
        return api.put('/notifications/read-all');
    },

    deleteNotification: (id: string) => {
        return api.delete(`/notifications/${id}`);
    }
};
