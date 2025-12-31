import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface IntroAnimationProps {
    onComplete: () => void;
}

export const IntroAnimation: React.FC<IntroAnimationProps> = ({ onComplete }) => {
    const [rpm, setRpm] = useState(0);
    const [stage, setStage] = useState(0); // 0: Idle, 1: Revving, 2: Redline/Shift, 3: Logo, 4: Exit
    const [text, setText] = useState("");

    useEffect(() => {
        // Sequence Controller
        let rpmInterval: any;

        const startSequence = async () => {
            // Stage 0: Initial Pause (Ignition)
            await new Promise(r => setTimeout(r, 500));

            // Stage 1: Revving (0 -> 8000 RPM)
            setStage(1);
            let currentRpm = 0;
            rpmInterval = setInterval(() => {
                currentRpm += 150;

                // Dynamic Text based on RPM
                if (currentRpm > 2000 && currentRpm < 4000) setText("GÜÇ");
                if (currentRpm > 5000 && currentRpm < 7000) setText("TUTKU");
                if (currentRpm > 8000) setText("ADRENALİN");

                if (currentRpm >= 12000) {
                    currentRpm = 12000;
                    clearInterval(rpmInterval);
                    triggerRedline();
                }
                setRpm(currentRpm);
            }, 16); // ~60fps updates
        };

        const triggerRedline = async () => {
            setStage(2); // Redline Flash
            setText("MOTOVIBE");

            // Hold Redline briefly
            await new Promise(r => setTimeout(r, 600));

            // Stage 3: Logo Slam
            setStage(3);

            // Stage 4: Exit
            setTimeout(() => {
                setStage(4);
                setTimeout(onComplete, 800); // Wait for exit anim
            }, 1500);
        };

        startSequence();

        return () => clearInterval(rpmInterval);
    }, [onComplete]);

    // Tachometer Calculation
    const maxRpm = 12000;
    const percentage = Math.min(rpm / maxRpm, 1);
    const needleRotation = -120 + (percentage * 240); // Sweep from -120deg to +120deg

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black overflow-hidden font-mono">

            {/* Background Noise/Grid */}
            <div className={`absolute inset-0 bg-[linear-gradient(rgba(18,18,18,0)_1px,transparent_1px),linear-gradient(90deg,rgba(18,18,18,0)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-20 pointer-events-none transition-opacity duration-1000 ${stage >= 3 ? 'opacity-0' : ''}`}></div>

            <AnimatePresence mode="wait">

                {/* STAGE 1 & 2: Tachometer */}
                {(stage === 1 || stage === 2) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
                        transition={{ duration: 0.3 }}
                        className="relative w-64 h-64 md:w-96 md:h-96 flex items-center justify-center"
                    >
                        {/* Gauge SVG */}
                        <svg viewBox="0 0 200 200" className="w-full h-full transform drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                            {/* Ticks */}
                            {[...Array(13)].map((_, i) => {
                                const rot = -120 + (i * 20);
                                const isRedline = i >= 10;
                                return (
                                    <g key={i} transform={`rotate(${rot} 100 100)`}>
                                        <line x1="100" y1="20" x2="100" y2={i % 2 === 0 ? "35" : "28"}
                                            stroke={isRedline ? "#ef4444" : "#52525b"}
                                            strokeWidth={i % 2 === 0 ? "3" : "1"}
                                        />
                                        {i % 2 === 0 && (
                                            <text x="100" y="50" fill={isRedline ? "#ef4444" : "#71717a"} fontSize="12" textAnchor="middle" transform={`rotate(${-rot} 100 50)`} fontWeight="bold">
                                                {i}
                                            </text>
                                        )}
                                    </g>
                                );
                            })}

                            {/* Arcs */}
                            <circle cx="100" cy="100" r="90" fill="none" stroke="#27272a" strokeWidth="2" strokeDasharray="375" strokeDashoffset="125" transform="rotate(150 100 100)" strokeLinecap="round" />
                            <circle cx="100" cy="100" r="90" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="375" strokeDashoffset="310" transform="rotate(150 100 100)" strokeLinecap="round" className="opacity-50" />
                        </svg>

                        {/* Needle */}
                        <motion.div
                            className="absolute w-full h-full flex items-center justify-center"
                            animate={{ rotate: needleRotation }}
                            transition={{ type: "tween", ease: "linear", duration: 0.05 }}
                        >
                            <div className="w-1 h-24 bg-red-500 origin-bottom absolute top-[50px] shadow-[0_0_10px_rgba(239,68,68,0.8)] rounded-full"></div>
                        </motion.div>

                        {/* Center Hub */}
                        <div className="absolute w-28 h-28 bg-[#09090b] rounded-full border-4 border-[#18181b] flex flex-col items-center justify-center shadow-2xl z-10">
                            <span className="text-4xl font-bold text-white font-mono tracking-tighter">
                                {(rpm / 1000).toFixed(1)}
                            </span>
                            <span className="text-[10px] text-zinc-500 font-bold mt-1">x1000 RPM</span>
                        </div>

                        {/* Flash Overlay on Redline */}
                        {stage === 2 && (
                            <motion.div
                                className="absolute inset-0 bg-red-500/20 rounded-full blur-xl z-0"
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ repeat: Infinity, duration: 0.1 }}
                            />
                        )}
                    </motion.div>
                )}

                {/* STAGE 1 & 2: Flashing Text */}
                {(stage === 1 || stage === 2) && (
                    <div className="absolute bottom-20 md:bottom-32 w-full text-center">
                        <motion.span
                            key={text}
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={`text-6xl md:text-8xl font-black italic tracking-tighter ${stage === 2 ? 'text-red-500 animate-pulse' : 'text-white/10'}`}
                        >
                            {text}
                        </motion.span>
                    </div>
                )}

                {/* STAGE 3: Logo Reveal */}
                {stage === 3 && (
                    <motion.div
                        initial={{ scale: 3, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="relative z-20 flex flex-col items-center"
                    >
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-moto-accent blur-[60px] opacity-20 animate-pulse"></div>
                            <Zap className="w-24 h-24 text-moto-accent fill-current drop-shadow-[0_0_20px_rgba(242,166,25,0.5)]" />
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter italic">
                            MOTO<span className="text-moto-accent">VIBE</span>
                        </h1>
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="h-1 bg-gradient-to-r from-transparent via-white/50 to-transparent mt-4"
                        />
                    </motion.div>
                )}

            </AnimatePresence>

            {/* STAGE 4: Exit Shutters */}
            {stage === 4 && (
                <>
                    <motion.div
                        initial={{ y: "0%" }}
                        animate={{ y: "-100%" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute top-0 left-0 right-0 h-1/2 bg-black z-50 border-b border-white/10"
                    />
                    <motion.div
                        initial={{ y: "0%" }}
                        animate={{ y: "100%" }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="absolute bottom-0 left-0 right-0 h-1/2 bg-black z-50 border-t border-white/10"
                    />
                </>
            )}
        </div>
    );
};
