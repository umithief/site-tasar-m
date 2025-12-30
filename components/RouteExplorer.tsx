
import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import { Route, User as UserType } from '../types';
import { routeService } from '../services/routeService';
import { notify } from '../services/notificationService';
import { RouteList } from './routes/RouteList';
import { RouteCreator } from './routes/RouteCreator';
import { RouteDetailModal } from './routes/RouteDetailModal';
import { Button } from './ui/Button';

interface RouteExplorerProps {
    user?: UserType | null;
    onOpenAuth?: () => void;
    onStartRide?: (route: Route | null) => void;
    isEmbedded?: boolean;
}

export const RouteExplorer: React.FC<RouteExplorerProps> = ({ user, onOpenAuth, onStartRide, isEmbedded }) => {
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('All');

    useEffect(() => {
        loadRoutes();
    }, []);

    const loadRoutes = async () => {
        setIsLoading(true);
        try {
            const data = await routeService.getRoutes();
            if (Array.isArray(data)) {
                setRoutes(data);
            }
        } catch (error) {
            console.error("Error loading routes:", error);
            notify.error("Rotalar yüklenemedi.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateRoute = async (routeData: Partial<Route>) => {
        if (!user) {
            notify.error("Rota oluşturmak için giriş yapmalısınız.");
            onOpenAuth?.();
            return;
        }

        try {
            await routeService.createRoute(routeData, "token-placeholder"); // Token is handled by api interceptor
            notify.success("Rota başarıyla oluşturuldu!");
            setViewMode('list');
            loadRoutes(); // Reload list
        } catch (error) {
            console.error("Create route error:", error);
            notify.error("Rota oluşturulurken hata oluştu.");
        }
    };

    const handleStartRide = (route: Route) => {
        setSelectedRoute(null);
        onStartRide?.(route);
    };

    return (
        <div className="w-full max-w-[1600px] mx-auto p-4 md:p-6 space-y-6 pb-24 lg:pb-6">

            {/* Header / Mode Switcher */}
            {viewMode === 'list' && (
                <div className="relative rounded-[2.5rem] overflow-hidden mb-8 border border-white/10 shadow-2xl group min-h-[300px]">
                    <div className="absolute inset-0">
                        <img src="https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=2940&auto=format&fit=crop" className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt="Routes Code" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent"></div>
                    </div>

                    <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row justify-between items-end gap-6 h-full mt-20 md:mt-0">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="bg-orange-500 text-black text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Premium</span>
                                <span className="text-white/60 text-xs font-bold uppercase tracking-wider">Motosiklet Rotaları</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-white italic tracking-tighter uppercase mb-4 leading-none text-shadow-xl">
                                Keşfet & <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-500">Sür</span>
                            </h1>
                        </div>

                        <Button
                            variant="primary"
                            onClick={() => {
                                if (!user) {
                                    notify.info("Rota oluşturmak için giriş yapmalısınız.");
                                    onOpenAuth?.();
                                } else {
                                    setViewMode('create');
                                }
                            }}
                            className="py-4 px-8 rounded-2xl shadow-lg shadow-orange-500/20 text-base mb-2 md:mb-0"
                        >
                            <Plus className="w-6 h-6 mr-2" /> YENİ ROTA OLUŞTUR
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            {viewMode === 'create' ? (
                <RouteCreator
                    onSave={handleCreateRoute}
                    onCancel={() => setViewMode('list')}
                />
            ) : (
                <RouteList
                    routes={routes}
                    isLoading={isLoading}
                    onSelectRoute={setSelectedRoute}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    difficultyFilter={difficultyFilter}
                    setDifficultyFilter={setDifficultyFilter}
                />
            )}

            {/* Detail Modal */}
            <RouteDetailModal
                route={selectedRoute}
                onClose={() => setSelectedRoute(null)}
                onStartRide={handleStartRide}
            />
        </div>
    );
};
