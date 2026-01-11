import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Play, Pause, SkipBack, SkipForward, AlertTriangle, Flag, Siren, ArrowRight, CornerUpRight, CornerUpLeft, MapPin } from 'lucide-react';

interface InRideCockpitProps {
    onFinishRide?: () => void;
    leanAngle?: number; // Prop for gyro sync
}

export const InRideCockpit: React.FC<InRideCockpitProps> = ({ onFinishRide, leanAngle = 0 }) => {
    // --- STATE ---
    const [speed, setSpeed] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [simulatedLean, setSimulatedLean] = useState(0);

    // --- EFFECT: Simulate Speed & Lean (for demo purposes if no props) ---
    useEffect(() => {
        const interval = setInterval(() => {
            // Speed Pulse Simulation
            setSpeed(prev => {
                const noise = Math.random() * 2 - 1;
                let next = prev + noise;
                if (Math.random() > 0.95) next += 5; // Surge
                if (next < 0) next = 0;
                if (next > 160) next = 150;
                return parseFloat(next.toFixed(0)); // Integer speed
            });

            // Lean Simulation (if prop not provided active)
            if (leanAngle === 0) {
                setSimulatedLean(Math.sin(Date.now() / 1000) * 30);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [leanAngle]);

    const activeLean = leanAngle || simulatedLean;

    // --- HELPER: Color Logic ---
    const getSpeedColor = (s: number) => {
        if (s > 120) return '#FF3E3E';
        return '#E2FF3B';
    };

    return (
        <div className="fixed inset-0 bg-black overflow-hidden font-sans select-none z-[2000] text-white">

            {/* --- BACKGROUND: Scanline Effect --- */}
            <div className="absolute inset-0 pointer-events-none opacity-20 z-0">
                <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_1px,#fff_2px)] opacity-10"></div>
                <motion.div
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute left-0 right-0 h-2 bg-white/20 blur-md shadow-[0_0_20px_white]"
                />
            </div>

            {/* --- TOP: Navigation HUD --- */}
            <div className="absolute top-0 left-0 right-0 h-32 p-6 flex justify-between items-start z-10 bg-gradient-to-b from-black via-black/80 to-transparent">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-[#E2FF3B]/10 border border-[#E2FF3B] rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(226,255,59,0.3)]">
                        <CornerUpRight className="w-16 h-16 text-[#E2FF3B]" strokeWidth={2.5} />
                    </div>
                    <div>
                        <div className="text-4xl font-black italic tracking-tighter text-white drop-shadow-lg">
                            250m <span className="text-2xl font-bold text-gray-400 not-italic">SONRA SAĞA DÖN</span>
                        </div>
                        <div className="text-xl font-bold text-[#E2FF3B] font-mono tracking-widest mt-1 flex items-center gap-2">
                            <Navigation className="w-5 h-5 animate-pulse" />
                            BAĞDAT CADDESİ
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CENTER: Telemetry --- */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">

                {/* 1. Speedometer */}
                <div className="relative flex flex-col items-center mb-10">
                    <motion.div
                        animate={{
                            color: getSpeedColor(speed),
                            textShadow: speed > 120 ? "0 0 40px rgba(255, 62, 62, 0.8)" : "0 0 20px rgba(226, 255, 59, 0.4)"
                        }}
                        className="text-[180px] leading-none font-black tracking-tighter italic font-mono transition-colors duration-200"
                    >
                        {Math.floor(speed)}
                    </motion.div>
                    <div className="text-2xl font-bold text-gray-500 tracking-[0.5em] mt-2">KM/S</div>
                </div>

                {/* 2. Lean Angle Bar */}
                <div className="relative w-full max-w-2xl h-24 flex items-center justify-center overflow-hidden">
                    {/* Background Arc */}
                    <div className="absolute w-[600px] h-4 bg-gray-800 rounded-full"></div>

                    {/* Active Leaning Indicator */}
                    <motion.div
                        className="absolute w-16 h-16 bg-[#00F0FF] rounded-full shadow-[0_0_30px_#00F0FF] z-20 border-4 border-white"
                        style={{
                            x: activeLean * 8 // Scaling lean to pixels
                        }}
                    />

                    {/* Left/Right Labels */}
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 text-[#00F0FF] font-bold text-xl px-10">
                        SOL {activeLean < 0 ? Math.abs(Math.round(activeLean)) : 0}°
                    </div>
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[#00F0FF] font-bold text-xl px-10">
                        SAĞ {activeLean > 0 ? Math.round(activeLean) : 0}°
                    </div>
                </div>

            </div>

            {/* --- SIDEBAR: Quick Actions (Left) --- */}
            <div className="absolute left-6 bottom-32 flex flex-col gap-6 z-20">
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    className="w-24 h-24 bg-red-600/20 border-2 border-red-500 rounded-3xl flex flex-col items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(220,38,38,0.3)] animate-pulse"
                >
                    <Siren className="w-10 h-10 text-red-500 mb-1" />
                    <span className="text-xs font-black text-red-500">SOS</span>
                </motion.button>
            </div>

            {/* --- SIDEBAR: Finish (Right) --- */}
            <div className="absolute right-6 bottom-32 flex flex-col gap-6 z-20">
                <motion.button
                    onClick={onFinishRide}
                    whileTap={{ scale: 0.9 }}
                    className="w-24 h-24 bg-white/10 border-2 border-white/30 rounded-3xl flex flex-col items-center justify-center backdrop-blur-md"
                >
                    <Flag className="w-10 h-10 text-white mb-1" />
                    <span className="text-xs font-black text-white">BİTİR</span>
                </motion.button>
            </div>

            {/* --- BOTTOM: Media Dock --- */}
            <div className="absolute bottom-0 left-0 right-0 h-28 bg-white/5 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-10 z-20 pb-safe">

                {/* Song Info */}
                <div className="flex-1">
                    <div className="text-white/60 text-xs font-bold tracking-wider mb-1">ŞU AN ÇALIYOR</div>
                    <div className="text-xl font-bold text-white truncate max-w-[200px] md:max-w-md">
                        AC/DC - Highway to Hell
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-8">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/10"
                    >
                        <SkipBack className="w-10 h-10 text-white" fill="currentColor" />
                    </motion.button>

                    <motion.button
                        onClick={() => setIsPlaying(!isPlaying)}
                        whileTap={{ scale: 0.9 }}
                        className="w-24 h-24 rounded-full bg-[#E2FF3B] flex items-center justify-center shadow-[0_0_40px_rgba(226,255,59,0.3)] text-black"
                    >
                        {isPlaying ? (
                            <Pause className="w-12 h-12" fill="currentColor" />
                        ) : (
                            <Play className="w-12 h-12 ml-1" fill="currentColor" />
                        )}
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center border border-white/10"
                    >
                        <SkipForward className="w-10 h-10 text-white" fill="currentColor" />
                    </motion.button>
                </div>

                {/* Spacer to balance Song Info */}
                <div className="flex-1" />
            </div>

        </div>
    );
};
