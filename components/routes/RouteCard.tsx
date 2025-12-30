
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
    );
};
