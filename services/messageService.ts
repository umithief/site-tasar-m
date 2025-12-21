import { CONFIG } from './config';
import { SocialChatMessage, ChatThread } from '../types';

export const messageService = {
    // Get conversation with a specific user
    async getConversation(userId: string): Promise<SocialChatMessage[]> {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${CONFIG.API_URL}/messages/${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch messages');
            const data = await response.json();

            // Map backend message format to frontend SocialChatMessage
            // Backend: sender (ID), receiver (ID), content, timestamp
            // Frontend: id, senderId, text, timestamp (string), isRead, type
            return data.data.map((msg: any) => ({
                id: msg._id,
                senderId: msg.sender,
                text: msg.content,
                timestamp: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                isRead: msg.isRead || true,
                type: msg.type || 'text'
            }));
        } catch (error) {
            console.error('Get Conversation Error:', error);
            return [];
        }
    },

    // Send a message via HTTP (persistence)
    // Note: Start using Socket.io for immediate sending in UI, but this is backup/persistence if needed
    // However, our backend socket.js handles persistence if sent via socket?
    // Wait, let's verify socket.js in step 1190.
    // socket.on('send_message') DOES persist to DB.
    // So we DON'T need an HTTP send endpoint if we use socket.emit('send_message').
    // BUT we might want one for robustness or if socket fails.
    // The backend route router.post('/', messageController.sendMessage) exists.
    // Let's implement it here as 'sendMessageHttp' just in case, but prefer Socket in UI.
    async sendMessageHttp(receiverId: string, content: string) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${CONFIG.API_URL}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ receiverId, content })
            });
            return await response.json();
        } catch (error) {
            console.error('Send Message Error:', error);
            return null;
        }
    },

    // Get list of active threads (recent conversations)
    async getThreads(): Promise<ChatThread[]> {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${CONFIG.API_URL}/messages/threads`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch threads');
            const data = await response.json();
            return data.data; // Assuming backend returns { status: 'success', data: [...] }
        } catch (error) {
            console.error('Get Threads Error:', error);
            return [];
        }
    }
};
