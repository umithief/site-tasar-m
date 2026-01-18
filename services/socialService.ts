import { CONFIG } from './config';
import { SocialPost } from '../types';

export const socialService = {
    async getFeed(): Promise<SocialPost[]> {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token && token !== 'null' && token !== 'undefined') {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${CONFIG.API_URL}/social/feed`, {
                headers
            });
            if (!response.ok) throw new Error('Failed to fetch feed');
            const data = await response.json();

            // Handle both array and object { data: [], ... } formats
            const posts = Array.isArray(data) ? data : (data.data || data.posts || []);

            return posts.map((post: any) => ({
                ...post,
                userId: post.user?._id || post.user,
                userName: post.user?.name || post.userName || 'Anonim',
                userAvatar: post.user?.avatar || post.userAvatar || '',
                userRank: post.user?.rank || post.userRank,
                commentList: post.comments || [],
                comments: post.commentCount || 0,
                likes: post.likeCount || 0,
                rideStats: post.rideStats || {
                    maxSpeed: Math.floor(Math.random() * (299 - 120) + 120),
                    avgSpeed: Math.floor(Math.random() * (100 - 60) + 60),
                    leanAngle: Math.floor(Math.random() * (45 - 20) + 20),
                    distance: parseFloat((Math.random() * 150).toFixed(1)),
                    duration: `${Math.floor(Math.random() * 4)}h ${Math.floor(Math.random() * 60)}m`
                }
            }));
        } catch (error) {
            console.error('Get Feed Error:', error);
            return [];
        }
    },

    async createPost(postData: Partial<SocialPost>): Promise<SocialPost | null> {
        const token = localStorage.getItem('token');
        if (!token) return null; // Auth required

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
        if (!token) return null;

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

    async commentPost(postId: string, content: string): Promise<any> {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const response = await fetch(`${CONFIG.API_URL}/social/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            if (!response.ok) throw new Error('Comment Failed');
            return await response.json();
        } catch (error) {
            console.error('Comment Error:', error);
            return null;
        }
    },

    async getComments(postId: string): Promise<any[]> {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(`${CONFIG.API_URL}/social/${postId}/comments`, {
                headers
            });
            if (!response.ok) throw new Error('Get Comments Failed');
            const data = await response.json();
            return data.data?.comments || [];
        } catch (error) {
            console.error('Get Comments Error:', error);
            return [];
        }
    },

    async getUserProfile(userId: string): Promise<any> {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(`${CONFIG.API_URL}/users/${userId}`, {
                headers
            });
            if (!response.ok) throw new Error('Failed to fetch user profile');
            const data = await response.json();
            return data.data?.user || data.user || data;
        } catch (error) {
            console.error('Get Profile Error:', error);
            return null;
        }
    },

    async getUserPosts(userId: string): Promise<SocialPost[]> {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(`${CONFIG.API_URL}/social/user/${userId}/posts`, {
                headers
            });
            if (!response.ok) throw new Error('Failed to fetch user posts');
            const data = await response.json();

            // Handle both array and { data: { posts: [] } } formats
            const posts = Array.isArray(data) ? data : (data.data?.posts || []);

            return posts.map((post: any) => ({
                ...post,
                userId: post.user?._id || post.user,
                userName: post.user?.name || post.userName || 'Anonim',
                userAvatar: post.user?.avatar || post.userAvatar || '',
                userRank: post.user?.rank || post.userRank,
                commentList: post.comments || [],
                comments: post.commentCount || 0,
                likes: post.likeCount || 0,
                // Ensure isLiked is correctly set if backend returns it
                isLiked: post.isLiked || false,
                rideStats: post.rideStats || {
                    maxSpeed: Math.floor(Math.random() * (299 - 120) + 120),
                    avgSpeed: Math.floor(Math.random() * (100 - 60) + 60),
                    leanAngle: Math.floor(Math.random() * (45 - 20) + 20),
                    distance: parseFloat((Math.random() * 150).toFixed(1)),
                    duration: `${Math.floor(Math.random() * 4)}h ${Math.floor(Math.random() * 60)}m`
                }
            }));
        } catch (error) {
            console.error('Get User Posts Error:', error);
            return [];
        }
    },
    async toggleFollow(targetUserId: string): Promise<{ isFollowing: boolean } | null> {
        const token = localStorage.getItem('token');
        if (!token) return null;

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
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            // Fetch users, perhaps exclude current user on backend or frontend
            const response = await fetch(`${CONFIG.API_URL}/users`, {
                headers
            });
            if (!response.ok) throw new Error('Failed to fetch suggestions');
            const data = await response.json();
            // Backend returns array of user objects for GET /users
            const users = Array.isArray(data) ? data : (data.data?.users || data.users || []);

            // Limit to 5 for the sidebar and basic mapping
            return users.slice(0, 5).map((u: any) => ({
                _id: u._id,
                name: u.name,
                bike: u.garage && u.garage.length > 0 ? `${u.garage[0].brand} ${u.garage[0].model}` : 'Motor Tutkunu',
                avatar: u.profileImage || u.avatar
            }));
        } catch (error) {
            console.error('Get Suggestions Error:', error);
            return [];
        }
    },

    async search(query: string): Promise<{ users: any[], rides: any[], routes: any[], hashtags: string[] }> {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            const response = await fetch(`${CONFIG.API_URL}/social/search?q=${encodeURIComponent(query)}`, {
                headers
            });
            if (!response.ok) throw new Error('Search Failed');
            const data = await response.json();
            return {
                users: data.users || [],
                rides: data.rides || [],
                routes: data.routes || [],
                hashtags: data.hashtags || []
            };
        } catch (error) {
            console.error('Search Error:', error);
            return { users: [], rides: [], routes: [], hashtags: [] };
        }
    },

    async getExploreFeed(cursor: number = 0, category?: string, query?: string): Promise<SocialPost[]> {
        const token = localStorage.getItem('token');
        const headers: HeadersInit = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        try {
            let url = `${CONFIG.API_URL}/social/explore?cursor=${cursor}`;
            if (category && category !== 'ALL') {
                url += `&category=${encodeURIComponent(category)}`;
            }
            if (query) {
                url += `&q=${encodeURIComponent(query)}`;
            }

            const response = await fetch(url, {
                headers
            });

            if (!response.ok) {
                // Fallback to regular feed if explore endpoint doesn't exist yet
                return this.getFeed();
            }

            const data = await response.json();
            const posts = Array.isArray(data) ? data : (data.data || data.posts || []);

            return posts.map((post: any) => ({
                ...post,
                userId: post.user?._id || post.user,
                userName: post.user?.name || post.userName || 'Anonim',
                userAvatar: post.user?.avatar || post.userAvatar || '',
                userRank: post.user?.rank || post.userRank,
                commentList: post.comments || [],
                comments: post.commentCount || 0,
                likes: post.likeCount || 0,
                isLiked: post.isLiked || false,
                rideStats: post.rideStats || {
                    maxSpeed: Math.floor(Math.random() * (299 - 120) + 120),
                    avgSpeed: Math.floor(Math.random() * (100 - 60) + 60),
                    leanAngle: Math.floor(Math.random() * (45 - 20) + 20),
                    distance: parseFloat((Math.random() * 150).toFixed(1)),
                    duration: `${Math.floor(Math.random() * 4)}h ${Math.floor(Math.random() * 60)}m`
                }
            }));
        } catch (error) {
            console.error('Explore Feed Error:', error);
            return this.getFeed(); // Fallback
        }
    },

    async deletePost(postId: string): Promise<boolean> {
        const token = localStorage.getItem('token');
        if (!token) return false;

        try {
            const response = await fetch(`${CONFIG.API_URL}/social/${postId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.ok;
        } catch (error) {
            console.error('Delete Post Error:', error);
            return false;
        }
    },

    async updatePost(postId: string, content: string): Promise<SocialPost | null> {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const response = await fetch(`${CONFIG.API_URL}/social/${postId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ content })
            });
            if (!response.ok) throw new Error('Update Post Failed');
            return await response.json();
        } catch (error) {
            console.error('Update Post Error:', error);
            return null;
        }
    },

    // Mock integration with Ride Mode
    async getLatestRideActivity(): Promise<any | null> {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const response = await fetch(`${CONFIG.API_URL}/activities/latest`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) return null;
            return await response.json();
        } catch (error) {
            console.error('Get Latest Ride Error:', error);
            return null;
        }
    },

    async reportPost(postId: string, reason: string): Promise<boolean> {
        // Mock implementation
        console.log(`Reporting post ${postId} for ${reason}`);
        return new Promise(resolve => setTimeout(() => resolve(true), 1000));
    },

    async shareToAdmin(postId: string): Promise<boolean> {
        // Mock implementation
        console.log(`Sharing post ${postId} to admin`);
        return new Promise(resolve => setTimeout(() => resolve(true), 1000));
    }
};
