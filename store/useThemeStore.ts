import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            theme: 'dark',
            toggleTheme: () => set(() => {
                if (typeof window !== 'undefined') {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                }
                return { theme: 'dark' };
            }),
            setTheme: () => set(() => {
                if (typeof window !== 'undefined') {
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                }
                return { theme: 'dark' };
            }),
        }),
        {
            name: 'motovibe-theme',
        }
    )
);
