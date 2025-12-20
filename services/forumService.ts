
import { ForumTopic, ForumComment, User, SocialPost } from '../types';
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

// Mock data for Social Feed
const MOCK_FEED: SocialPost[] = [
    {
        _id: 'post_1',
        userId: 'u101',
        userName: 'Canberk Hız',
        content: 'Bugün Riva yolları efsaneydi! 🔥 Herkese iyi pazarlar.',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200&auto=format&fit=crop',
        likes: 124,
        comments: 1,
        timestamp: '2 saat önce',
        isLiked: false
    },
    {
        _id: 'post_2',
        userId: 'u102',
        userName: 'Zeynep Yılmaz',
        content: 'Yeni kaskım geldi! AeroSpeed Carbon Pro gerçekten çok hafif. Tavsiye ederim.',
        image: 'https://images.unsplash.com/photo-1592758215894-3298a49339d6?q=80&w=800&auto=format&fit=crop',
        likes: 89,
        comments: 0,
        timestamp: '5 saat önce',
        isLiked: true
    },
    {
        _id: 'post_3',
        userId: 'u103',
        userName: 'Mehmet Demir',
        content: 'Zincir bakımı ihmale gelmez. Temizlik günü! 🧼',
        likes: 45,
        comments: 0,
        timestamp: '1 gün önce',
        isLiked: false
    }
];

// Mock Comments Store: { [postId]: ForumComment[] }
const MOCK_COMMENTS: Record<string, ForumComment[]> = {
    'post_1': [
        {
            _id: 'cmt_101',
            authorId: 'u102',
            authorName: 'Zeynep Yılmaz',
            content: 'Harika görünüyor kaptan! Bir dahaki sefere ben de geliyorum. 🏍️',
            date: '1 saat önce',
            likes: 5
        }
    ]
};

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

    async getFeed(): Promise<SocialPost[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(400);
            const localPosts = getStorage<SocialPost[]>('mv_social_feed', []);
            // Merge mock comments logic potentially, but better to fetch on expand
            return [...localPosts, ...MOCK_FEED];
        } else {
            // REAL BACKEND
            try {
                const response = await fetch(`${CONFIG.API_URL}/social`);
                if (!response.ok) return MOCK_FEED;
                return await response.json();
            } catch {
                return MOCK_FEED;
            }
        }
    },

    async getSocialComments(postId: string): Promise<ForumComment[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const allComments = getStorage<Record<string, ForumComment[]>>('mv_social_comments', MOCK_COMMENTS);
            return allComments[postId] || [];
        } else {
            const response = await fetch(`${CONFIG.API_URL}/social/${postId}/comments`);
            if (!response.ok) return [];
            return await response.json();
        }
    },

    async addSocialComment(postId: string, user: User, content: string): Promise<ForumComment> {
        if (CONFIG.USE_MOCK_API) {
            await delay(400);
            const newComment: ForumComment = {
                _id: `scm_${Date.now()}`,
                authorId: user._id,
                authorName: user.name,
                content,
                date: 'Şimdi',
                likes: 0
            };

            const allComments = getStorage<Record<string, ForumComment[]>>('mv_social_comments', MOCK_COMMENTS);
            if (!allComments[postId]) allComments[postId] = [];
            allComments[postId].push(newComment);
            setStorage('mv_social_comments', allComments);

            // Update comment count on post
            const localPosts = getStorage<SocialPost[]>('mv_social_feed', []);
            const postIndex = localPosts.findIndex(p => p._id === postId);
            if (postIndex >= 0) {
                localPosts[postIndex].comments += 1;
                setStorage('mv_social_feed', localPosts);
            }

            await gamificationService.addPoints(user._id, 5, 'Yorum (Paddock)');
            return newComment;
        } else {
            const newComment = {
                authorId: user._id,
                authorName: user.name,
                content
            };
            const response = await fetch(`${CONFIG.API_URL}/social/${postId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newComment)
            });
            await gamificationService.addPoints(user._id, 5, 'Yorum (Paddock)');
            return await response.json();
        }
    },

    async createSocialPost(user: User, content: string, image?: string): Promise<SocialPost> {
        if (CONFIG.USE_MOCK_API) {
            await delay(600);
            const newPost: SocialPost = {
                _id: `post_${Date.now()}`,
                userId: user._id,
                userName: user.name,
                content,
                image,
                likes: 0,
                comments: 0,
                timestamp: 'Şimdi',
                isLiked: false
            };
            const localPosts = getStorage<SocialPost[]>('mv_social_feed', []);
            localPosts.unshift(newPost);
            setStorage('mv_social_feed', localPosts);

            await gamificationService.addPoints(user._id, 15, 'Sosyal Paylaşım');
            return newPost;
        } else {
            // REAL BACKEND
            const newPost = {
                userId: user._id,
                userName: user.name,
                content,
                image
            };

            const response = await fetch(`${CONFIG.API_URL}/social`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPost)
            });
            await gamificationService.addPoints(user._id, 15, 'Sosyal Paylaşım');
            return await response.json();
        }
    },

    async likeSocialPost(postId: string): Promise<void> {
        if (CONFIG.USE_MOCK_API) {
            return;
        } else {
            await fetch(`${CONFIG.API_URL}/social/${postId}/like`, {
                method: 'PUT'
            });
        }
    },

    async deleteSocialPost(postId: string): Promise<void> {
        if (CONFIG.USE_MOCK_API) {
            const localPosts = getStorage<SocialPost[]>('mv_social_feed', []);
            const filtered = localPosts.filter(p => p._id !== postId);
            setStorage('mv_social_feed', filtered);
        } else {
            await fetch(`${CONFIG.API_URL}/social/${postId}`, {
                method: 'DELETE'
            });
        }
    },

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