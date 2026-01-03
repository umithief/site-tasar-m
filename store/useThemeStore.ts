import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStore {
    theme: 'light' | 'dark';

    setTheme: (theme: 'light' | 'dark') => void;
}

export const useThemeStore = create<ThemeStore>()(
    persist(
        (set) => ({
            theme: 'dark',
            setTheme: (theme) => set(() => {
                // Ignore the intended theme, always force dark for now
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
