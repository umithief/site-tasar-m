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
                // Feature disabled: Always stay in dark mode
                if (typeof window !== 'undefined') {
                    const root = window.document.documentElement;
                    root.classList.remove('light');
                    root.classList.add('dark');
                }
                return { theme: 'dark' };
            }),
            setTheme: () => set(() => {
                if (typeof window !== 'undefined') {
                    const root = window.document.documentElement;
                    root.classList.remove('light');
                    root.classList.add('dark');
                }
                return { theme: 'dark' };
            }),
        }),
        {
            name: 'motovibe-theme',
        }
    )
);
