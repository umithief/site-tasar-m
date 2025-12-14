import { User } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';
import { logService } from './logService';
import { v4 as uuidv4 } from 'uuid';

export const authService = {
    async register(data: Omit<User, 'id' | 'joinDate' | 'points' | 'rank'>): Promise<User> {
        if (CONFIG.USE_MOCK_API) {
            await delay(800);
            const users = getStorage<User[]>(DB.USERS, []);

            if (users.find(u => u.email === data.email)) {
                throw new Error('Bu e-posta adresi zaten kayıtlı.');
            }

            const newUser: User = {
                ...data,
                id: uuidv4(),
                joinDate: new Date().toLocaleDateString('tr-TR'),
                isAdmin: false,
                points: 0,
                rank: 'Scooter Çırağı'
            };

            users.push(newUser);
            setStorage(DB.USERS, users);
            this.setSession(newUser, true); // Kayıt sonrası varsayılan olarak oturum açık kalsın

            // LOG: Yeni üye kaydı
            await logService.addLog('info', 'Yeni Üye Kaydı', `Kullanıcı: ${newUser.name} (${newUser.email})`);

            return newUser;
        } else {
            // REAL BACKEND
            try {
                const response = await fetch(`${CONFIG.API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Kayıt başarısız');
                }
                const user = await response.json();
                this.setSession(user, true);

                // Backend kendi logunu tutabilir ama frontend tarafında da güncelleyelim
                if (CONFIG.USE_MOCK_API) {
                    await logService.addLog('info', 'Yeni Üye Kaydı', `Kullanıcı: ${user.name}`);
                }

                return user;
            } catch (error: any) {
                console.error("Register Error:", error);
                if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                    throw new Error('Sunucuya bağlanılamadı. Backend sunucusunu (node server.js) başlattınız mı?');
                }
                throw error;
            }
        }
    },

    async login(email: string, password: string, rememberMe: boolean = false): Promise<User> {
        if (CONFIG.USE_MOCK_API) {
            await delay(800);
            // Admin Backdoor (Demo)
            if (email === '111@111' && password === '111') {
                const adminUser: User = {
                    id: 'admin-001',
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
                // Hatalı giriş denemesi (Opsiyonel log)
                // await logService.addLog('error', 'Hatalı Giriş Denemesi', `Email: ${email}`);
                throw new Error('E-posta veya şifre hatalı.');
            }

            // Backward compatibility for old users without points
            if (typeof user.points === 'undefined') {
                user.points = 0;
                user.rank = 'Scooter Çırağı';
            }

            this.setSession(user, rememberMe);
            return user;
        } else {
            // REAL BACKEND
            try {
                const response = await fetch(`${CONFIG.API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.message || 'Giriş başarısız');
                }
                const user = await response.json();
                this.setSession(user, rememberMe);
                return user;
            } catch (error: any) {
                console.error("Login Error:", error);
                if (error.name === 'TypeError' && error.message === 'Failed to fetch') {
                    throw new Error('Sunucuya bağlanılamadı. Backend sunucusunu (node server.js) başlattınız mı?');
                }
                throw error;
            }
        }
    },

    async updateProfile(updatedData: Partial<User>): Promise<User> {
        const currentUser = await this.getCurrentUser();
        if (!currentUser) throw new Error('Oturum bulunamadı.');

        const updatedUser = { ...currentUser, ...updatedData };

        if (CONFIG.USE_MOCK_API) {
            await delay(600);
            const users = getStorage<User[]>(DB.USERS, []);
            const index = users.findIndex(u => u.id === currentUser.id);

            if (index !== -1) {
                users[index] = { ...users[index], ...updatedData };
                setStorage(DB.USERS, users);
            }

            // Oturumu güncelle
            this.setSession(updatedUser, !!localStorage.getItem(DB.SESSION)); // LocalStorage varsa remember true kabul et
            await logService.addLog('info', 'Profil Güncelleme', `Kullanıcı: ${updatedUser.name}`);

            return updatedUser;
        } else {
            // REAL BACKEND
            try {
                // Not: Backend endpoint'i varsayımsaldır, gerçekte uygun endpoint olmalı.
                const response = await fetch(`${CONFIG.API_URL}/auth/profile`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedData)
                });

                if (!response.ok) throw new Error('Profil güncellenemedi');

                const resultUser = await response.json();
                this.setSession(resultUser, !!localStorage.getItem(DB.SESSION));
                return resultUser;
            } catch (error) {
                throw error;
            }
        }
    },

    async getAllUsers(): Promise<User[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            return getStorage<User[]>(DB.USERS, []);
        } else {
            // REAL BACKEND
            try {
                const response = await fetch(`${CONFIG.API_URL}/users`);
                if (!response.ok) return [];
                return await response.json();
            } catch {
                return [];
            }
        }
    },

    async getUserById(userId: string): Promise<User | null> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const users = getStorage<User[]>(DB.USERS, []);
            const user = users.find(u => u.id === userId);
            if (user) return user;

            // Mock data for unknown users (e.g. initial forum data authors)
            if (userId === 'admin-001' || userId === 'system') {
                return {
                    id: userId,
                    name: 'MotoVibe Admin',
                    email: 'admin@motovibe.tr',
                    joinDate: '01.01.2024',
                    isAdmin: true,
                    points: 9999,
                    rank: 'Yol Kaptanı',
                    bio: 'Sistemin kurucusu ve baş yöneticisi.',
                    garage: [
                        { id: 999, brand: 'Ducati', model: 'Panigale V4R', year: '2024', km: '1.200', color: 'Kırmızı', image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop' }
                    ]
                };
            }

            // Default mock for unknown IDs to prevent crash
            return {
                id: userId,
                name: 'Kullanıcı',
                email: 'hidden',
                joinDate: '2024',
                points: 50,
                rank: 'Scooter Çırağı',
                garage: []
            } as User;
        } else {
            try {
                const response = await fetch(`${CONFIG.API_URL}/users/${userId}`);
                if (response.ok) return await response.json();
                return null;
            } catch {
                return null;
            }
        }
    },

    async deleteUser(userId: string): Promise<void> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const users = getStorage<User[]>(DB.USERS, []);
            const filtered = users.filter(u => u.id !== userId);
            setStorage(DB.USERS, filtered);
        } else {
            // REAL BACKEND
            await fetch(`${CONFIG.API_URL}/users/${userId}`, {
                method: 'DELETE'
            });
        }
    },

    async logout(): Promise<void> {
        await delay(300);
        localStorage.removeItem(DB.SESSION);
        sessionStorage.removeItem(DB.SESSION);
    },

    async getCurrentUser(): Promise<User | null> {
        // Check Local Storage first (Persistent)
        const localSession = localStorage.getItem(DB.SESSION);
        if (localSession) {
            try { return JSON.parse(localSession); } catch { return null; }
        }

        // Check Session Storage (Tab only)
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