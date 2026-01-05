
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';

interface AchievementToastProps {
    title: string;
    description: string;
    visible: boolean;
    onClose: () => void;
    icon_key?: string; // e.g. 'trophy'
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ title, description, visible, onClose, icon_key = 'trophy' }) => {
    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -100, opacity: 0 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-96"
                >
                    <div className="relative bg-[#0D0D0D] border border-[#E2FF3B]/50 rounded-lg shadow-[0_0_20px_rgba(226,255,59,0.2)] overflow-hidden">
                        {/* Glow effect */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-[#E2FF3B] animate-pulse" />

                        <div className="p-4 flex items-start gap-4">
                            <div className="flex-shrink-0 relative">
                                <div className="absolute inset-0 bg-[#E2FF3B] blur-lg opacity-20" />
                                <div className="w-10 h-10 bg-[#E2FF3B]/10 rounded-full flex items-center justify-center border border-[#E2FF3B]/30 relative z-10">
                                    <Trophy className="w-5 h-5 text-[#E2FF3B]" />
                                </div>
                            </div>

                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-[#E2FF3B] tracking-wider uppercase mb-0.5">
                                    ACHIEVEMENT UNLOCKED
                                </p>
                                <h3 className="text-sm font-bold text-white truncate">{title}</h3>
                                <p className="text-xs text-gray-400 mt-1">{description}</p>
                            </div>

                            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Sound Wave Visual (CSS Animation) */}
                        <div className="absolute bottom-0 right-0 left-0 h-8 opacity-10 flex items-end justify-center gap-[2px] pointer-events-none">
                            {[...Array(20)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-1 bg-[#E2FF3B] animate-pulse"
                                    style={{
                                        height: `${Math.random() * 100}%`,
                                        animationDuration: `${0.5 + Math.random() * 0.5}s`
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
