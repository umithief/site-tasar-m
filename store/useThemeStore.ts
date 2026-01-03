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
            toggleTheme: () => set((state) => {
                const newTheme = state.theme === 'dark' ? 'light' : 'dark';
                if (typeof window !== 'undefined') {
                    const root = window.document.documentElement;
                    root.classList.remove('light', 'dark');
                    root.classList.add(newTheme);
                }
                return { theme: newTheme };
            }),
            setTheme: (theme) => set(() => {
                if (typeof window !== 'undefined') {
                    const root = window.document.documentElement;
                    root.classList.remove('light', 'dark');
                    root.classList.add(theme);
                }
                return { theme };
            }),
        }),
        {
            name: 'motovibe-theme',
        }
    )
);
