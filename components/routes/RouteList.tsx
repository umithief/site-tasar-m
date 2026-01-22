import React, { useMemo } from 'react';
import { Route } from '../../types';
import { RouteCard } from './RouteCard';
import { Search, Map as MapIcon, Loader2, Filter, SlidersHorizontal, Mic } from 'lucide-react';
import { motion } from 'framer-motion';

interface RouteListProps {
    routes: Route[];
    isLoading: boolean;
    onSelectRoute: (route: Route) => void;
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    difficultyFilter: string;
    setDifficultyFilter: (d: string) => void;
}

export const RouteList: React.FC<RouteListProps> = ({
    routes,
    isLoading,
    onSelectRoute,
    searchQuery,
    setSearchQuery,
    difficultyFilter,
    setDifficultyFilter
}) => {

    const filteredRoutes = useMemo(() => {
        let res = routes;
        if (searchQuery) {
            const lowQ = searchQuery.toLowerCase();
            res = res.filter(r =>
                r.title.toLowerCase().includes(lowQ) ||
                r.location?.toLowerCase().includes(lowQ) ||
                r.description?.toLowerCase().includes(lowQ)
            );
        }
        if (difficultyFilter !== 'All') {
            res = res.filter(r => r.difficulty === difficultyFilter);
        }
        return res;
    }, [routes, searchQuery, difficultyFilter]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-[#E2FF3B]" />
                <p>Motosiklet rotaları yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Premium Filter Header */}
            <div className="sticky top-24 z-30">
                <div className="bg-[#121212]/80 backdrop-blur-xl border border-white/10 p-2 md:p-3 rounded-2xl shadow-2xl flex flex-col md:flex-row gap-3">

                    {/* Search Bar */}
                    <div className="relative group w-full md:flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-zinc-500 group-focus-within:text-[#E2FF3B] transition-colors" />
                        </div>
                        <input
                            type="text"
                            placeholder="Rota, şehir veya özellik ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full pl-10 pr-10 py-3 rounded-xl bg-white/5 border border-white/5 text-sm text-white placeholder-zinc-500 focus:bg-black focus:border-[#E2FF3B] focus:ring-1 focus:ring-[#E2FF3B] transition-all outline-none"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer hover:text-white text-zinc-500">
                            <Mic size={16} />
                        </div>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex bg-black/40 p-1.5 rounded-xl border border-white/5 overflow-x-auto custom-scrollbar">
                        {['All', 'Kolay', 'Orta', 'Zor', 'Extreme'].map((lvl) => {
                            const isActive = difficultyFilter === lvl;
                            return (
                                <button
                                    key={lvl}
                                    onClick={() => setDifficultyFilter(lvl)}
                                    className={`relative px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap z-10 ${isActive ? 'text-black' : 'text-zinc-400 hover:text-white'
                                        }`}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeFilter"
                                            className="absolute inset-0 bg-[#E2FF3B] rounded-lg -z-10 shadow-[0_0_15px_rgba(226,255,59,0.3)]"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    {lvl === 'All' ? 'TÜMÜ' : lvl.toUpperCase()}
                                </button>
                            );
                        })}
                    </div>

                    {/* More Filters Button */}
                    <button className="hidden md:flex items-center justify-center p-3 rounded-xl bg-white/5 border border-white/5 text-white hover:bg-white/10 hover:border-white/20 transition-all">
                        <SlidersHorizontal size={18} />
                    </button>

                </div>
            </div>

            {/* Results Grid */}
            {filteredRoutes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 text-center rounded-3xl border border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                    <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6">
                        <MapIcon className="w-10 h-10 text-zinc-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">Rota Bulunamadı</h3>
                    <p className="text-zinc-500 max-w-md mx-auto px-4">
                        Aradığınız kriterlere uygun sürüş rotası bulunamadı. Filtreleri temizleyip tekrar deneyin.
                    </p>
                    <button
                        onClick={() => { setSearchQuery(''); setDifficultyFilter('All'); }}
                        className="mt-6 text-[#E2FF3B] hover:underline text-sm font-bold uppercase tracking-wider"
                    >
                        Filtreleri Temizle
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 px-1">
                    {filteredRoutes.map(route => (
                        <RouteCard
                            key={route._id}
                            route={route}
                            onClick={() => onSelectRoute(route)}
                            onNavigate={() => onSelectRoute(route)}
                            onDetails={() => onSelectRoute(route)}
                        />
                    ))}
                </div>
            )}

            {/* Bottom Gradient Fade */}
            <div className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-20" />
        </div>
    );
};
