import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface IntroAnimationProps {
    onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onComplete, 800); // Coordination with exit animation duration
        }, 3500); // Total duration before exit

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden"
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                >
                    {/* Minimal Grid Background (Very subtle) */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] opacity-20 pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="flex flex-col items-center"
                        >
                            {/* Icon/Logo Mark */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2, duration: 0.8 }}
                                className="mb-6 relative"
                            >
                                <div className="absolute inset-0 bg-moto-accent blur-[40px] opacity-40 animate-pulse" />
                                <Zap className="w-16 h-16 text-moto-accent fill-moto-accent/20" />
                            </motion.div>

                            {/* Main Typography */}
                            <div className="flex flex-col items-center">
                                <motion.h1
                                    className="text-6xl md:text-8xl font-black text-white tracking-tighter italic leading-none"
                                    initial={{ clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0% 100%)" }}
                                    animate={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0%, 0% 0%)" }}
                                    transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.4 }}
                                >
                                    MOTO<span className="text-transparent bg-clip-text bg-gradient-to-r from-moto-accent to-yellow-200">VIBE</span>
                                </motion.h1>

                                {/* Tagline */}
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: "100%" }}
                                    transition={{ delay: 1, duration: 0.8, ease: "circOut" }}
                                    className="h-px bg-white/20 mt-6 w-full relative overflow-hidden"
                                >
                                    <motion.div
                                        className="absolute top-0 left-0 h-full w-1/2 bg-moto-accent/50 blur-[2px]"
                                        initial={{ x: "-100%" }}
                                        animate={{ x: "200%" }}
                                        transition={{ delay: 1.2, duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                                    />
                                </motion.div>

                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.6 }}
                                    transition={{ delay: 1.4, duration: 0.8 }}
                                    className="mt-4 text-xs font-mono tracking-[0.4em] text-white/60 uppercase"
                                >
                                    Premium Motorcycle Lifestyle
                                </motion.p>
                            </div>
                        </motion.div>
                    </div>

                    {/* Exit Shutters for Cinematic Reveal */}
                    <motion.div
                        className="absolute top-0 left-0 w-full h-1/2 bg-black z-20"
                        exit={{ y: "-100%" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    />
                    <motion.div
                        className="absolute bottom-0 left-0 w-full h-1/2 bg-black z-20"
                        exit={{ y: "100%" }}
                        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};
