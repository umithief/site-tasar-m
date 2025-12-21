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

            checkAuth: async () => {
                const token = get().token || localStorage.getItem('token');
                if (!token) return;

                try {
                    // Start loading silently
                    // set({ isLoading: true });
                    // Verify token validity or fetch fresh user data
                    // For now, trust the persisted state or decode token if we had jwt-decode
                } catch (error) {
                    get().logout();
                }
            }
        }),
        {
            name: 'auth-storage', // unique name
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }), // Only persist these
        }
    )
);
