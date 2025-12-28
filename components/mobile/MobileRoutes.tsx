import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Navigation, Filter, Star, MapPin, ChevronRight, Share2 } from 'lucide-react';
import { Route } from '../../types';
import { RouteDetailSheet } from './RouteDetailSheet';
import { routeService } from '../../services/routeService';

export const MobileRoutes: React.FC = () => {
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
            <header className="fixed top-0 left-0 right-0 z-10 bg-gradient-to-b from-black via-black/80 to-transparent pt-12 pb-6 px-6 backdrop-blur-sm">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tighter italic">EPIC <span className="text-orange-500">RIDES</span></h1>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Discover • Ride • Share</p>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white">
                        <Map className="w-5 h-5" />
                    </button>
                </div>

                {/* Filters */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-6 px-6">
                    {filters.map((filter) => (
                        <button
                            key={filter.id}
                            onClick={() => setActiveFilter(filter.id)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap border transition-all flex items-center gap-2
                            ${activeFilter === filter.id
                                    ? 'bg-white text-black border-white'
                                    : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600'}`}
                        >
                            <span>{filter.emoji}</span>
                            <span>{filter.label}</span>
                        </button>
                    ))}
                </div>
            </header>

            <div className="pt-44 px-6 space-y-10">

                {/* Featured Horizontal Slider */}
                <section>
                    <div className="flex justify-between items-end mb-4">
                        <h2 className="text-lg font-bold text-white">Featured Routes</h2>
                        <span className="text-xs text-orange-500 font-bold uppercase tracking-wider">View All</span>
                    </div>

                    <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-6 px-6 pb-4">
                        {featuredRoutes.map((route) => (
                            <div
                                key={route._id}
                                onClick={() => setSelectedRoute(route)}
                                className="relative flex-shrink-0 w-[85vw] aspect-[1.6] rounded-2xl overflow-hidden group cursor-pointer border border-white/5"
                            >
                                <img src={route.image} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />

                                <div className="absolute top-4 left-4">
                                    <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider shadow-lg shadow-orange-600/20">
                                        Editor's Choice
                                    </span>
                                </div>

                                <div className="absolute bottom-0 left-0 right-0 p-5">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <MapPin className="w-3 h-3 text-orange-500" />
                                                <span className="text-xs text-zinc-300 font-bold uppercase">{route.location}</span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-white leading-tight mb-2">{route.title}</h3>
                                            <div className="flex items-center gap-4 text-sm font-medium text-zinc-300">
                                                <span className="flex items-center gap-1"><Navigation className="w-3 h-3" /> {route.distance}</span>
                                                <span className="w-1 h-1 bg-zinc-600 rounded-full" />
                                                <span>{route.estimatedTime}</span>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Nearby Grid */}
                <section>
                    <h2 className="text-lg font-bold text-white mb-4">Nearby Rides</h2>
                    <div className="grid gap-4">
                        {nearbyRoutes.map((route) => (
                            <div
                                key={route._id}
                                onClick={() => setSelectedRoute(route)}
                                className="flex gap-4 p-3 bg-zinc-900/50 rounded-2xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
                            >
                                <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-800 flex-shrink-0 relative">
                                    <img src={route.image} className="w-full h-full object-cover" />
                                    <div className="absolute top-1 right-1 bg-black/60 backdrop-blur px-1.5 py-0.5 rounded text-[9px] font-bold text-white">
                                        {route.difficulty}
                                    </div>
                                </div>
                                <div className="flex-1 py-1">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-white">{route.title}</h3>
                                        <span className="text-orange-500 font-bold text-xs flex items-center gap-0.5">
                                            <Star className="w-3 h-3 fill-current" /> 4.8
                                        </span>
                                    </div>
                                    <p className="text-xs text-zinc-500 line-clamp-2 mb-3">{route.description}</p>
                                    <div className="flex items-center gap-3 text-xs font-mono text-zinc-400">
                                        <span>{route.distance}</span>
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
                onStartNavigation={() => console.log('Start Nav')}
                onSaveRoute={() => console.log('Save Route')}
            />

        </div>
    );
};
