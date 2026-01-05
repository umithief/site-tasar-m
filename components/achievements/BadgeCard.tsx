
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Medal, Trophy, Zap, Map } from 'lucide-react';

interface Achievement {
    id: string;
    title: string;
    description: string;
    icon_key: string;
    category: string;
    isUnlocked: boolean;
    unlockedAt?: Date | null;
    progress?: number;
    requirement_value: number;
}

const iconMap: Record<string, React.ReactNode> = {
    medal: <Medal className="w-8 h-8" />,
    trophy: <Trophy className="w-8 h-8" />,
    zap: <Zap className="w-8 h-8" />,
    map: <Map className="w-8 h-8" />,
};

interface BadgeCardProps {
    achievement: Achievement;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ achievement }) => {
    const [isFlipped, setIsFlipped] = useState(false);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!achievement.isUnlocked) return;

        const card = e.currentTarget;
        const box = card.getBoundingClientRect();
        const x = e.clientX - box.left;
        const y = e.clientY - box.top;
        const centerX = box.width / 2;
        const centerY = box.height / 2;

        const rotateXValue = (y - centerY) / 10;
        const rotateYValue = (centerX - x) / 10;

        setRotateX(rotateXValue);
        setRotateY(rotateYValue);
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
    };

    return (
        <div
            className="perspective-1000 w-full h-48 cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            <motion.div
                className="w-full h-full relative preserve-3d transition-transform duration-500"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                style={{
                    rotateX: achievement.isUnlocked ? rotateX : 0,
                    rotateY: achievement.isUnlocked ? rotateY + (isFlipped ? 180 : 0) : (isFlipped ? 180 : 0),
                }}
            >
                {/* Front Side */}
                <div className={`absolute w-full h-full backface-hidden rounded-xl border p-4 flex flex-col items-center justify-center gap-2 overflow-hidden
          ${achievement.isUnlocked
                        ? 'bg-[#0D0D0D] border-[#E2FF3B]/50 shadow-[0_0_15px_rgba(226,255,59,0.15)]'
                        : 'bg-[#0D0D0D]/40 border-gray-700/30'
                    }`}
                >
                    {/* Holo Effect Overlay */}
                    {achievement.isUnlocked && (
                        <div
                            className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                            style={{
                                background: `linear-gradient(${135 + rotateX * 2}deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0) 70%)`
                            }}
                        />
                    )}

                    <div className={`p-3 rounded-full ${achievement.isUnlocked ? 'bg-[#E2FF3B]/10 text-[#E2FF3B]' : 'bg-gray-800 text-gray-500'}`}>
                        {achievement.isUnlocked ? iconMap[achievement.icon_key] || <Trophy /> : <Lock className="w-6 h-6" />}
                    </div>

                    <h3 className={`text-center font-bold font-mono text-sm ${achievement.isUnlocked ? 'text-white' : 'text-gray-500'}`}>
                        {achievement.title}
                    </h3>

                    {achievement.isUnlocked && (
                        <div className="absolute top-2 right-2">
                            <div className="w-2 h-2 rounded-full bg-[#E2FF3B] shadow-[0_0_5px_#E2FF3B] animate-pulse" />
                        </div>
                    )}
                </div>

                {/* Back Side */}
                <div className={`absolute w-full h-full backface-hidden rounded-xl border border-gray-700 bg-[#121212] p-4 flex flex-col items-center justify-center text-center rotate-y-180`}>
                    <p className="text-xs text-gray-400 font-mono mb-2">REQUIREMENTS</p>
                    <p className="text-sm font-medium text-white mb-2">{achievement.description}</p>

                    {!achievement.isUnlocked && achievement.progress !== undefined && (
                        <div className="w-full mt-2">
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                <span>PROGRESS</span>
                                <span>{Math.min(achievement.progress, achievement.requirement_value)} / {achievement.requirement_value}</span>
                            </div>
                            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gray-500"
                                    style={{ width: `${Math.min((achievement.progress / achievement.requirement_value) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {achievement.isUnlocked && achievement.unlockedAt && (
                        <p className="text-[10px] text-[#E2FF3B] mt-2">
                            Unlocked on {new Date(achievement.unlockedAt).toLocaleDateString()}
                        </p>
                    )}
                </div>

            </motion.div>
        </div>
    );
};
