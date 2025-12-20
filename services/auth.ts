import { User } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';
import { logService } from './logService';
import { v4 as uuidv4 } from 'uuid';
import { api } from './api';

export const authService = {

    async register(data: Omit<User, '_id' | 'joinDate' | 'points' | 'rank'>): Promise<User> {
        if (CONFIG.USE_MOCK_API) {
            await delay(800);
            const users = getStorage<User[]>(DB.USERS, []);

            if (users.find(u => u.email === data.email)) {
                throw new Error('Bu e-posta adresi zaten kayıtlı.');
            }

            const newUser: User = {
                ...data,
                _id: uuidv4(),
                joinDate: new Date().toLocaleDateString('tr-TR'),
                isAdmin: false,
                points: 0,
                rank: 'Scooter Çırağı'
            };

            users.push(newUser);
            setStorage(DB.USERS, users);
            this.setSession(newUser, true);

            await logService.addLog('info', 'Yeni Üye Kaydı', `Kullanıcı: ${newUser.name} (${newUser.email})`);
            return newUser;
        } else {
            // REAL BACKEND
            const response = await api.post('/users/register', data);
            const { token, data: responseData } = response.data;
            const user = responseData?.user || responseData;

            if (token) {
                localStorage.setItem('token', token);
            }
            this.setSession(user, true);

            // Optional: Client-side logging if needed, but backend logs primarily.
            return user;
        }
    },

    async login(email: string, password: string, rememberMe: boolean = false): Promise<User> {
        if (CONFIG.USE_MOCK_API) {
            await delay(800);
            // Admin Backdoor (Demo)
            if (email === '111@111' && password === '111') {
                const adminUser: User = {
                    _id: 'admin-001',
                    name: 'MotoVibe Admin',
                    email: '111@111',
                    joinDate: '01.01.2024',
                    isAdmin: true,
                    address: 'HQ',
                    points: 9999,
                    rank: 'Yol Kaptanı'
                };
                this.setSession(adminUser, rememberMe);
                await logService.addLog('warning', 'Admin Girişi', 'Süper kullanıcı oturum açtı.');
                return adminUser;
            }

            const users = getStorage<User[]>(DB.USERS, []);
            const user = users.find(u => u.email === email && u.password === password);

            if (!user) {
                throw new Error('E-posta veya şifre hatalı.');
            }

            if (typeof user.points === 'undefined') {
                user.points = 0;
                user.rank = 'Scooter Çırağı';
            }

            this.setSession(user, rememberMe);
            return user;
        } else {
            // REAL BACKEND
            const response = await api.post('/users/login', { email, password });
            const { token, data } = response.data;
            const user = data?.user || data;

            if (token) {
                localStorage.setItem('token', token);
            }
            this.setSession(user, rememberMe);
            return user;
        }
    },

    async updateProfile(updatedData: Partial<User>): Promise<User> {
        const currentUser = await this.getCurrentUser();
        if (!currentUser) throw new Error('Oturum bulunamadı.');

        const updatedUser = { ...currentUser, ...updatedData };

        if (CONFIG.USE_MOCK_API) {
            await delay(600);
            const users = getStorage<User[]>(DB.USERS, []);
            const index = users.findIndex(u => u._id === currentUser._id);

            if (index !== -1) {
                users[index] = { ...users[index], ...updatedData };
                setStorage(DB.USERS, users);
            }

            this.setSession(updatedUser, !!localStorage.getItem(DB.SESSION));
            await logService.addLog('info', 'Profil Güncelleme', `Kullanıcı: ${updatedUser.name}`);

            return updatedUser;
        } else {
            // REAL BACKEND
            // Note: Assuming backend has a generic update or specific profile update endpoint
            // Usually PUT /users/profile or /users/:id
            const response = await api.put('/users/profile', updatedData); // Adjusted to likely endpoint
            const resultUser = response.data;
            this.setSession(resultUser, !!localStorage.getItem(DB.SESSION));
            return resultUser;
        }
    },

    async getAllUsers(): Promise<User[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            return getStorage<User[]>(DB.USERS, []);
        } else {
            // REAL BACKEND
            try {
                const response = await api.get('/users');
                return response.data;
            } catch {
                return [];
            }
        }
    },

    async getUserById(userId: string): Promise<User | null> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const users = getStorage<User[]>(DB.USERS, []);
            const user = users.find(u => u._id === userId);
            if (user) return user;

            if (userId === 'admin-001' || userId === 'system') {
                return {
                    _id: userId,
                    name: 'MotoVibe Admin',
                    email: 'admin@motovibe.tr',
                    joinDate: '01.01.2024',
                    isAdmin: true,
                    points: 9999,
                    rank: 'Yol Kaptanı',
                    bio: 'Sistemin kurucusu ve baş yöneticisi.',
                    garage: [
                        { _id: '999', brand: 'Ducati', model: 'Panigale V4R', year: '2024', km: '1.200', color: 'Kırmızı', image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop' }
                    ]
                };
            }

            return {
                _id: userId,
                name: 'Kullanıcı',
                email: 'hidden',
                joinDate: '2024',
                points: 50,
                rank: 'Scooter Çırağı',
                garage: []
            } as User;
        } else {
            try {
                const response = await api.get(`/users/${userId}`);
                return response.data;
            } catch {
                return null;
            }
        }
    },

    async deleteUser(userId: string): Promise<void> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const users = getStorage<User[]>(DB.USERS, []);
            const filtered = users.filter(u => u._id !== userId);
            setStorage(DB.USERS, filtered);
        } else {
            // REAL BACKEND
            await api.delete(`/users/${userId}`);
        }
    },

    async logout(): Promise<void> {
        await delay(300);
        localStorage.removeItem(DB.SESSION);
        localStorage.removeItem('token');
        sessionStorage.removeItem(DB.SESSION);
    },

    async getCurrentUser(): Promise<User | null> {
        const localSession = localStorage.getItem(DB.SESSION);
        if (localSession) {
            try { return JSON.parse(localSession); } catch { return null; }
        }

        const sessionSession = sessionStorage.getItem(DB.SESSION);
        if (sessionSession) {
            try { return JSON.parse(sessionSession); } catch { return null; }
        }

        return null;
    },

    setSession(user: User, remember: boolean) {
        const safeUser = { ...user };
        if (remember) {
            localStorage.setItem(DB.SESSION, JSON.stringify(safeUser));
        } else {
            sessionStorage.setItem(DB.SESSION, JSON.stringify(safeUser));
        }
    }
};