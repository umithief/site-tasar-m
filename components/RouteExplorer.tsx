<<<<<<< HEAD

import React, { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
=======
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Map as MapIcon, List, Plus, User, RotateCcw, X, MapPin, Navigation, ArrowRight, Trophy, Target, Users, Trash2, Save, Calendar, AlertCircle, Search, ExternalLink, Flag, Filter } from 'lucide-react';
>>>>>>> restore-2025-12-25
import { Route, User as UserType } from '../types';
import { routeService } from '../services/routeService';
import { notify } from '../services/notificationService';
<<<<<<< HEAD
import { RouteList } from './routes/RouteList';
import { RouteCreator } from './routes/RouteCreator';
import { RouteDetailModal } from './routes/RouteDetailModal';
import { Button } from './ui/Button';
=======
import { useLanguage } from '../contexts/LanguageProvider';
import { RouteCard } from './routes/RouteCard';
import { RouteDetailModal } from './routes/RouteDetailModal';
import { RouteFilters } from './routes/RouteFilters'; // Ensure this component is styled compatibly or accept className
import { UserAvatar } from './ui/UserAvatar';

declare const L: any;
>>>>>>> restore-2025-12-25

interface RouteExplorerProps {
    user?: UserType | null;
    onOpenAuth?: () => void;
    onStartRide?: (route: Route | null) => void;
    isEmbedded?: boolean;
}

