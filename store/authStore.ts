import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { api } from '../services/api';
import { User } from '../types';

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
    updateProfile: (userData: Partial<User>) => void;
    setUser: (user: User | null) => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (email, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/users/login', { email, password });
                    const { token, data } = response.data;
                    const user = data?.user || data;

                    localStorage.setItem('token', token); // Keep for legacy axios interceptors if needed
                    set({ user, token, isAuthenticated: true, isLoading: false });
                } catch (error: any) {
                    const msg = error.response?.data?.message || error.message || 'Login failed';
                    set({ error: msg, isLoading: false });
                    throw error;
                }
            },

            register: async (registerData) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/users/register', registerData);
                    const { token, data } = response.data;
                    const user = data?.user || data;

                    localStorage.setItem('token', token);
                    set({ user, token, isAuthenticated: true, isLoading: false });
                } catch (error: any) {
                    const msg = error.response?.data?.message || error.message || 'Registration failed';
                    set({ error: msg, isLoading: false });
                    throw error;
                }
            },

            logout: () => {
                localStorage.removeItem('token');
                set({ user: null, token: null, isAuthenticated: false });
            },

            updateProfile: (userData) => {
                set((state) => ({
                    user: state.user ? { ...state.user, ...userData } : null
                }));
            },

            setUser: (user) => {
                set({ user, isAuthenticated: !!user });
            },

            checkAuth: async () => {
                const token = get().token || localStorage.getItem('token');
                if (!token) return;

                try {
                    // Fetch fresh user data from server to ensure we have the latest profile
                    // This handles the case where localStorage has filtered data (no base64 avatars)
                    const response = await api.get('/users/profile');
                    const user = response.data?.data?.user || response.data?.user || response.data;

                    if (user) {
                        set({ user, isAuthenticated: true });
                    }
                } catch (error) {
                    console.error('Session validation failed:', error);
                    // If 401, token is invalid
                    if ((error as any).response?.status === 401) {
                        get().logout();
                    }
                }
            }
        }),
        {
            name: 'auth-storage', // unique name
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user ? {
                    ...state.user,
                    followers: [], // Don't persist large arrays
                    following: [],  // Don't persist large arrays
                    // Safety: Don't persist huge base64 strings if they slip in
                    avatar: state.user.avatar?.length > 2000 ? undefined : state.user.avatar,
                    coverImage: state.user.coverImage?.length > 5000 ? undefined : state.user.coverImage
                } : null,
                token: state.token,
                isAuthenticated: state.isAuthenticated
            }),
        }
    )
);
