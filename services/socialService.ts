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
    },

    async getUserProfile(userId: string): Promise<any> {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${CONFIG.API_URL}/users/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch user profile');
            return await response.json();
        } catch (error) {
            console.error('Get Profile Error:', error);
            return null;
        }
    },

    async getUserPosts(userId: string): Promise<SocialPost[]> {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${CONFIG.API_URL}/social/user/${userId}/posts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch user posts');
            const data = await response.json();

            // Handle both array and { data: { posts: [] } } formats
            const posts = Array.isArray(data) ? data : (data.data?.posts || []);

            return posts.map((post: any) => ({
                ...post,
                commentList: post.comments || [],
                comments: post.commentCount || 0,
                likes: post.likeCount || 0,
                // Ensure isLiked is correctly set if backend returns it
                isLiked: post.isLiked || false
            }));
        } catch (error) {
            console.error('Get User Posts Error:', error);
            return [];
        }
    },
    async toggleFollow(targetUserId: string): Promise<{ isFollowing: boolean } | null> {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`${CONFIG.API_URL}/users/follow/${targetUserId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error('Toggle Follow Failed');
            const data = await response.json();
            return data.data; // Should return { isFollowing: boolean }
        } catch (error) {
            console.error('Toggle Follow Error:', error);
            return null;
        }
    },

    async getSuggestedRiders(): Promise<any[]> {
        const token = localStorage.getItem('token');
        try {
            // Fetch users, perhaps exclude current user on backend or frontend
            const response = await fetch(`${CONFIG.API_URL}/users`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Failed to fetch suggestions');
            const data = await response.json();
            // Backend returns array of user objects for GET /users
            const users = Array.isArray(data) ? data : (data.data?.users || data.users || []);

            // Limit to 5 for the sidebar and basic mapping
            return users.slice(0, 5).map((u: any) => ({
                id: u._id,
                name: u.name,
                bike: u.garage && u.garage.length > 0 ? `${u.garage[0].brand} ${u.garage[0].model}` : 'Motor Tutkunu',
                avatar: u.profileImage || u.avatar
            }));
        } catch (error) {
            console.error('Get Suggestions Error:', error);
            return [];
        }
    }
};
