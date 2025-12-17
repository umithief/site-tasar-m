
import { Feedback, User } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';
import { gamificationService, POINTS } from './gamificationService';

export const feedbackService = {
    async submitFeedback(user: User | null, type: Feedback['type'], rating: number, message: string): Promise<void> {
        const newFeedback: Feedback = {
            _id: `fb_${Date.now()}`,
            userId: user?._id || 'anonymous',
            userName: user?.name || 'Misafir',
            type,
            rating,
            message,
            date: new Date().toLocaleDateString('tr-TR'),
            status: 'new'
        };

        if (CONFIG.USE_MOCK_API) {
            await delay(800);
            const feedbacks = getStorage<Feedback[]>(DB.FEEDBACK, []);
            feedbacks.unshift(newFeedback);
            setStorage(DB.FEEDBACK, feedbacks);

            // Reward registered users
            if (user) {
                await gamificationService.addPoints(user._id, 25, 'Geri Bildirim Ödülü');
            }
        } else {
            // REAL BACKEND
            await fetch(`${CONFIG.API_URL}/feedback`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newFeedback)
            });

            if (user) {
                await gamificationService.addPoints(user._id, 25, 'Geri Bildirim Ödülü');
            }
        }
    },

    async getFeedbacks(): Promise<Feedback[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            return getStorage<Feedback[]>(DB.FEEDBACK, []);
        } else {
            try {
                const response = await fetch(`${CONFIG.API_URL}/feedback`);
                if (!response.ok) return [];
                return await response.json();
            } catch {
                return [];
            }
        }
    }
};
