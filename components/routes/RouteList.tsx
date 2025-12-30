
import React, { useMemo } from 'react';
import { Route } from '../../types';
import { RouteCard } from './RouteCard';
import { Search, Map as MapIcon, Loader2 } from 'lucide-react';

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
                <Loader2 className="w-8 h-8 animate-spin mb-4 text-orange-500" />
                <p>Rotalar yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filters Header */}
            <div className="bg-zinc-900/80 backdrop-blur-md border border-white/5 p-4 rounded-2xl shadow-lg flex flex-col md:flex-row gap-4 justify-between items-center sticky top-24 z-10">
                <div className="relative group w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                    <input
                        type="text"
                        placeholder="Rota ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:border-orange-500/50 outline-none transition-all placeholder:text-zinc-600"
                    />
                </div>

                <div className="flex bg-black/40 rounded-xl p-1 gap-1 overflow-x-auto max-w-full">
                    {['All', 'Kolay', 'Orta', 'Zor', 'Extreme'].map((lvl) => (
                        <button
                            key={lvl}
                            onClick={() => setDifficultyFilter(lvl)}
                            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${difficultyFilter === lvl
                                    ? 'bg-zinc-800 text-white shadow-md border border-white/10'
                                    : 'text-zinc-500 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {lvl === 'All' ? 'TÜMÜ' : lvl.toUpperCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {filteredRoutes.length === 0 ? (
                <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-white/5 border-dashed">
                    <MapIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-white mb-2">Rota Bulunamadı</h3>
                    <p className="text-zinc-500">Arama kriterlerinize uygun rota yok.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredRoutes.map(route => (
                        <RouteCard
                            key={route._id}
                            route={route}
                            onClick={onSelectRoute}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
