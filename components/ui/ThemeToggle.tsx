import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

export const ThemeToggle = () => {
    const { theme, toggleTheme } = useThemeStore();
    const isDark = theme === 'dark';

    return (
        <motion.button
            onClick={toggleTheme}
            className={`
                relative w-16 h-9 rounded-full px-1 flex items-center
                border transition-colors duration-500
                ${isDark
                    ? 'bg-[#0F0F0F] border-white/10'
                    : 'bg-[#E4E4E7] border-black/5'
                }
                overflow-hidden group focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-moto-accent/50
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            {/* Hover Glow Effect on Border */}
            <motion.div
                className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 border-2 ${isDark ? 'border-[#E2FF3B]' : 'border-[#2563EB]'}`}
                layoutId="glow"
            />

            {/* Sliding Knob */}
            <motion.div
                layout
                transition={{
                    type: 'spring',
                    stiffness: 700,
                    damping: 30
                }}
                className={`
                    relative z-10 w-7 h-7 rounded-full shadow-lg flex items-center justify-center
                    ${isDark
                        ? 'bg-zinc-800 text-[#E2FF3B] shadow-[0_0_10px_rgba(226,255,59,0.2)]'
                        : 'bg-white text-zinc-900 shadow-sm'
                    }
                `}
                animate={{
                    x: isDark ? 28 : 0,
                    rotate: isDark ? 360 : 0
                }}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={theme}
                        initial={{ scale: 0.5, opacity: 0, rotate: -180 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0.5, opacity: 0, rotate: 180 }}
                        transition={{ duration: 0.2 }}
                    >
                        {isDark ? (
                            <Moon className="w-4 h-4 ml-[1px] fill-current" strokeWidth={2.5} />
                        ) : (
                            <Sun className="w-4 h-4 text-orange-500 fill-orange-500" strokeWidth={2.5} />
                        )}
                    </motion.div>
                </AnimatePresence>
            </motion.div>

            {/* Background Icons (Subtle visual cues) */}
            <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
                <Sun className={`w-3 h-3 text-gray-400 ${!isDark ? 'opacity-0' : 'opacity-100'}`} />
                <Moon className={`w-3 h-3 text-gray-600 ${isDark ? 'opacity-0' : 'opacity-100'}`} />
            </div>
        </motion.button>
    );
};
