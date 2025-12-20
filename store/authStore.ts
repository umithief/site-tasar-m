import { create } from 'zustand';
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
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    isLoading: false,
    error: null,

    login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/users/login', { email, password });
            const { token, data } = response.data;
            // Handle different backend response structures (data.data.user vs data.user)
            const user = data?.user || data;

            localStorage.setItem('token', token);
            set({ user, token, isAuthenticated: true, isLoading: false });
        } catch (error: any) {
            set({ error: error.message, isLoading: false });
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
            set({ error: error.message, isLoading: false });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
    },

    checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            // Assuming there is a /users/me or /auth/me endpoint. 
            // If not, we might decoding token or fetch profile by stored ID if we had it.
            // For now, let's assume we maintain session via persistence or fetch profile.
            // We'll use a placeholder or previous userService logic if needed.
            // But properly, we should fetch 'me'.
            // set({ isLoading: true });
            // const res = await api.get('/users/me'); ...
        } catch (error) {
            get().logout();
        }
    }
}));
