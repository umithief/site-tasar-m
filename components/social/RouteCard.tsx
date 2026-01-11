import React from 'react';
import { motion } from 'framer-motion';
import { Map, Clock, CornerUpRight, Navigation } from 'lucide-react';
import { VibeButton as Button } from '../ui/VibeButton';

interface RouteData {
    id: string;
    title: string;
    image: string;
    difficulty: string; // "ZORLUK: ORTA (Virajlı)"
    distance: string; // "145 KM"
    duration: string; // "~3s 15dk"
    curves: string; // "52 Viraj"
}

interface RouteCardProps {
    route: RouteData;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route }) => {
    return (
        <motion.div
            className="relative w-[85vw] md:w-[350px] aspect-[4/5] flex-shrink-0 snap-center rounded-3xl overflow-hidden border border-white/10 bg-black/60 backdrop-blur-xl group shadow-2xl"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Native ease
        >
            {/* 3D Map Preview (Top 60%) */}
            <div className="h-[60%] w-full relative overflow-hidden bg-zinc-900 border-b border-white/5">
                {/* Image layer with slight perspective tilt illusion via CSS or image itself. 
                    Using a transformative scale for parallax feel on hover. */}
                <motion.img
                    src={route.image}
                    alt={route.title}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 opacity-80"
                />

                {/* Gradient Map Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-transparent" />

                {/* Glowing Route Line (Simulated) */}
                {/* This could be an SVG or overlay image. For now, a stylized SVG route line. */}
                <svg className="absolute inset-0 w-full h-full p-8 pointer-events-none drop-shadow-[0_0_10px_rgba(226,255,59,0.8)]" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path
                        d="M20,80 Q40,50 60,70 T90,20"
                        fill="none"
                        stroke="#E2FF3B"
                        strokeWidth="3"
                        strokeLinecap="round"
                        className="animate-pulse"
                        style={{ filter: "url(#glow)" }}
                    />
                    <defs>
                        <filter id="glow">
                            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                </svg>

                {/* Difficulty Badge */}
                <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center gap-1.5 shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-[10px] font-black tracking-wider text-white uppercase">{route.difficulty}</span>
                </div>
            </div>

            {/* Route Details (Bottom 40%) */}
            <div className="h-[40%] p-5 flex flex-col justify-between relative bg-gradient-to-b from-black/80 to-black/95">

                <div>
                    {/* Title */}
                    <h3 className="text-xl font-display font-bold text-white leading-tight mb-4 drop-shadow-md">
                        {route.title}
                    </h3>

                    {/* Stats Bar */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5">
                            <Map className="w-4 h-4 text-[#E2FF3B] mb-1" />
                            <span className="text-xs font-bold text-zinc-300">{route.distance}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5">
                            <Clock className="w-4 h-4 text-moto-accent mb-1" />
                            <span className="text-xs font-bold text-zinc-300">{route.duration}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 border border-white/5">
                            <CornerUpRight className="w-4 h-4 text-blue-400 mb-1" />
                            <span className="text-xs font-bold text-zinc-300">{route.curves}</span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <Button
                    variant="primary"
                    className="w-full py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl shadow-[0_0_20px_rgba(226,255,59,0.15)] group-hover:shadow-[0_0_30px_rgba(226,255,59,0.3)] transition-all"
                >
                    <Navigation className="w-4 h-4" />
                    ROTAYI KEŞFET
                </Button>
            </div>
        </motion.div>
    );
};
