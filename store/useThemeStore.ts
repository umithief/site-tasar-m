import { create } from 'zustand';
import { ColorTheme } from '../types';

interface ThemeStore {
    theme: ColorTheme;
    setTheme: (theme: ColorTheme) => void;
    toggleTheme: () => void;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
    theme: (localStorage.getItem('theme') as ColorTheme) || 'dark', // Default to dark
    setTheme: (theme) => {
        set({ theme });
        localStorage.setItem('theme', theme);
        if (typeof window !== 'undefined') {
            const root = document.documentElement;
            root.classList.remove('light', 'dark');
            root.classList.add(theme);
        }
    },
    toggleTheme: () => {
        const current = get().theme;
        const next = current === 'dark' ? 'light' : 'dark';
        get().setTheme(next);
    }
}));
