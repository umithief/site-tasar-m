import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
    theme: 'dark' | 'light';
    toggleTheme: () => void;
    setTheme: (theme: 'dark' | 'light') => void;
}

export const useThemeStore = create<ThemeState>()(
    persist(
        (set) => ({
            theme: 'light',
            toggleTheme: () => set({ theme: 'light' }),
            setTheme: () => set({ theme: 'light' }),
        }),
        {
            name: 'mv_theme_storage',
        }
    )
);
