import { CONFIG } from './config';
import { SocialPost } from '../types';

export const socialService = {
    async getFeed(): Promise<SocialPost[]> {
        try {
            const response = await fetch(`${CONFIG.API_URL}/social`);
            if (!response.ok) throw new Error('Failed to fetch feed');
            const data = await response.json();
            return data.map((post: any) => ({
                ...post,
                commentList: post.commentList || []
            }));
        } catch (error) {
            console.error('Get Feed Error:', error);
            // Fallback to empty array or mock if needed during dev
            return [];
        }
    },

    async createPost(postData: Partial<SocialPost>): Promise<SocialPost | null> {
        try {
            const response = await fetch(`${CONFIG.API_URL}/social`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(postData)
            });
            if (!response.ok) throw new Error('Create Post Failed');
            return await response.json();
        } catch (error) {
            console.error('Create Post Error:', error);
            return null;
        }
    },

    async likePost(postId: string, userId: string): Promise<SocialPost | null> {
        try {
            const response = await fetch(`${CONFIG.API_URL}/social/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });
            if (!response.ok) throw new Error('Like Failed');
            return await response.json();
        } catch (error) {
            console.error('Like Error:', error);
            return null;
        }
    },

    async commentPost(postId: string, commentData: { authorId: string; authorName: string; content: string }): Promise<SocialPost | null> {
        try {
            const response = await fetch(`${CONFIG.API_URL}/social/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(commentData)
            });
            if (!response.ok) throw new Error('Comment Failed');
            return await response.json();
        } catch (error) {
            console.error('Comment Error:', error);
            return null;
        }
    }
};
