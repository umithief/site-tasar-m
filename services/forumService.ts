
import { ForumTopic, ForumComment, User } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';
import { gamificationService, POINTS } from './gamificationService';

// Mock data fallback for Topics
const MOCK_TOPICS: ForumTopic[] = [
    {
        _id: 'TOPIC_001',
        authorId: 'system',
        authorName: 'MotoVibe Admin',
        title: 'MotoVibe Topluluğuna Hoş Geldiniz!',
        content: 'Merhaba arkadaşlar...',
        category: 'Genel',
        date: new Date().toLocaleDateString('tr-TR'),
        likes: 42,
        views: 1250,
        comments: [],
        tags: ['Duyuru']
    }
];

// MOCK_FEED removed
// MOCK_COMMENTS removed

export const forumService = {
    // --- TOPIC METHODS ---
    async getTopics(): Promise<ForumTopic[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(500);
            const topics = getStorage<ForumTopic[]>(DB.FORUM_TOPICS, []);
            if (topics.length === 0) {
                setStorage(DB.FORUM_TOPICS, MOCK_TOPICS);
                return MOCK_TOPICS;
            }
            return topics;
        } else {
            // REAL BACKEND
            try {
                const response = await fetch(`${CONFIG.API_URL}/forum`);
                if (!response.ok) return MOCK_TOPICS;
                return await response.json();
            } catch {
                return MOCK_TOPICS;
            }
        }
    },

    async createTopic(user: User, title: string, content: string, category: ForumTopic['category'], tags: string[]): Promise<ForumTopic> {
        if (CONFIG.USE_MOCK_API) {
            const newTopic: ForumTopic = {
                _id: `TOPIC_${Date.now()}`,
                authorId: user._id,
                authorName: user.name,
                title,
                content,
                category,
                date: new Date().toLocaleDateString('tr-TR'),
                likes: 0,
                views: 0,
                comments: [],
                tags
            };

            await delay(800);
            const topics = getStorage<ForumTopic[]>(DB.FORUM_TOPICS, []);
            topics.unshift(newTopic);
            setStorage(DB.FORUM_TOPICS, topics);

            await gamificationService.addPoints(user._id, POINTS.CREATE_TOPIC, 'Forum Konusu');

            return newTopic;
        } else {
            const newTopic = {
                authorId: user._id,
                authorName: user.name,
                title,
                content,
                category,
                date: new Date().toLocaleDateString('tr-TR'),
                tags
            };

            const response = await fetch(`${CONFIG.API_URL}/forum`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTopic)
            });
            await gamificationService.addPoints(user._id, POINTS.CREATE_TOPIC, 'Forum Konusu');
            return await response.json();
        }
    },

    async addComment(topicId: string, user: User, content: string): Promise<ForumComment> {
        if (CONFIG.USE_MOCK_API) {
            const newComment: ForumComment = {
                _id: `CMT_${Date.now()}`,
                authorId: user._id,
                authorName: user.name,
                content,
                date: new Date().toLocaleDateString('tr-TR'),
                likes: 0
            };

            await delay(500);
            const topics = getStorage<ForumTopic[]>(DB.FORUM_TOPICS, []);
            const topicIndex = topics.findIndex(t => t._id === topicId);
            if (topicIndex === -1) throw new Error('Konu bulunamadı');
            topics[topicIndex].comments.push(newComment);
            setStorage(DB.FORUM_TOPICS, topics);

            await gamificationService.addPoints(user._id, POINTS.ADD_COMMENT, 'Yorum');

            return newComment;
        } else {
            const newComment = {
                authorId: user._id,
                authorName: user.name,
                content
            };

            const response = await fetch(`${CONFIG.API_URL}/forum/${topicId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComment)
            });
            await gamificationService.addPoints(user._id, POINTS.ADD_COMMENT, 'Yorum');
            // The backend returns the updated TOPIC, but the frontend might expect the new COMMENT.
            // Let's assume frontend refreshes or we need to extract comment.
            // For now, returning full response might be issue if it's Topic.
            // Let's assume backend returns the topic with new comment at the end.
            const updatedTopic: ForumTopic = await response.json();
            // Return the last comment
            return updatedTopic.comments[updatedTopic.comments.length - 1];
        }
    },

    async toggleLike(topicId: string): Promise<void> {
        if (CONFIG.USE_MOCK_API) {
            const topics = getStorage<ForumTopic[]>(DB.FORUM_TOPICS, []);
            const topic = topics.find(t => t._id === topicId);
            if (topic) {
                topic.likes += 1;
                setStorage(DB.FORUM_TOPICS, topics);
            }
        } else {
            await fetch(`${CONFIG.API_URL}/forum/${topicId}/like`, {
                method: 'PUT'
            });
        }
    },

    async deleteTopic(id: string): Promise<void> {
        if (CONFIG.USE_MOCK_API) {
            const topics = getStorage<ForumTopic[]>(DB.FORUM_TOPICS, []);
            const filtered = topics.filter(t => t._id !== id);
            setStorage(DB.FORUM_TOPICS, filtered);
        } else {
            await fetch(`${CONFIG.API_URL}/forum/${id}`, {
                method: 'DELETE'
            });
        }
    },

    // --- SOCIAL FEED METHODS (New) ---

    // Paddock methods removed

    async followUser(userId: string): Promise<void> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            // In a real app, update current user's following list and target user's followers list
            await gamificationService.addPoints(userId, 20, 'Takip'); // Add points to target user (mock)
        } else {
            await fetch(`${CONFIG.API_URL}/users/${userId}/follow`, {
                method: 'POST'
            });
        }
    }
};