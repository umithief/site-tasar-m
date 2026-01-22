import React from 'react';
import { Route } from '../../types';
import { motion } from 'framer-motion';
import { MapPin, Film, Play, Gauge, TrendingUp, Navigation, Info } from 'lucide-react';

interface RouteCardProps {
    route: Route;
    onClick: () => void;
    onNavigate: () => void;
    onDetails: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, onClick, onNavigate, onDetails }) => {
    // Difficulty Colors
    const getDifficultyColor = (level: string) => {
        switch (level) {
            case 'Kolay': return 'text-green-400 border-green-400/30 bg-green-400/10';
            case 'Orta': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10';
            case 'Zor': return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
            case 'Extreme': return 'text-red-500 border-red-500/30 bg-red-500/10';
            default: return 'text-gray-400 border-gray-400/30 bg-gray-400/10';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            className="group relative bg-[#121212] border border-white/5 rounded-2xl overflow-hidden shadow-2xl hover:shadow-[#E2FF3B]/10 hover:border-[#E2FF3B]/30 transition-all duration-500 cursor-pointer h-[420px]"
            onClick={onClick}
        >
            {/* Background Image Area */}
            <div className="absolute inset-0 z-0">
                <img
                    src={route.image || 'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=800'}
                    alt={route.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-70 group-hover:opacity-60"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#121212]/40 to-[#121212] flex flex-col justify-end p-6"></div>
            </div>

            {/* Top Badges */}
            <div className="absolute top-4 left-4 z-10 flex gap-2">
                <div className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider backdrop-blur-md border ${getDifficultyColor(route.difficulty)}`}>
                    {route.difficulty}
                </div>
                {route.isFeatured && (
                    <div className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#E2FF3B] text-black border border-[#E2FF3B]">
                        EDİTÖRÜN SEÇİMİ
                    </div>
                )}
            </div>

            {/* Top Right Actions */}
            <div className="absolute top-4 right-4 z-10 flex gap-2">
                {route.videoUrl && (
                    <div className="w-8 h-8 rounded-full bg-black/40 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/80 animate-pulse">
                        <Film size={14} />
                    </div>
                )}
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-x-0 bottom-0 z-10 p-5 flex flex-col justify-end h-full bg-gradient-to-t from-black via-black/80 to-transparent">

                {/* Title & Location */}
                <div className="mb-4 transform group-hover:-translate-y-2 transition-transform duration-500">
                    <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 mb-2 uppercase tracking-wide">
                        <MapPin size={12} className="text-[#E2FF3B]" />
                        {route.location}
                    </div>
                    <h3 className="text-2xl font-black text-white leading-tight italic tracking-tighter mb-1 shadow-black drop-shadow-lg">
                        {route.title}
                    </h3>
                    <p className="text-sm text-gray-400 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 h-0 group-hover:h-auto overflow-hidden">
                        {route.description}
                    </p>
                </div>

                {/* Stats Grid - Glass Effect */}
                <div className="grid grid-cols-3 gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 mb-4 group-hover:bg-white/10 transition-colors">
                    <div className="text-center">
                        <Gauge className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Mesafe</div>
                        <div className="text-white font-mono text-sm leading-none mt-0.5">{route.distance.replace(' km', '')} <span className="text-[9px] text-gray-600">KM</span></div>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <Navigation className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Süre</div>
                        <div className="text-white font-mono text-sm leading-none mt-0.5">
                            {(route as any).duration ? (route as any).duration.replace(' Saat', 'S').replace(' Dakika', 'D') : route.estimatedTime.replace(' Saat', 'S')}
                        </div>
                    </div>
                    <div className="text-center border-l border-white/5">
                        <TrendingUp className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                        <div className="text-[10px] text-gray-500 uppercase font-bold">Viraj</div>
                        <div className="text-white font-mono text-sm leading-none mt-0.5">
                            {route.stats?.curves ? `${route.stats.curves}/10` : '-'}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-5 gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onNavigate(); }}
                        className="col-span-3 bg-[#E2FF3B] text-black hover:bg-white transition-colors py-3 rounded-lg font-black uppercase text-xs tracking-wider flex items-center justify-center gap-2 group/btn shadow-[0_0_20px_rgba(226,255,59,0.2)]"
                    >
                        <Play size={14} className="fill-current group-hover/btn:translate-x-0.5 transition-transform" />
                        Sürüşe Başla
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDetails(); }}
                        className="col-span-2 bg-white/5 text-white hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-lg font-bold uppercase text-xs flex items-center justify-center gap-2 backdrop-blur-sm"
                    >
                        <Info size={14} />
                        Detay
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
