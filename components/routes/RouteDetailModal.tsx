
import React from 'react';
import { Route } from '../../types';
import { Button } from '../ui/Button';
import { X, Calendar, Clock, Navigation, MapPin, Play, Heart, Share2 } from 'lucide-react';

interface RouteDetailModalProps {
    route: Route | null;
    onClose: () => void;
    onStartRide: (route: Route) => void;
}

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({ route, onClose, onStartRide }) => {
    if (!route) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-zinc-900 border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl relative">

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/50 backdrop-blur rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left: Image / Map Preview */}
                <div className="w-full md:w-1/2 relative min-h-[300px]">
                    <img
                        src={route.image || 'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=1200'}
                        alt={route.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent opacity-90 md:opacity-60"></div>

                    <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex gap-2 mb-3">
                            <span className="px-3 py-1 bg-orange-500 text-black text-xs font-bold rounded-lg uppercase tracking-wider">
                                {route.difficulty}
                            </span>
                            <span className="px-3 py-1 bg-black/60 text-white text-xs font-bold rounded-lg uppercase tracking-wider flex items-center gap-1 border border-white/10">
                                <Calendar className="w-3 h-3" /> {route.bestSeason || 'Her Mevsim'}
                            </span>
                        </div>
                        <h2 className="text-3xl font-bold text-white leading-tight mb-2">{route.title}</h2>
                        <div className="flex items-center text-zinc-300 text-sm gap-2">
                            <MapPin className="w-4 h-4 text-orange-500" />
                            {route.location || 'Türkiye'}
                        </div>
                    </div>
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto custom-scrollbar">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="text-zinc-500 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                <Navigation className="w-3 h-3" /> Mesafe
                            </div>
                            <div className="text-2xl font-mono text-white font-bold">{route.distance}</div>
                        </div>
                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                            <div className="text-zinc-500 text-xs font-bold uppercase mb-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" /> Süre
                            </div>
                            <div className="text-2xl font-mono text-white font-bold">
                                {route.estimatedTime || (route as any).duration || '--'}
                            </div>
                        </div>
                    </div>

                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                            <div className="w-1 h-6 bg-orange-500 rounded-full"></div>
                            Rota Hakkında
                        </h3>
                        <p className="text-zinc-400 leading-relaxed text-sm whitespace-pre-wrap">
                            {route.description || "Bu rota için henüz bir açıklama girilmemiş."}
                        </p>
                    </div>

                    <div className="mt-8 flex gap-3">
                        <Button
                            variant="primary"
                            className="flex-1 py-4 text-base font-bold shadow-lg shadow-orange-500/20"
                            onClick={() => onStartRide(route)}
                        >
                            <Play className="w-5 h-5 mr-2" /> SÜRÜŞÜ BAŞLAT
                        </Button>
                        <button className="w-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors">
                            <Share2 className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
