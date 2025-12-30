import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Navigation, Filter, Star, MapPin, ChevronRight, Share2 } from 'lucide-react';
import { Route } from '../../types';
import { RouteDetailSheet } from './RouteDetailSheet';
import { routeService } from '../../services/routeService';

interface MobileRoutesProps {
    onStartRide?: (route: Route) => void;
}

export const MobileRoutes: React.FC<MobileRoutesProps> = ({ onStartRide }) => {
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [activeFilter, setActiveFilter] = useState('All');
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadRoutes();
    }, [activeFilter]);

    const loadRoutes = async () => {
        setIsLoading(true);
        try {
            const data = await routeService.getRoutes(activeFilter);
            if (data.length === 0) {
                // Auto-seed if empty (for demo)
                const seeded = await routeService.seedRoutes();
                setRoutes(seeded);
            } else {
                setRoutes(data);
            }
        } catch (error) {
            console.error('Failed to load routes', error);
        } finally {
            setIsLoading(false);
        }
    };

    const featuredRoutes = routes.filter(r => r.difficulty === 'Zor' || r.isFeatured);
    const nearbyRoutes = routes;

    // Vibe/Mood categories with emojis
    const filters = [
        { id: 'All', label: 'Tümü', emoji: '🎯' },
        { id: 'Coastal', label: 'Sahil', emoji: '🌊' },
        { id: 'Mountain', label: 'Dağ', emoji: '🏔️' },
        { id: 'City', label: 'Şehir', emoji: '🏙️' },
        { id: 'Off-road', label: 'Arazi', emoji: '⚡' },
    ];

    const [isRefreshing, setIsRefreshing] = useState(false);
    const [startY, setStartY] = useState(0);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await loadRoutes();
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;

        if (diff > 80 && window.scrollY === 0 && !isRefreshing) {
            handleRefresh();
        }
    };

    return (
        <div
            className="min-h-screen bg-black pb-24"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
        >
            {/* Pull to Refresh Indicator */}
            <AnimatePresence>
                {isRefreshing && (
                    <motion.div
                        initial={{ opacity: 0, y: -50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className="bg-[#1A1A17] border border-orange-500/30 rounded-full p-3 shadow-2xl">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            >
                                <Navigation className="w-6 h-6 text-orange-500" />
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-black via-black/90 to-transparent pt-12 pb-6 px-6 backdrop-blur-sm">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-3xl font-display font-bold text-white tracking-tighter italic">MOTIV <span className="text-orange-500">ROTA</span></h1>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Keşfet • Sür • Paylaş</p>
                    </div>
                    <button className="w-10 h-10 btn-icon-glass bg-zinc-900 border-zinc-800 text-white shadow-lg active:scale-95">
                        <Map className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition-all flex items-center gap-2 active:scale-95
                            ${activeFilter === filter.id
                                    ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.3)]'
                                    : 'bg-zinc-900/50 text-zinc-500 border-zinc-800 hover:border-zinc-600 backdrop-blur-md'}`}
                        >
                            <span className="text-sm">{filter.emoji}</span>
                            <span>{filter.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            <div className="pt-48 px-6 space-y-10">

                {/* Featured Horizontal Slider */}
                <section>
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            <Star className="w-5 h-5 text-orange-500 fill-current" />
                            Öne Çıkanlar
                        </h2>
                        <span className="text-[10px] text-orange-500 font-bold uppercase tracking-wider bg-orange-500/10 px-2 py-1 rounded-lg">Tümünü Gör</span>
                    </div>

                    <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-4 snap-x snap-mandatory">
                        {featuredRoutes.map((route) => (
                            <div
                                key={route._id}
                                onClick={() => setSelectedRoute(route)}
                                className="relative flex-shrink-0 w-[85vw] aspect-[1.6] rounded-3xl overflow-hidden group cursor-pointer border border-white/10 snap-center shadow-2xl active:scale-[0.98] transition-transform"
                            >
                                <img src={route.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/10" />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent h-24" />

                                <div className="absolute top-4 left-4">
                                    <span className="bg-orange-600/90 backdrop-blur text-white text-[10px] font-bold px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-lg shadow-orange-600/20 border border-white/20 flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-white" />
                                        Editörün Seçimi
                                    </span>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/80 to-transparent pt-12">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-orange-500" />
                                                <span className="text-xs text-zinc-300 font-bold uppercase tracking-wide">{route.location}</span>
                                            </div>
                                            <h3 className="text-2xl font-display font-bold text-white leading-none mb-3 shadow-black drop-shadow-lg">{route.title}</h3>
                                            <div className="flex items-center gap-4 text-xs font-mono font-medium text-zinc-300 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/5 w-fit">
                                                <span className="flex items-center gap-1.5"><Navigation className="w-3 h-3" /> {route.distance}</span>
                                                <span className="w-px h-3 bg-white/20" />
                                                <span>{route.estimatedTime}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Nearby Grid */}
                <section>
                    <h2 className="text-lg font-bold text-white mb-4 px-1">Yakındaki Sürüşler</h2>
                    <div className="grid gap-3">
                        {nearbyRoutes.map((route) => (
                            <div
                                key={route._id}
                                onClick={() => setSelectedRoute(route)}
                                className="flex gap-4 p-3 bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-white/5 hover:border-white/10 transition-all active:scale-[0.99] active:bg-zinc-800/50 cursor-pointer"
                            >
                                <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 relative">
                                    <img src={route.image} className="w-full h-full object-cover" />
                                    <div className="absolute top-1 right-1 bg-black/60 backdrop-blur px-1.5 py-0.5 rounded-md text-[9px] font-bold text-white uppercase tracking-wider border border-white/10">
                                        {route.difficulty === 'Zor' ? 'ZOR' : route.difficulty === 'Orta' ? 'ORTA' : 'KOLAY'}
                                    </div>
                                </div>
                                <div className="flex-1 py-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-white truncate pr-2">{route.title}</h3>
                                        <span className="text-orange-500 font-bold text-xs flex items-center gap-0.5 bg-orange-500/10 px-1.5 py-0.5 rounded">
                                            <Star className="w-3 h-3 fill-current" /> 4.8
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 line-clamp-2 mb-3 leading-relaxed">{route.description}</p>
                                    <div className="flex items-center gap-3 text-[10px] font-mono font-bold text-zinc-400">
                                        <span className="flex items-center gap-1"><Navigation className="w-3 h-3" />{route.distance}</span>
                                        <span className="w-px h-3 bg-zinc-700" />
                                        <span>{route.estimatedTime}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

            </div>

            {/* Route Detail Sheet */}
            <RouteDetailSheet
                route={selectedRoute}
                onClose={() => setSelectedRoute(null)}
                onStartNavigation={(route) => {
                    if (onStartRide) onStartRide(route);
                }}
                onSaveRoute={() => console.log('Save Route')}
            />

        </div>
    );
};
