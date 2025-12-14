
import { User } from '../types';
import { DB, getStorage, setStorage } from './db';
import { notify } from './notificationService';
import { CONFIG } from './config';

export const RANKS = {
    BEGINNER: { name: 'Scooter Çırağı', min: 0, max: 200 },
    INTERMEDIATE: { name: 'Viraj Ustası', min: 201, max: 1000 },
    EXPERT: { name: 'Yol Kaptanı', min: 1001, max: Infinity }
} as const;

export const POINTS = {
    DAILY_LOGIN: 10,
    CREATE_TOPIC: 20,
    ADD_COMMENT: 5,
    PER_10_TL_SPENT: 1
};

export const gamificationService = {
    calculateRank(points: number): User['rank'] {
        if (points >= RANKS.EXPERT.min) return 'Yol Kaptanı';
        if (points >= RANKS.INTERMEDIATE.min) return 'Viraj Ustası';
        return 'Scooter Çırağı';
    },

    async addPoints(userId: string, amount: number, reason: string): Promise<void> {
        if (!userId) return;

        // Mock Implementation for Local Storage
        if (CONFIG.USE_MOCK_API) {
            const users = getStorage<User[]>(DB.USERS, []);
            const userIndex = users.findIndex(u => u.id === userId);
            
            if (userIndex !== -1) {
                const user = users[userIndex];
                const oldRank = user.rank || 'Scooter Çırağı';
                
                user.points = (user.points || 0) + amount;
                user.rank = this.calculateRank(user.points);
                
                users[userIndex] = user;
                setStorage(DB.USERS, users);
                
                // Update Session if it's the current user
                const sessionUser = sessionStorage.getItem(DB.SESSION);
                const localSessionUser = localStorage.getItem(DB.SESSION);
                
                if (sessionUser) {
                    const sUser = JSON.parse(sessionUser);
                    if (sUser.id === userId) sessionStorage.setItem(DB.SESSION, JSON.stringify(user));
                }
                if (localSessionUser) {
                    const lUser = JSON.parse(localSessionUser);
                    if (lUser.id === userId) localStorage.setItem(DB.SESSION, JSON.stringify(user));
                }

                // Notify User
                if (amount > 0) {
                    notify.success(`+${amount} Puan: ${reason}`);
                }

                // Rank Up Notification
                if (user.rank !== oldRank) {
                    setTimeout(() => {
                        notify.success(`🎉 TEBRİKLER! Yeni Rütbe: ${user.rank}`);
                        if (user.rank === 'Yol Kaptanı') {
                            notify.info('👑 Yol Kaptanı avantajı: %5 Daimi İndirim kazandın!');
                        }
                    }, 1000);
                }

                // Trigger App Refresh to update UI
                window.dispatchEvent(new Event('user-points-updated'));
            }
        } else {
            // REAL BACKEND implementation placeholder
            // await fetch(`${CONFIG.API_URL}/users/${userId}/points`, { method: 'POST', body: JSON.stringify({ amount, reason }) });
        }
    },

    checkDailyLogin: async (user: User) => {
        const today = new Date().toLocaleDateString('tr-TR');
        const lastLoginKey = `mv_last_login_${user.id}`;
        const lastLogin = localStorage.getItem(lastLoginKey);

        if (lastLogin !== today) {
            await gamificationService.addPoints(user.id, POINTS.DAILY_LOGIN, 'Günlük Giriş Bonusu');
            localStorage.setItem(lastLoginKey, today);
        }
    }
};
