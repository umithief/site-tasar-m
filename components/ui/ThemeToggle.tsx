import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../../store/useThemeStore';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useThemeStore();

    return (
        <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className={`
                relative p-2 rounded-full transition-all duration-500
                ${theme === 'dark' ? 'bg-zinc-800 hover:bg-zinc-700' : 'bg-gray-100 hover:bg-gray-200'}
            `}
        >
            <div className="relative w-6 h-6 overflow-hidden">
                <motion.div
                    initial={false}
                    animate={{
                        y: theme === 'dark' ? 0 : 30,
                        opacity: theme === 'dark' ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Moon className="w-5 h-5 text-white" />
                </motion.div>

                <motion.div
                    initial={false}
                    animate={{
                        y: theme === 'light' ? 0 : -30,
                        opacity: theme === 'light' ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="absolute inset-0 flex items-center justify-center"
                >
                    <Sun className="w-5 h-5 text-amber-500" />
                </motion.div>
            </div>
        </motion.button>
    );
};
