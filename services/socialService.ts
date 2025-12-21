import { CONFIG } from './config';
import { SocialPost } from '../types';

export const socialService = {
    async getFeed(): Promise<SocialPost[]> {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${CONFIG.API_URL}/social/feed`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Failed to fetch feed');
            const data = await response.json();
            return data.map((post: any) => ({
                ...post,
                commentList: post.comments || [],
                comments: post.commentCount || 0,
                likes: post.likeCount || 0
            }));
        } catch (error) {
            console.error('Get Feed Error:', error);
            return [];
        }
    },

    async createPost(postData: Partial<SocialPost>): Promise<SocialPost | null> {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${CONFIG.API_URL}/social`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${CONFIG.API_URL}/social/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${CONFIG.API_URL}/social/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
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
