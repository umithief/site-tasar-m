
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
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 animate-in fade-in slide-in-from-top-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase">
                            Keşfet & <span className="text-orange-500">Sür</span>
                        </h1>
                        <p className="text-zinc-400 text-sm mt-1">
                            En iyi motosiklet rotalarını keşfet veya kendi rotanı oluştur.
                        </p>
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
                        className="py-3 px-6 shadow-lg shadow-orange-500/20"
                    >
                        <Plus className="w-5 h-5 mr-2" /> YENİ ROTA OLUŞTUR
                    </Button>
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
