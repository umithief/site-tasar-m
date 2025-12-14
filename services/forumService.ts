

import { ForumTopic, ForumComment, User, SocialPost } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';
import { gamificationService, POINTS } from './gamificationService';

// Mock data fallback for Topics
const MOCK_TOPICS: ForumTopic[] = [
  {
    id: 'TOPIC-001',
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
        id: 'post-1',
        userId: 'u101',
        userName: 'Canberk Hız',
        content: 'Bugün Riva yolları efsaneydi! 🔥 Herkese iyi pazarlar.',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1200&auto=format&fit=crop',
        likes: 124,
        comments: 12,
        timestamp: '2 saat önce',
        isLiked: false
    },
    {
        id: 'post-2',
        userId: 'u102',
        userName: 'Zeynep Yılmaz',
        content: 'Yeni kaskım geldi! AeroSpeed Carbon Pro gerçekten çok hafif. Tavsiye ederim.',
        image: 'https://images.unsplash.com/photo-1592758215894-3298a49339d6?q=80&w=800&auto=format&fit=crop',
        likes: 89,
        comments: 5,
        timestamp: '5 saat önce',
        isLiked: true
    },
    {
        id: 'post-3',
        userId: 'u103',
        userName: 'Mehmet Demir',
        content: 'Zincir bakımı ihmale gelmez. Temizlik günü! 🧼',
        likes: 45,
        comments: 2,
        timestamp: '1 gün önce',
        isLiked: false
    }
];

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
            const response = await fetch(`${CONFIG.API_URL}/forum/topics`);
            if (!response.ok) return MOCK_TOPICS;
            return await response.json();
        } catch {
            return MOCK_TOPICS;
        }
    }
  },

  async createTopic(user: User, title: string, content: string, category: ForumTopic['category'], tags: string[]): Promise<ForumTopic> {
    const newTopic: ForumTopic = {
      id: `TOPIC-${Date.now()}`,
      authorId: user.id,
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

    if (CONFIG.USE_MOCK_API) {
        await delay(800);
        const topics = getStorage<ForumTopic[]>(DB.FORUM_TOPICS, []);
        topics.unshift(newTopic);
        setStorage(DB.FORUM_TOPICS, topics);
        
        await gamificationService.addPoints(user.id, POINTS.CREATE_TOPIC, 'Forum Konusu');
        
        return newTopic;
    } else {
        const response = await fetch(`${CONFIG.API_URL}/forum/topics`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newTopic)
        });
        await gamificationService.addPoints(user.id, POINTS.CREATE_TOPIC, 'Forum Konusu');
        return await response.json();
    }
  },

  async addComment(topicId: string, user: User, content: string): Promise<ForumComment> {
    const newComment: ForumComment = {
      id: `CMT-${Date.now()}`,
      authorId: user.id,
      authorName: user.name,
      content,
      date: new Date().toLocaleDateString('tr-TR'),
      likes: 0
    };

    if (CONFIG.USE_MOCK_API) {
        await delay(500);
        const topics = getStorage<ForumTopic[]>(DB.FORUM_TOPICS, []);
        const topicIndex = topics.findIndex(t => t.id === topicId);
        if (topicIndex === -1) throw new Error('Konu bulunamadı');
        topics[topicIndex].comments.push(newComment);
        setStorage(DB.FORUM_TOPICS, topics);
        
        await gamificationService.addPoints(user.id, POINTS.ADD_COMMENT, 'Yorum');

        return newComment;
    } else {
        const response = await fetch(`${CONFIG.API_URL}/forum/topics/${topicId}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newComment)
        });
        await gamificationService.addPoints(user.id, POINTS.ADD_COMMENT, 'Yorum');
        return await response.json();
    }
  },

  async toggleLike(topicId: string): Promise<void> {
    if (CONFIG.USE_MOCK_API) {
        const topics = getStorage<ForumTopic[]>(DB.FORUM_TOPICS, []);
        const topic = topics.find(t => t.id === topicId);
        if (topic) {
            topic.likes += 1;
            setStorage(DB.FORUM_TOPICS, topics);
        }
    } else {
        await fetch(`${CONFIG.API_URL}/forum/topics/${topicId}/like`, {
            method: 'POST'
        });
    }
  },

  // --- SOCIAL FEED METHODS (New) ---
  
  async getFeed(): Promise<SocialPost[]> {
      // In a real app, this would fetch from backend. Here we return mock + local storage
      if (CONFIG.USE_MOCK_API) {
          await delay(400);
          const localPosts = getStorage<SocialPost[]>('mv_social_feed', []);
          return [...localPosts, ...MOCK_FEED]; // Merge new local posts with mock
      }
      return MOCK_FEED;
  },

  async createSocialPost(user: User, content: string, image?: string): Promise<SocialPost> {
      const newPost: SocialPost = {
          id: `post-${Date.now()}`,
          userId: user.id,
          userName: user.name,
          content,
          image,
          likes: 0,
          comments: 0,
          timestamp: 'Şimdi',
          isLiked: false
      };

      if (CONFIG.USE_MOCK_API) {
          await delay(600);
          const localPosts = getStorage<SocialPost[]>('mv_social_feed', []);
          localPosts.unshift(newPost);
          setStorage('mv_social_feed', localPosts);
          
          await gamificationService.addPoints(user.id, 15, 'Sosyal Paylaşım');
          return newPost;
      }
      // Placeholder for real backend
      return newPost;
  },

  async likeSocialPost(postId: string): Promise<void> {
      // Simple mock logic
      return;
  }
};