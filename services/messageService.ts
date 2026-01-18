import { api } from './api';
import { ChatThread, SocialChatMessage } from '../types';

export const messageService = {
    getThreads: async (): Promise<ChatThread[]> => {
        try {
            const response = await api.get('/messages/threads');
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to fetch threads:', error);
            return [];
        }
    },

    getConversation: async (userId: string): Promise<SocialChatMessage[]> => {
        try {
            const response = await api.get(`/messages/${userId}`);
            return response.data.data || [];
        } catch (error) {
            console.error('Failed to fetch conversation:', error);
            return [];
        }
    },

    sendMessage: async (receiverId: string, content: string, type: 'text' | 'image' | 'location' = 'text'): Promise<SocialChatMessage | null> => {
        try {
            const response = await api.post('/messages', { receiverId, content, type });
            return response.data.data;
        } catch (error) {
            console.error('Failed to send message:', error);
            throw error;
        }
    }
};
