import { CONFIG } from './config';
import { SocialProfile } from '../types';

export const userService = {
    // Get User Profile (with garage, stats, etc.)
    async getProfile(userId: string): Promise<SocialProfile | null> {
        try {
            const response = await fetch(`${CONFIG.API_URL}/users/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch profile');
            const data = await response.json();
            return data.data.user;
        } catch (error) {
            console.error('Get Profile Error:', error);
            return null;
        }
    },

    async followUser(userId: string): Promise<{ success: boolean; message: string }> {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${CONFIG.API_URL}/users/follow/${userId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Follow failed');
            return { success: true, message: data.message };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    },

    async unfollowUser(userId: string): Promise<{ success: boolean; message: string }> {
        // Our backend uses toggle logic mostly, but if separated:
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${CONFIG.API_URL}/users/follow/${userId}`, { // Using same endpoint as toggle
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Unfollow failed');
            return { success: true, message: data.message };
        } catch (error: any) {
            return { success: false, message: error.message };
        }
    }
};
