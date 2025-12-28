import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { X, Navigation, Timer, Map as MapIcon, Gauge, Star, Share2, Bookmark, Check } from 'lucide-react';
import { Route } from '../../types';

interface RouteDetailSheetProps {
    route: Route | null;
    onClose: () => void;
    onStartNavigation: (route: Route) => void;
    onSaveRoute: (route: Route) => void;
    isSaved?: boolean;
}

export const RouteDetailSheet: React.FC<RouteDetailSheetProps> = ({
    route,
    onClose,
    onStartNavigation,
    onSaveRoute,
    isSaved = false
}) => {
    const controls = useAnimation();

    useEffect(() => {
        if (route) {
            controls.start("visible");
        } else {
            controls.start("hidden");
        }
    }, [route, controls]);

    if (!route) return null;

    // Simulate Google Maps Preview
    const MapPreview = () => (
        <div className="w-full h-48 bg-zinc-900 rounded-2xl overflow-hidden relative mb-6 border border-white/10 group">
            {/* Fake Map Elements */}
            <div className="absolute inset-0 bg-[#242f3e] opacity-80" />

            {/* Route Line (Simulated SVG) */}
            <svg className="absolute inset-0 w-full h-full p-8" viewBox="0 0 100 100" preserveAspectRatio="none">
                <motion.path
                    d="M10,90 Q40,10 90,50"
                    fill="none"
                    stroke="#F97316"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                />
            </svg>

            {/* Start/End Points */}
            <div className="absolute bottom-4 left-4 w-4 h-4 bg-white rounded-full border-4 border-[#242f3e]" />
            <div className="absolute top-1/2 right-4 w-4 h-4 bg-orange-500 rounded-full border-4 border-[#242f3e] animate-pulse" />

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                <span className="bg-black/80 backdrop-blur text-white text-xs px-3 py-1 rounded-full border border-white/10 flex items-center gap-1">
                    <MapIcon className="w-3 h-3" /> Rotayı Önizle
                </span>
            </div>
        </div>
    );

    const StatGauge = ({ label, value, icon: Icon, color = 'text-orange-500' }: any) => (
        <div className="flex flex-col items-center flex-1 bg-zinc-900/50 p-3 rounded-2xl border border-white/5 backdrop-blur-sm">
            <div className="relative w-12 h-12 flex items-center justify-center mb-2">
                <svg className="w-full h-full -rotate-90">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-zinc-800" />
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className={`${color} stroke-current`} strokeDasharray="126" strokeDashoffset={126 - (126 * value) / 100} strokeLinecap="round" />
                </svg>
                <Icon className={`w-5 h-5 absolute ${color}`} />
            </div>
            <span className="text-lg font-bold text-white font-mono">{value}%</span>
            <span className="text-[10px] uppercase text-zinc-500 font-bold tracking-wider">{label}</span>
        </div>
    );

    return (
        <AnimatePresence>
            {route && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 30, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => { if (info.offset.y > 100) onClose(); }}
                        className="fixed bottom-0 left-0 right-0 bg-[#0F0F11] rounded-t-[32px] overflow-hidden z-[51] h-[85vh] border-t border-white/10 flex flex-col shadow-2xl"
                    >
                        {/* Drag Handle */}
                        <div className="w-full flex justify-center pt-4 pb-2 bg-[#0F0F11]" onClick={onClose}>
                            <div className="w-12 h-1.5 rounded-full bg-zinc-800" />
                        </div>

                        {/* Content Scrollable Area */}
                        <div className="flex-1 overflow-y-auto p-6 pt-2 pb-32 no-scrollbar">
                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${route.difficulty === 'Extreme' || route.difficulty === 'Zor' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                            {route.difficulty === 'Zor' ? 'ZOR' : route.difficulty === 'Orta' ? 'ORTA' : route.difficulty === 'Extreme' ? 'EXTREME' : 'KOLAY'}
                                        </span>
                                        <span className="text-zinc-500 text-xs">•</span>
                                        <span className="text-zinc-400 text-xs flex items-center gap-1 uppercase font-bold tracking-wide">
                                            <MapIcon className="w-3 h-3" /> {route.location}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-display font-bold text-white leading-tight">{route.title}</h2>
                                </div>
                                <div className="flex gap-2">
                                    <button className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                                        <Share2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <MapPreview />

                            {/* Key Stats Row */}
                            <div className="flex justify-between items-center mb-8 px-4 py-4 bg-zinc-900/50 backdrop-blur-md rounded-2xl border border-white/5 shadow-lg">
                                <div className="text-center flex-1">
                                    <div className="text-xl font-mono font-bold text-white">{route.distance}</div>
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Mesafe</div>
                                </div>
                                <div className="w-px h-8 bg-zinc-800" />
                                <div className="text-center flex-1">
                                    <div className="text-xl font-mono font-bold text-white">{route.estimatedTime}</div>
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Süre</div>
                                </div>
                                <div className="w-px h-8 bg-zinc-800" />
                                <div className="text-center flex-1">
                                    <div className="text-xl font-mono font-bold text-orange-500">{route.riderCount}</div>
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Sürücü</div>
                                </div>
                            </div>

                            {/* Weather Widget */}
                            {route.weatherPoint && (
                                <div className="mb-6 p-4 bg-zinc-900/50 rounded-2xl border border-white/5 flex items-center justify-between">
                                    <div>
                                        <div className="text-xs text-zinc-500 uppercase font-bold tracking-wider mb-1">Hava Durumu</div>
                                        <div className="text-lg font-bold text-white uppercase">{route.weatherPoint}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-right">
                                            <div className="text-3xl font-mono font-bold text-orange-500">24°</div>
                                            <div className="text-xs text-zinc-500 font-bold uppercase">Güneşli</div>
                                        </div>
                                        <div className="text-4xl drop-shadow-lg">☀️</div>
                                    </div>
                                </div>
                            )}

                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Gauge className="w-4 h-4" /> Sürüş Verileri
                            </h3>
                            <div className="flex gap-4 mb-8">
                                <StatGauge label="Viraj" value={route.stats?.curves || 85} icon={Navigation} color="text-orange-500" />
                                <StatGauge label="Yol" value={route.stats?.roadQuality || 90} icon={Check} color="text-green-500" />
                                <StatGauge label="Trafik" value={route.stats?.traffic || 20} icon={Timer} color="text-red-500" />
                            </div>

                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Açıklama</h3>
                            <p className="text-zinc-300 text-sm leading-relaxed mb-6">
                                {route.description}
                            </p>

                            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Zemin</h3>
                            <div className="flex flex-wrap gap-2 mb-8">
                                {route.terrain?.map((t: string) => (
                                    <span key={t} className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-medium border border-zinc-700">
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Fixed Bottom Action Area */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-[#0F0F11] to-transparent pt-12">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => onSaveRoute(route)}
                                    className={`w-16 h-14 rounded-2xl flex items-center justify-center border transition-colors ${isSaved ? 'bg-orange-500/10 border-orange-500 text-orange-500' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
                                >
                                    <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
                                </button>
                                <button
                                    onClick={() => onStartNavigation(route)}
                                    className="flex-1 h-14 bg-orange-600 rounded-2xl flex items-center justify-center gap-3 text-white font-bold uppercase tracking-wider shadow-[0_0_30px_rgba(234,88,12,0.4)] hover:bg-orange-500 transition-colors active:scale-95"
                                >
                                    <Navigation className="w-5 h-5 fill-current" />
                                    SÜRÜŞÜ BAŞLAT
                                </button>
                            </div>
                        </div>

                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