<<<<<<< HEAD
export const RouteExplorer: React.FC<RouteExplorerProps> = ({ user, onOpenAuth, onStartRide, isEmbedded }) => {
    const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
=======
export const RouteExplorer: React.FC<RouteExplorerProps> = ({ user, onOpenAuth, onStartRide, isEmbedded = false }) => {
    const { t } = useLanguage();
>>>>>>> restore-2025-12-25
    const [routes, setRoutes] = useState<Route[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
<<<<<<< HEAD

    // Filters State
=======
    const [focusedRouteId, setFocusedRouteId] = useState<string | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');

    const [navChoiceRoute, setNavChoiceRoute] = useState<Route | null>(null);
>>>>>>> restore-2025-12-25
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('All');

    // --- Data Fetching ---
    useEffect(() => {
<<<<<<< HEAD
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
=======
        routeService.getRoutes().then(data => {
            setRoutes(data);
            setFilteredRoutes(data);
        }).catch(err => {
            console.error('Failed to load routes:', err);
            setRoutes([]); setFilteredRoutes([]);
        });
    }, []);

    useEffect(() => {
        let res = routes;
        if (searchQuery) res = res.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.location.toLowerCase().includes(searchQuery.toLowerCase()));
        if (difficultyFilter !== 'All') res = res.filter(r => r.difficulty === difficultyFilter);
        setFilteredRoutes(res);
    }, [routes, searchQuery, difficultyFilter]);

    // --- Map Initialization (View Mode) ---
    useEffect(() => {
        if (viewMode === 'map' && mapContainerRef.current && !mapRef.current && typeof L !== 'undefined') {
            const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([39.9, 32.8], 6);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; OpenStreetMap',
                maxZoom: 19
            }).addTo(map);
            // Dark Mode Filter for Map
            if (mapContainerRef.current) {
                const tiles = mapContainerRef.current.querySelectorAll('.leaflet-tile-pane');
                tiles.forEach((t: any) => t.style.filter = 'grayscale(100%) invert(100%) brightness(0.7) contrast(1.2)');
            }
            mapRef.current = map;
        }
    }, [viewMode]);

    // --- Map Layers & Markers ---
    useEffect(() => {
        if (viewMode === 'map' && mapRef.current) {
            layersRef.current.forEach(l => l.remove());
            layersRef.current = [];
            const map = mapRef.current;

            if (focusedRouteId) {
                const route = routes.find(r => r._id === focusedRouteId);
                if (route) {
                    let latlngs: any[] = [];
                    if (route.path?.length > 0) latlngs = route.path.map(p => [p.lat, p.lng]);
                    else if (route.coordinates) latlngs = [[route.coordinates.lat, route.coordinates.lng]];

                    if (latlngs.length > 1) {
                        const poly = L.polyline(latlngs, { color: '#F2A619', weight: 6, opacity: 0.9 }).addTo(map);
                        layersRef.current.push(poly);
                        map.fitBounds(poly.getBounds(), { padding: [50, 50] });
                    } else if (latlngs.length === 1) {
                        map.setView(latlngs[0], 13);
                    }
                }
            } else {
                routes.forEach(route => {
                    if (route.coordinates) {
                        const icon = L.divIcon({
                            className: 'custom-pin',
                            html: `<div class="w-8 h-8 bg-moto-accent rounded-full border-2 border-black flex items-center justify-center shadow-lg transform hover:scale-125 transition-transform"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="text-black"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
                            iconSize: [32, 32], iconAnchor: [16, 32]
                        });
                        const marker = L.marker([route.coordinates.lat, route.coordinates.lng], { icon })
                            .addTo(map)
                            .on('click', () => setFocusedRouteId(route._id));
                        layersRef.current.push(marker);
                    }
                });
            }
        }
    }, [viewMode, routes, focusedRouteId]);


    // --- Create Route Logic (Condensed) ---
    // (Keeping logic mostly same but updating UI wrappers)
    const handleCreateMapClick = (e: any) => {
        const map = createMapRef.current;
        if (!map) return;
        if (waypointsRef.current.length >= 2) { notify.info("Önce 'Temizle' deyin."); return; }
        waypointsRef.current.push(e.latlng);
        L.marker(e.latlng).addTo(map); // Simplified marker for brevity
        if (waypointsRef.current.length === 2) {
            const control = L.Routing.control({
                waypoints: waypointsRef.current,
                router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: 'driving' }),
                lineOptions: { styles: [{ color: '#F2A619', opacity: 0.8, weight: 6 }] },
                addWaypoints: false, show: false, fitSelectedRoutes: true, createMarker: () => null
            }).addTo(map);
            control.on('routesfound', (e: any) => {
                const r = e.routes[0];
                setNewRouteForm(prev => ({ ...prev, distance: `${(r.summary.totalDistance / 1000).toFixed(1)} km`, duration: `${Math.round(r.summary.totalTime / 60)} dk`, path: r.coordinates.map((c: any) => ({ lat: c.lat, lng: c.lng })), coordinates: { lat: waypointsRef.current[0].lat, lng: waypointsRef.current[0].lng } }));
            });
            routingControlRef.current = control;
        }
    };

    useEffect(() => {
        if (!isCreating || !createMapContainerRef.current || createMapRef.current) return;
        if (typeof L === 'undefined') return;
        setTimeout(() => {
            const map = L.map(createMapContainerRef.current, { zoomControl: false }).setView([39.0, 35.0], 6);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
            if (createMapContainerRef.current) {
                const tiles = createMapContainerRef.current.querySelectorAll('.leaflet-tile-pane');
                tiles.forEach((t: any) => t.style.filter = 'grayscale(100%) invert(100%) brightness(0.7) contrast(1.2)');
            }
            map.on('click', handleCreateMapClick);
            createMapRef.current = map;
        }, 100);
    }, [isCreating]);

    // --- Handlers ---
    const handleNavigation = (route: Route) => setNavChoiceRoute(route);
    const handleAnalyzeRoute = async (route: Route) => {
        setSelectedRoute(route); setAiAnalysis(null); setIsLoadingAI(true);
        try {
            const prompt = `Analiz et: ${route.title} (${route.location}), Zorluk: ${route.difficulty}. Türkçe.`;
            const response = await sendMessageToGemini(prompt);
            setAiAnalysis(response);
        } catch { setAiAnalysis("Hata."); } finally { setIsLoadingAI(false); }
    };
    const handleSaveRoute = async () => {
        if (!user || !newRouteForm.title) return;
        await routeService.addRoute({ ...newRouteForm, authorId: user._id, authorName: user.name, image: newRouteForm.image || 'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=1200' } as any);
        setIsCreating(false); notify.success("Rota eklendi!");
        // Refresh routes...
        const data = await routeService.getRoutes(); setRoutes(data);
    };

    return (
        <div className={`bg-[#09090b] min-h-screen text-white font-sans selection:bg-moto-accent/30 ${isEmbedded ? '' : 'pt-24 pb-20 lg:pb-0'}`}>
            {!isEmbedded && <div className="fixed top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-blue-900/10 to-transparent pointer-events-none" />}

            <div className={`max-w-[1600px] mx-auto px-4 lg:px-8 grid grid-cols-1 ${isEmbedded ? 'lg:grid-cols-[320px_1fr] h-full gap-6' : 'lg:grid-cols-[360px_1fr] gap-8'} relative items-start`}>

                {/* --- LEFT SIDEBAR (Controls) --- */}
                <div className={`flex flex-col gap-6 ${isEmbedded ? 'h-full overflow-hidden' : 'sticky top-28'}`}>

                    {/* Search & Filter Card */}
                    <div className="bg-[#111] border border-white/5 rounded-[2rem] p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-moto-accent/5 rounded-full blur-[50px] pointer-events-none" />

                        <h2 className="text-2xl font-black font-display text-white mb-6 uppercase tracking-tight italic">
                            Rota <span className="text-moto-accent">Keşfi</span>
                        </h2>

                        <div className="relative mb-5 group/search">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/search:text-moto-accent transition-colors" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Şehir veya rota ara..."
                                className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-sm focus:outline-none focus:border-moto-accent/50 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs font-bold text-gray-500 uppercase px-1">
                                <span>Zorluk Seviyesi</span>
                                <Filter className="w-3 h-3" />
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['All', 'Kolay', 'Orta', 'Zor', 'Extreme'].map(lvl => (
                                    <button
                                        key={lvl}
                                        onClick={() => setDifficultyFilter(lvl)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${difficultyFilter === lvl ? 'bg-moto-accent text-black border-moto-accent' : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
                                    >
                                        {lvl === 'All' ? 'Tümü' : lvl}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-[1px] bg-white/5 w-full my-6"></div>

                        <div className="grid grid-cols-2 gap-3">
                            <Button onClick={onOpenAuth} disabled={!!user} className="w-full py-3 bg-white/5 hover:bg-white hover:text-black border border-white/10 text-white justify-center font-bold text-xs rounded-xl transition-all">
                                <User className="w-4 h-4 mr-2" /> {user ? 'Giriş Yapıldı' : 'Giriş Yap'}
                            </Button>
                            <Button onClick={() => user ? setIsCreating(true) : onOpenAuth && onOpenAuth()} className="w-full py-3 bg-moto-accent text-black hover:bg-white justify-center font-bold text-xs rounded-xl shadow-lg shadow-moto-accent/10 transition-all">
                                <Plus className="w-4 h-4 mr-2" /> Rota Oluştur
                            </Button>
                        </div>
>>>>>>> restore-2025-12-25
                    </div>

                    {/* Stats / Challenge Card */}
                    <div className="bg-gradient-to-br from-[#111] to-black border border-white/5 rounded-[2rem] p-6 relative overflow-hidden group hover:border-moto-accent/30 transition-all cursor-pointer">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <div className="p-1.5 bg-yellow-500/10 rounded-lg text-yellow-500"><Trophy className="w-4 h-4" /></div>
                                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest">Haftanın Rotası</span>
                            </div>
                            <h3 className="text-lg font-bold text-white leading-tight mb-4">Marmaris - Datça Virajları</h3>
                            <div className="flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-[#111] bg-gray-800" />)}
                                </div>
                                <span className="text-xs font-bold text-gray-500">234 kişi sürdü</span>
                            </div>
                        </div>
                    </div>

                </div>
<<<<<<< HEAD
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
=======

                {/* --- MAIN CONTENT (Grid or Map) --- */}
                <div className={`flex flex-col h-full overflow-hidden ${isEmbedded ? '' : 'min-h-[80vh]'}`}>

                    {/* Toolbar */}
                    <div className="flex items-center justify-between mb-6 px-2">
                        <h3 className="font-bold text-white text-lg tracking-tight">Bulunan Rotalar <span className="text-gray-500 text-sm ml-2">({filteredRoutes.length})</span></h3>
                        <div className="flex bg-[#111] p-1 rounded-xl border border-white/5">
                            <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'grid' ? 'bg-moto-accent text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                                <List className="w-4 h-4" /> Liste
                            </button>
                            <button onClick={() => setViewMode('map')} className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${viewMode === 'map' ? 'bg-moto-accent text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}>
                                <MapIcon className="w-4 h-4" /> Harita
                            </button>
                        </div>
                    </div>

                    {/* Content Area */}
                    {viewMode === 'grid' ? (
                        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar ${isEmbedded ? 'pb-24' : ''}`}>
                            {filteredRoutes.map(route => (
                                <RouteCard
                                    key={route._id}
                                    route={route}
                                    onClick={() => handleAnalyzeRoute(route)}
                                    onNavigate={() => handleNavigation(route)}
                                    onDetails={() => handleAnalyzeRoute(route)}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 bg-[#111] rounded-[2.5rem] border border-white/5 relative overflow-hidden shadow-2xl">
                            <div ref={mapContainerRef} className="w-full h-full z-0" />

                            {/* Map Overlay Info */}
                            {focusedRouteId && (
                                <div className="absolute top-6 left-6 z-[400] bg-[#111]/90 backdrop-blur-md border border-white/10 p-5 rounded-2xl w-72 shadow-2xl animate-in slide-in-from-left duration-300">
                                    {(() => {
                                        const r = routes.find(ro => ro._id === focusedRouteId);
                                        if (!r) return null;
                                        return (
                                            <>
                                                <div className="flex justify-between items-start mb-2">
                                                    <h3 className="font-bold text-white text-lg leading-tight">{r.title}</h3>
                                                    <button onClick={() => setFocusedRouteId(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
                                                </div>
                                                <p className="text-xs text-gray-400 mb-4 flex items-center gap-1"><MapPin className="w-3 h-3" /> {r.location}</p>
                                                <div className="grid grid-cols-2 gap-2 mb-4">
                                                    <div className="bg-white/5 rounded-lg p-2 text-center">
                                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Mesafe</div>
                                                        <div className="text-white font-mono text-sm">{r.distance}</div>
                                                    </div>
                                                    <div className="bg-white/5 rounded-lg p-2 text-center">
                                                        <div className="text-[10px] text-gray-500 uppercase font-bold">Zorluk</div>
                                                        <div className="text-moto-accent font-bold text-sm">{r.difficulty}</div>
                                                    </div>
                                                </div>
                                                <button onClick={() => handleAnalyzeRoute(r)} className="w-full py-2 bg-moto-accent text-black rounded-lg font-bold text-xs hover:scale-105 transition-transform">
                                                    DETAYLARI GÖR
                                                </button>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}
                        </div>
                    )}

                </div>
            </div>

            {/* Modals */}
            {isCreating && createPortal(
                <div className="fixed inset-0 z-[1000] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4">
                    <div className="bg-[#09090b] border border-white/10 rounded-[2.5rem] w-full max-w-6xl h-[90vh] flex flex-col md:flex-row overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        {/* Map Side */}
                        <div className="flex-1 relative bg-[#111]">
                            <div ref={createMapContainerRef} className="absolute inset-0" />
                            <div className="absolute top-6 left-6 z-[400] w-72">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black font-bold" />
                                    <input
                                        type="text"
                                        placeholder="Konum ara..."
                                        className="w-full bg-white/90 backdrop-blur text-black font-bold border-none rounded-xl pl-10 pr-4 py-3 shadow-xl focus:ring-2 ring-moto-accent"
                                    />
                                </div>
                            </div>
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur px-6 py-3 rounded-full border border-white/10 flex gap-4 text-xs font-bold text-white z-[400] shadow-2xl">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500" /> Başlangıç</span>
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500" /> Bitiş</span>
                            </div>
                        </div>
                        {/* Form Side */}
                        <div className="w-full md:w-[420px] bg-[#111] border-l border-white/10 flex flex-col h-full">
                            <div className="p-6 border-b border-white/10 flex justify-center items-center relative">
                                <h3 className="font-black font-display text-2xl text-white italic">ROTA <span className="text-moto-accent">OLUŞTUR</span></h3>
                                <button onClick={() => setIsCreating(false)} className="absolute right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X className="w-6 h-6 text-gray-400" /></button>
                            </div>
                            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rota Başlığı</label>
                                    <input type="text" value={newRouteForm.title} onChange={e => setNewRouteForm({ ...newRouteForm, title: e.target.value })} className="w-full bg-black/40 border-b border-white/20 p-3 text-lg font-bold text-white focus:border-moto-accent outline-none transition-colors placeholder-gray-700" placeholder="Örn: Toros Geçişi" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Zorluk</label>
                                        <select value={newRouteForm.difficulty} onChange={e => setNewRouteForm({ ...newRouteForm, difficulty: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                                            {['Kolay', 'Orta', 'Zor', 'Extreme'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mevsim</label>
                                        <select value={newRouteForm.bestSeason} onChange={e => setNewRouteForm({ ...newRouteForm, bestSeason: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white outline-none">
                                            {['İlkbahar', 'Yaz', 'Sonbahar', 'Kış'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl flex justify-between items-center text-center">
                                    <div><div className="text-xs text-gray-500 font-bold uppercase">Mesafe</div><div className="text-xl font-mono text-moto-accent">{newRouteForm.distance || '-'}</div></div>
                                    <div className="w-[1px] h-8 bg-white/10" />
                                    <div><div className="text-xs text-gray-500 font-bold uppercase">Süre</div><div className="text-xl font-mono text-white">{newRouteForm.duration || '-'}</div></div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Açıklama</label>
                                    <textarea value={newRouteForm.description} onChange={e => setNewRouteForm({ ...newRouteForm, description: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-sm text-white h-24 resize-none focus:border-moto-accent outline-none" placeholder="Rota detayları..." />
                                </div>
                            </div>
                            <div className="p-6 border-t border-white/10">
                                <Button onClick={handleSaveRoute} disabled={!newRouteForm.title} className="w-full py-4 bg-moto-accent text-black font-black text-lg rounded-xl hover:scale-[1.02] transition-transform shadow-lg shadow-moto-accent/20">
                                    KAYDET VE PAYLAŞ
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>, document.body
            )}

            {/* Nav Modal */}
            {navChoiceRoute && createPortal(
                <div className="fixed inset-0 z-[1200] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-[#111] border border-white/10 rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl">
                        <h3 className="text-2xl font-black text-white italic mb-2">SÜRÜŞE <span className="text-moto-accent">BAŞLA</span></h3>
                        <p className="text-gray-400 mb-8 text-sm">Navigasyon yönteminizi seçin.</p>
                        <div className="space-y-3">
                            <button onClick={() => { window.open(`https://www.google.com/maps/dir/?api=1&destination=${navChoiceRoute.coordinates.lat},${navChoiceRoute.coordinates.lng}`, '_blank'); setNavChoiceRoute(null); }} className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:bg-gray-200">
                                <MapPin className="w-5 h-5" /> Google Haritalar
                            </button>
                            <button onClick={() => { if (onStartRide) onStartRide(navChoiceRoute); setNavChoiceRoute(null); setSelectedRoute(null); }} className="w-full py-4 bg-moto-accent text-black font-bold rounded-xl flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                                <Navigation className="w-5 h-5" /> MotoVibe Nav
                            </button>
                        </div>
                        <button onClick={() => setNavChoiceRoute(null)} className="mt-6 text-xs text-gray-500 font-bold hover:text-white">İPTAL</button>
                    </div>
                </div>, document.body
            )}

            <RouteDetailModal route={selectedRoute} isOpen={!!selectedRoute} onClose={() => setSelectedRoute(null)} onStartRide={handleNavigation} />
>>>>>>> restore-2025-12-25
        </div>
    );
};
