import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useThemeStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    const isDark = theme === 'dark';

    return (
        <motion.button
            onClick={toggleTheme}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
                relative w-16 h-8 rounded-full p-1 flex items-center transition-colors duration-500
                border
                ${isDark
                    ? 'bg-[#0F0F0F] border-white/10 hover:border-[#E2FF3B]'
                    : 'bg-[#E4E4E7] border-black/5 hover:border-blue-600'
                }
            `}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <motion.div
                layout
                transition={{ type: "spring", stiffness: 700, damping: 30 }}
                className={`
                    w-6 h-6 rounded-full shadow-md flex items-center justify-center relative z-10
                    ${isDark
                        ? 'bg-[#0F0F0F] shadow-[#E2FF3B]/20'
                        : 'bg-white shadow-black/10'
                    }
                `}
                style={{
                    marginLeft: isDark ? 'auto' : '0',
                    marginRight: isDark ? '0' : 'auto',
                }}
            >
                <AnimatePresence mode="wait" initial={false}>
                    <motion.div
                        key={theme}
                        initial={{ rotate: -180, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 180, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        {isDark ? (
                            <Moon
                                className="w-3.5 h-3.5 text-[#E2FF3B] drop-shadow-[0_0_8px_rgba(226,255,59,0.5)]"
                                strokeWidth={2.5}
                            />
                        ) : (
                            <Sun
                                className="w-3.5 h-3.5 text-orange-500"
                                strokeWidth={2.5}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </motion.button>
    );
};
