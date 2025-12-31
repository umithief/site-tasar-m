import React from 'react';
import { Route } from '../../types';
import { motion } from 'framer-motion';
import { MapPin, Film, Play } from 'lucide-react';

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
                        <div className="text-white font-mono text-sm">
                            {(route as any).duration
                                ? (route as any).duration.replace(' Saat', 'sa').replace(' Dakika', 'dk')
                                : route.estimatedTime?.replace(' Saat', 'sa') || '--'}
                        </div>
                    </div>
                    <div>
                        <div className="text-[9px] text-gray-500 uppercase font-bold">Sezon</div>
                        <div className="text-white font-mono text-sm truncate">{route.bestSeason ? route.bestSeason.split('-')[0] : 'Genel'}</div>
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
    );
};
