<<<<<<< HEAD

import React from 'react';
import { MapPin, ArrowRight, Navigation, Clock, Calendar } from 'lucide-react';
import { Route } from '../../types';

interface RouteCardProps {
    route: Route;
    onClick: (route: Route) => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, onClick }) => {
    return (
        <div
            className="group cursor-pointer bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-orange-500/30 transition-all hover:bg-zinc-900/60 hover:-translate-y-1 duration-300"
            onClick={() => onClick(route)}
        >
            {/* Image Container */}
            <div className="aspect-[16/10] overflow-hidden bg-zinc-900 relative">
                <img
                    src={route.image || 'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=1200'}
                    alt={route.title}
                    className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-90"></div>

                {/* Badges */}
                <div className="absolute top-4 left-4 flex gap-2">
                    <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider shadow-lg">
                        {route.difficulty}
                    </div>
                    {route.bestSeason && (
                        <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-zinc-300 border border-white/10 uppercase tracking-wider shadow-lg flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {route.bestSeason}
                        </div>
                    )}
                </div>

                {/* Title Overlay */}
                <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-lg font-bold text-white mb-1 leading-tight group-hover:text-orange-500 transition-colors line-clamp-1">
                        {route.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {route.location}</span>
                    </div>
                </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex justify-between items-center border-t border-white/5">
                <div className="flex gap-4">
                    <div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Navigation className="w-3 h-3" /> Mesafe
                        </div>
                        <div className="text-sm font-mono font-bold text-white">
                            {route.distance.replace(' km', '')} km
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Süre
                        </div>
                        <div className="text-sm font-mono font-bold text-white">
                            {route.estimatedTime?.replace(' Saat', '').replace(' sa', '') || (route as any).duration?.replace(' Saat', '')} sa
                        </div>
                    </div>
                </div>

                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-orange-500 group-hover:text-black transition-all">
                    <ArrowRight className="w-4 h-4" />
                </div>
            </div>
        </div>
=======
import React from 'react';
import { Route } from '../../types';
import { motion } from 'framer-motion';
import { MapPin, Film, Play, ArrowRight } from 'lucide-react';

interface RouteCardProps {
    route: Route;
    onClick: () => void;
    onNavigate: () => void;
    onDetails: () => void;
}

export const RouteCard: React.FC<RouteCardProps> = ({ route, onClick, onNavigate, onDetails }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-[#242421] border border-white/5 rounded-3xl overflow-hidden hover:border-[#F2A619]/30 transition-all hover:-translate-y-1"
        >
            <div className="h-48 relative cursor-pointer" onClick={onClick}>
                <img
                    src={route.image || 'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=800'}
                    alt={route.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#242421] via-transparent to-transparent"></div>

                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur px-2 py-1 rounded text-[#F2A619] text-[10px] font-bold uppercase border border-[#F2A619]/20">
                    {route.difficulty}
                </div>

                {route.videoUrl && (
                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur p-1.5 rounded-full border border-white/20 text-white animate-pulse">
                        <Film className="w-3 h-3" />
                    </div>
                )}

                <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-bold text-white truncate">{route.title}</h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {route.location}
                    </p>
                </div>
            </div>

            <div className="p-4">
                <div className="grid grid-cols-3 gap-2 border-b border-white/5 pb-3 mb-3 text-center">
                    <div>
                        <div className="text-[9px] text-gray-500 uppercase font-bold">KM</div>
                        <div className="text-white font-mono text-sm">{route.distance.replace(' km', '')}</div>
                    </div>
                    <div>
                        <div className="text-[9px] text-gray-500 uppercase font-bold">Süre</div>
                        <div className="text-white font-mono text-sm">{route.duration.replace(' Saat', 'sa').replace(' Dakika', 'dk')}</div>
                    </div>
                    <div>
                        <div className="text-[9px] text-gray-500 uppercase font-bold">Sezon</div>
                        <div className="text-white font-mono text-sm truncate">{route.bestSeason.split('-')[0]}</div>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onNavigate(); }}
                        className="flex-1 bg-[#F2A619] text-[#1A1A17] py-2 rounded-lg text-xs font-bold uppercase hover:bg-white transition-colors flex items-center justify-center gap-1"
                    >
                        <Play className="w-3 h-3 fill-current" /> Sür
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDetails(); }}
                        className="flex-1 bg-white/5 text-white py-2 rounded-lg text-xs font-bold uppercase hover:bg-white/10 transition-colors flex items-center justify-center gap-1 border border-white/10"
                    >
                        Detaylar
                    </button>
                </div>
            </div>
        </motion.div>
>>>>>>> restore-2025-12-25
    );
};
