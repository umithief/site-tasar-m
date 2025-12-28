
import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Map as MapIcon, List, Plus, User, Play, RotateCcw, Sparkles, X, MousePointer2, MapPin, Navigation, ArrowRight, Trophy, Target, Users, Trash2, Save, Calendar, BarChart3, AlertCircle, Search, ExternalLink, Flag, Film } from 'lucide-react';
import { Route, User as UserType } from '../types';
import { Button } from './ui/Button';
import { sendMessageToGemini } from '../services/geminiService';
import { routeService } from '../services/routeService';
import { notify } from '../services/notificationService';
import { useLanguage } from '../contexts/LanguageProvider';

declare const L: any;

interface RouteExplorerProps {
    user?: UserType | null;
    onOpenAuth?: () => void;
    onStartRide?: (route: Route | null) => void;
    isEmbedded?: boolean;
}

const getYouTubeID = (url: string) => {
    if (!url) return false;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7] && match[7].length === 11) ? match[7] : false;
};

export const RouteExplorer: React.FC<RouteExplorerProps> = ({ user, onOpenAuth, onStartRide, isEmbedded = false }) => {
    const { t } = useLanguage();
    const [routes, setRoutes] = useState<Route[]>([]);
    const [filteredRoutes, setFilteredRoutes] = useState<Route[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
    const [focusedRouteId, setFocusedRouteId] = useState<string | null>(null);
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [isLoadingAI, setIsLoadingAI] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [dataError, setDataError] = useState<string | null>(null);

    const [navChoiceRoute, setNavChoiceRoute] = useState<Route | null>(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('All');

    const [isCreating, setIsCreating] = useState(false);
    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const [newRouteForm, setNewRouteForm] = useState<Partial<Route>>({
        title: '', description: '', difficulty: 'Orta', distance: '', duration: '', location: '', bestSeason: 'Yaz', image: '', tags: [], path: [], coordinates: { lat: 0, lng: 0 }
    } as any);

    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const layersRef = useRef<any[]>([]);

    const createMapRef = useRef<any>(null);
    const createMapContainerRef = useRef<HTMLDivElement>(null);
    const waypointsRef = useRef<any[]>([]);
    const routingControlRef = useRef<any>(null);

    useEffect(() => {
        setIsLoadingData(true);
        console.log("Fetching routes...");
        routeService.getRoutes()
            .then(data => {
                console.log("Routes fetched:", data);
                if (Array.isArray(data)) {
                    setRoutes(data);
                    setFilteredRoutes(data);
                } else {
                    console.error("Data is not an array:", data);
                    setDataError("Veri formatı hatalı.");
                }
            })
            .catch(err => {
                console.error("Error fetching routes:", err);
                setDataError("Rotalar yüklenirken bir hata oluştu.");
            })
            .finally(() => {
                setIsLoadingData(false);
            });
    }, []);

    useEffect(() => {
        let res = routes;
        if (searchQuery) {
            res = res.filter(r => r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.location.toLowerCase().includes(searchQuery.toLowerCase()));
        }
        if (difficultyFilter !== 'All') {
            res = res.filter(r => r.difficulty === difficultyFilter);
        }
        setFilteredRoutes(res);
    }, [routes, searchQuery, difficultyFilter]);

    useEffect(() => {
        if (viewMode === 'map' && mapContainerRef.current && !mapRef.current && typeof L !== 'undefined') {
            const map = L.map(mapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([39.9, 32.8], 6);
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);
            mapRef.current = map;
        }
    }, [viewMode]);

    useEffect(() => {
        if (viewMode === 'map' && mapRef.current) {
            layersRef.current.forEach(l => l.remove());
            layersRef.current = [];
            const map = mapRef.current;

            if (focusedRouteId) {
                const route = routes.find(r => r._id === focusedRouteId);
                if (route) {
                    let latlngs: any[] = [];

                    if (route.path && route.path.length > 0) {
                        latlngs = route.path
                            .filter(p => p && typeof p.lat === 'number' && typeof p.lng === 'number')
                            .map(p => [p.lat, p.lng]);
                    } else if (route.coordinates && typeof (route.coordinates as any).lat === 'number' && typeof (route.coordinates as any).lng === 'number') {
                        latlngs = [[(route.coordinates as any).lat, (route.coordinates as any).lng]];
                    }

                    if (latlngs.length > 1) {
                        const glowLine = L.polyline(latlngs, { color: '#F2A619', weight: 12, opacity: 0.3, lineCap: 'round', lineJoin: 'round' }).addTo(map);
                        const mainLine = L.polyline(latlngs, { color: '#fff', weight: 4, opacity: 1, lineCap: 'round' }).addTo(map);
                        layersRef.current.push(glowLine, mainLine);
                        try {
                            map.fitBounds(glowLine.getBounds(), { padding: [100, 100], maxZoom: 14 });
                        } catch (e) { console.warn("Cannot fit bounds", e); }
                    } else if (latlngs.length === 1) {
                        try {
                            map.setView(latlngs[0], 14, { animate: true });
                        } catch (e) { console.warn("Cannot set view", e); }
                    }

                    if (latlngs.length > 0) {
                        const startIcon = L.divIcon({ className: 'map-marker-start', html: `<div class="relative flex items-center justify-center w-8 h-8"><div class="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-50"></div><div class="relative w-6 h-6 bg-green-500 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-[10px]">A</div></div>`, iconSize: [32, 32], iconAnchor: [16, 16] });
                        layersRef.current.push(L.marker(latlngs[0], { icon: startIcon }).addTo(map));
                    }
                    if (latlngs.length > 1) {
                        const endIcon = L.divIcon({ className: 'map-marker-end', html: `<div class="relative flex items-center justify-center w-8 h-8"><div class="relative w-6 h-6 bg-red-600 rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-bold text-[10px]">B</div></div>`, iconSize: [32, 32], iconAnchor: [16, 16] });
                        layersRef.current.push(L.marker(latlngs[latlngs.length - 1], { icon: endIcon }).addTo(map));
                    }
                }
            } else {
                routes.forEach(route => {
                    const coords = route.coordinates as any;
                    if (coords && typeof coords.lat === 'number' && typeof coords.lng === 'number') {
                        const icon = L.divIcon({
                            className: 'custom-map-pin',
                            html: `<div class="group relative flex flex-col items-center cursor-pointer transition-transform hover:scale-110 hover:-translate-y-2"><div class="w-10 h-10 bg-[#1A1A17] rounded-xl border-2 border-[#F2A619] shadow-[0_0_15px_rgba(242,166,25,0.5)] flex items-center justify-center overflow-hidden"><img src="${route.image}" class="w-full h-full object-cover opacity-80 group-hover:opacity-100" /></div><div class="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#F2A619] -mt-[1px]"></div></div>`,
                            iconSize: [40, 50],
                            iconAnchor: [20, 50],
                            popupAnchor: [0, -50]
                        });

                        const marker = L.marker([coords.lat, coords.lng], { icon })
                            .addTo(map)
                            .bindPopup(`<div class="font-sans text-center"><h3 class="font-bold text-base mb-1">${route.title}</h3><div class="text-xs text-gray-500 mb-2">${route.location}</div><span class="inline-block px-2 py-1 bg-[#F2A619] text-black text-[10px] font-bold rounded uppercase">${route.difficulty}</span><div class="mt-2 text-xs font-mono">${route.distance}</div></div>`, { closeButton: false, className: 'custom-popup-dark' })
                            .on('click', () => setFocusedRouteId(route._id));
                        layersRef.current.push(marker);
                    }
                });

                if (routes.length > 0 && layersRef.current.length > 0) {
                    const group = new L.featureGroup(layersRef.current);
                    try {
                        map.fitBounds(group.getBounds().pad(0.2));
                    } catch (e) { console.warn("Cannot fit bounds", e); }
                }
            }
        }
    }, [viewMode, routes, focusedRouteId]);

    const handleCreateMapClick = (e: any) => {
        const map = createMapRef.current;
        if (!map) return;

        if (waypointsRef.current.length >= 2) {
            notify.info("Lütfen önce 'Haritayı Temizle' butonunu kullanın.");
            return;
        }

        waypointsRef.current.push(e.latlng);

        const isStart = waypointsRef.current.length === 1;
        const colorClass = isStart ? 'bg-green-500' : 'bg-red-600';
        const label = isStart ? 'BAŞLANGIÇ' : 'BİTİŞ';
        const iconSvg = isStart
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path><line x1="4" y1="22" x2="4" y2="15"></line></svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4 text-white"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"></path><circle cx="12" cy="10" r="3"></circle></svg>`;

        const markerIcon = L.divIcon({
            className: 'c-marker-enhanced',
            html: `
            <div class="flex flex-col items-center">
                <div class="px-2 py-1 ${colorClass} text-white text-[10px] font-bold rounded-md shadow-lg mb-1 whitespace-nowrap">${label}</div>
                <div class="relative flex items-center justify-center w-8 h-8 ${colorClass} rounded-full border-2 border-white shadow-xl">
                    ${iconSvg}
                </div>
                <div class="w-1 h-8 bg-white/50"></div>
            </div>
          `,
            iconSize: [40, 80],
            iconAnchor: [20, 80]
        });

        L.marker(e.latlng, { icon: markerIcon }).addTo(map);

        if (waypointsRef.current.length === 2) {
            if (routingControlRef.current) {
                map.removeControl(routingControlRef.current);
            }

            const control = L.Routing.control({
                waypoints: waypointsRef.current,
                router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: 'driving' }),
                lineOptions: { styles: [{ color: '#F2A619', opacity: 0.8, weight: 8, className: 'animate-draw' }] },
                createMarker: () => null,
                addWaypoints: false,
                show: false,
                fitSelectedRoutes: true
            }).addTo(map);

            control.on('routesfound', (e: any) => {
                const r = e.routes[0];
                setNewRouteForm(prev => ({
                    ...prev,
                    distance: `${(r.summary.totalDistance / 1000).toFixed(1)} km`,
                    duration: `${Math.round(r.summary.totalTime / 60)} dk`,
                    path: r.coordinates.map((c: any) => ({ lat: c.lat, lng: c.lng })),
                    coordinates: { lat: waypointsRef.current[0].lat, lng: waypointsRef.current[0].lng } as any,
                }));
                notify.success("Rota başarıyla hesaplandı!");
            });

            control.on('routingerror', (e: any) => {
                console.error("Routing error:", e);
                notify.error("Rota hesaplanamadı. Lütfen noktaları değiştirin.");
            });

            routingControlRef.current = control;
        }
    };

    useEffect(() => {
        if (!isCreating || !createMapContainerRef.current) return;
        if (createMapRef.current) return;

        if (typeof L === 'undefined') {
            console.error("Leaflet not loaded");
            return;
        }

        const initCreateMap = () => {
            if (!createMapContainerRef.current) return;

            if (createMapRef.current) {
                createMapRef.current.remove();
                createMapRef.current = null;
            }

            const map = L.map(createMapContainerRef.current, { zoomControl: false, attributionControl: false }).setView([39.0, 35.0], 6);

            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles &copy; Esri'
            }).addTo(map);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 20
            }).addTo(map);

            map.on('click', handleCreateMapClick);
            createMapRef.current = map;

            map.invalidateSize();
        };

        const timer = setTimeout(initCreateMap, 100);

        const resizeTimer = setTimeout(() => {
            if (createMapRef.current) {
                createMapRef.current.invalidateSize();
            }
        }, 600);

        return () => {
            clearTimeout(timer);
            clearTimeout(resizeTimer);
            if (createMapRef.current) {
                createMapRef.current.off('click', handleCreateMapClick);
                createMapRef.current.remove();
                createMapRef.current = null;
                waypointsRef.current = [];
                routingControlRef.current = null;
            }
        };
    }, [isCreating]);

    const handleMapSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mapSearchQuery || !createMapRef.current) return;

        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                createMapRef.current.flyTo([lat, lon], 12, { duration: 1.5 });
                notify.success(`Konum bulundu: ${data[0].display_name.split(',')[0]}`);
            } else {
                notify.error("Konum bulunamadı.");
            }
        } catch (error) {
            console.error(error);
            notify.error("Arama sırasında hata oluştu.");
        }
    };

    const handleClearMap = () => {
        if (createMapRef.current) {
            createMapRef.current.eachLayer((layer: any) => {
                if (!layer._url) {
                    createMapRef.current.removeLayer(layer);
                }
            });

            waypointsRef.current = [];
            if (routingControlRef.current) {
                try {
                    createMapRef.current.removeControl(routingControlRef.current);
                } catch (e) { }
                routingControlRef.current = null;
            }
            setNewRouteForm(prev => ({ ...prev, distance: '', duration: '', path: [], coordinates: { lat: 0, lng: 0 } as any }));
        }
    };

    const handleAnalyzeRoute = async (route: Route) => {
        setSelectedRoute(route); setAiAnalysis(null); setIsLoadingAI(true);
        try {
            const prompt = `Analiz et: ${route.title} (${route.location}), Zorluk: ${route.difficulty}. Format: 1. Yol Durumu, 2. Sürüş Tavsiyesi, 3. Ekipman. Türkçe.`;
            const response = await sendMessageToGemini(prompt);
            setAiAnalysis(response);
        } catch { setAiAnalysis("Analiz yapılamadı."); } finally { setIsLoadingAI(false); }
    };

    const handleCreateRoute = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!newRouteForm.title || !newRouteForm.path || newRouteForm.path.length === 0) {
            notify.error("Lütfen haritadan bir rota çizin ve başlık girin.");
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                notify.error("Oturum süresi dolmuş.");
                return;
            }

            const added = await routeService.createRoute({
                ...newRouteForm,
                authorId: user._id,
                authorName: user.name,
                image: newRouteForm.image || 'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=1200'
            } as any, token);

            setRoutes([added, ...routes]);
            setIsCreating(false);
            setNewRouteForm({ title: '', description: '', difficulty: 'Orta', distance: '', duration: '', location: '', bestSeason: 'Yaz', image: '', tags: [], path: [], coordinates: { lat: 0, lng: 0 } } as any);
            notify.success("Rota başarıyla oluşturuldu!");
        } catch (e) {
            console.error(e);
            notify.error("Rota oluşturulurken bir hata oluştu.");
        }
    };

    const handleRouteSelection = (route: Route) => {
        setNavChoiceRoute(route);
    };

    const handleNavigateGoogle = () => {
        if (!navChoiceRoute?.coordinates) return;
        const { lat, lng } = navChoiceRoute.coordinates as any;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
        window.open(url, '_blank');
        setNavChoiceRoute(null);
    };

    const handleNavigateMotoVibe = () => {
        if (onStartRide && navChoiceRoute) {
            onStartRide(navChoiceRoute);
        }
        setNavChoiceRoute(null);
        setSelectedRoute(null);
    };

    return (
        <div className={isEmbedded
            ? "w-full h-full flex flex-col lg:flex-row gap-6 p-4 overflow-hidden"
            : "pt-24 pb-20 px-4 max-w-[1920px] mx-auto min-h-screen flex flex-col lg:flex-row gap-8"
        }>

            <aside className={`w-full lg:w-80 flex-shrink-0 flex flex-col gap-6 ${isEmbedded ? 'overflow-y-auto no-scrollbar h-full pb-20' : ''}`}>

                <div className="bg-zinc-900/80 backdrop-blur-md border border-white/5 rounded-2xl p-6 sticky top-24 shadow-2xl">
                    {/* Header & Search */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <MapIcon className="w-5 h-5 text-orange-500" /> Rotalar
                        </h2>

                        <div className="relative group mb-6">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                            <input
                                type="text"
                                placeholder="Rota veya konum ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-orange-500/50 outline-none transition-all placeholder:text-zinc-600"
                            />
                        </div>

                        {/* Filters */}
                        <div className="mb-6">
                            <div className="flex flex-wrap gap-2">
                                {['All', 'Kolay', 'Orta', 'Zor', 'Extreme'].map(lvl => (
                                    <button
                                        key={lvl}
                                        onClick={() => setDifficultyFilter(lvl)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${difficultyFilter === lvl
                                            ? 'bg-orange-500 text-black border-orange-500 shadow-lg shadow-orange-500/20'
                                            : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-800'
                                            }`}
                                    >
                                        {lvl === 'All' ? 'Tümü' : lvl}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-6 border-t border-white/5">
                        <Button
                            onClick={() => { if (onStartRide) onStartRide(null); }}
                            className="w-full bg-white text-black hover:bg-zinc-200 justify-center py-3 font-bold text-sm tracking-wide rounded-xl flex items-center gap-2 transition-all shadow-lg"
                        >
                            <Navigation className="w-4 h-4" /> Serbest Sürüş
                        </Button>

                        {user ? (
                            <Button onClick={() => setIsCreating(true)} className="w-full bg-zinc-800/50 text-zinc-300 hover:text-white border border-white/5 hover:border-orange-500/50 justify-center py-3 rounded-xl flex items-center gap-2 transition-all">
                                <Plus className="w-4 h-4" /> Rota Oluştur
                            </Button>
                        ) : (
                            <Button variant="outline" onClick={onOpenAuth} className="w-full border-white/10 text-zinc-500 hover:text-white hover:border-white/20 justify-center py-3 rounded-xl flex items-center gap-2">
                                <User className="w-4 h-4" /> Giriş Yap
                            </Button>
                        )}
                    </div>
                </div>

                <div
                    className="mt-6 group relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-orange-500/20 p-6 cursor-pointer hover:border-orange-500/50 transition-all shadow-xl"
                    onClick={() => {
                        const challengeRoute = routes.find(r => r.difficulty === 'Zor' || r.difficulty === 'Extreme') || routes[0];
                        if (challengeRoute) handleAnalyzeRoute(challengeRoute);
                    }}
                >
                    <div className="flex justify-between items-start mb-4">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-orange-500">Haftanın Rotası</div>
                        <span className="text-[10px] font-bold text-zinc-500">+500 XP</span>
                    </div>

                    <h3 className="text-lg font-bold text-white mb-2 leading-tight group-hover:text-orange-500 transition-colors">
                        Trans Toros Geçişi
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium group-hover:text-white transition-colors">
                        <span>Görevi İncele</span>
                        <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </div>
                </div>

                <div className="flex flex-col gap-2 p-2">
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Bugün Tamamlanan</span>
                        <span className="text-white font-bold font-mono">1,240</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500">Aktif Sürücü</span>
                        <span className="text-white font-bold font-mono">428</span>
                    </div>
                </div>

            </aside>

            <main className={`flex-1 min-w-0 ${isEmbedded && viewMode === 'grid' ? 'overflow-y-auto no-scrollbar h-full pb-20' : 'relative'}`}>
                {/* Minimal Header */}
                <div className="flex items-center justify-between mb-8 bg-zinc-900/80 backdrop-blur-md border border-white/5 p-4 rounded-2xl shadow-lg">
                    <span className="text-white text-sm font-bold pl-2 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                        {filteredRoutes.length} Rota Bulundu
                    </span>
                    <div className="flex bg-black/40 rounded-xl p-1 gap-1">
                        <button onClick={() => setViewMode('grid')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>
                            LİSTE
                        </button>
                        <button onClick={() => setViewMode('map')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-zinc-800 text-white shadow-md' : 'text-zinc-500 hover:text-white'}`}>
                            HARİTA
                        </button>
                    </div>
                </div>

                {isLoadingData ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-10 h-10 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : dataError ? (
                    <div className="text-center p-10 bg-red-900/20 border border-red-500/20 rounded-2xl">
                        <p className="text-red-400 font-bold mb-2">{dataError}</p>
                        <button onClick={() => window.location.reload()} className="text-white hover:underline">Tekrar Dene</button>
                    </div>
                ) : viewMode === 'grid' ? (
                    filteredRoutes.length === 0 ? (
                        <div className="text-center py-20">
                            <MapIcon className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">Henüz rota bulunmuyor.</h3>
                            <p className="text-zinc-500">Yeni bir rota oluşturarak başlayın.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-6 gap-y-10">
                            {filteredRoutes.map(route => (
                                <div key={route._id} className="group cursor-pointer bg-zinc-900/40 border border-white/5 rounded-3xl overflow-hidden hover:border-orange-500/30 transition-all hover:bg-zinc-900/60 hover:-translate-y-1 duration-300" onClick={() => handleAnalyzeRoute(route)}>
                                    {/* Image Container */}
                                    <div className="aspect-[16/10] overflow-hidden bg-zinc-900 relative">
                                        <img src={route.image} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105" />

                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-90"></div>

                                        {/* Badges */}
                                        <div className="absolute top-4 left-4 flex gap-2">
                                            <div className="px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-bold text-white border border-white/10 uppercase tracking-wider shadow-lg">
                                                {route.difficulty}
                                            </div>
                                        </div>

                                        {/* Title Overlay */}
                                        <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                            <h3 className="text-lg font-bold text-white mb-1 leading-tight group-hover:text-orange-500 transition-colors line-clamp-1">{route.title}</h3>
                                            <div className="flex items-center gap-3 text-xs text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                                                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {route.location}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content Details */}
                                    <div className="p-5 flex justify-between items-center border-t border-white/5">
                                        <div className="flex gap-4">
                                            <div>
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Mesafe</div>
                                                <div className="text-sm font-mono font-bold text-white">{route.distance.replace(' km', '')}</div>
                                            </div>
                                            <div>
                                                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Süre</div>
                                                <div className="text-sm font-mono font-bold text-white">{(route as any).duration?.replace(' Saat', 'sa')}</div>
                                            </div>
                                        </div>

                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 group-hover:bg-orange-500 group-hover:text-black transition-all">
                                            <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )) : (
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl h-[calc(100vh-200px)] relative overflow-hidden">
                        <div ref={mapContainerRef} className="w-full h-full z-0" />
                        {focusedRouteId ? (
                            <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2">
                                <button onClick={() => setFocusedRouteId(null)} className="bg-zinc-900/90 backdrop-blur text-orange-500 px-4 py-2 rounded-lg font-bold text-xs shadow-lg border border-zinc-700 flex items-center gap-2 hover:bg-black transition-colors">
                                    <RotateCcw className="w-3 h-3" /> TÜM ROTALAR
                                </button>
                                <div className="bg-zinc-900/90 backdrop-blur p-4 rounded-xl border border-zinc-700 w-64 animate-in slide-in-from-left">
                                    {(() => {
                                        const r = routes.find(ro => ro._id === focusedRouteId);
                                        return r ? (
                                            <>
                                                <h3 className="font-bold text-white text-lg leading-tight mb-1">{r.title}</h3>
                                                <div className="flex items-center gap-2 text-xs text-zinc-400 mb-3"><MapPin className="w-3 h-3" /> {r.location}</div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-orange-500 font-mono font-bold">{r.distance}</span>
                                                    <button onClick={() => handleAnalyzeRoute(r)} className="text-white hover:text-orange-500 text-xs font-bold uppercase transition-colors">Detaylar &rarr;</button>
                                                </div>
                                            </>
                                        ) : null;
                                    })()}
                                </div>
                            </div>
                        ) : (
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur px-6 py-2 rounded-full border border-white/10 text-white text-xs font-bold pointer-events-none opacity-0 animate-fadeIn">
                                Detaylar için rotaya tıklayın
                            </div>
                        )}
                    </div>
                )}
            </main>

            {isCreating && createPortal(
                <div className="fixed inset-0 z-[1000] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#1A1A17] border border-white/10 rounded-3xl w-full max-w-6xl h-[90vh] md:h-[85vh] flex flex-col md:flex-row overflow-hidden shadow-2xl relative m-auto">

                        <div className="flex-1 relative bg-[#0f0f0f] w-full h-full min-h-[300px]">
                            <div ref={createMapContainerRef} className="absolute inset-0 w-full h-full" />

                            <div className="absolute top-4 left-4 z-[400] w-64">
                                <form onSubmit={handleMapSearch} className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Haritada yer ara..."
                                        className="w-full bg-[#1A1A17]/90 backdrop-blur border border-white/20 rounded-xl pl-10 pr-4 py-3 text-xs text-white focus:border-moto-accent outline-none shadow-xl"
                                        value={mapSearchQuery}
                                        onChange={(e) => setMapSearchQuery(e.target.value)}
                                    />
                                </form>
                            </div>

                            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#1A1A17]/90 backdrop-blur px-6 py-2 rounded-full border border-white/10 text-xs font-bold z-[400] flex items-center gap-3 shadow-lg whitespace-nowrap">
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${waypointsRef.current.length === 0 ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></span>
                                    <span className={waypointsRef.current.length === 0 ? 'text-green-500' : 'text-gray-500'}>Başlangıç</span>
                                </div>
                                <div className="w-4 h-[1px] bg-white/20"></div>
                                <div className="flex items-center gap-1.5">
                                    <span className={`w-2 h-2 rounded-full ${waypointsRef.current.length === 1 ? 'bg-red-500 animate-pulse' : 'bg-gray-600'}`}></span>
                                    <span className={waypointsRef.current.length === 1 ? 'text-red-500' : 'text-gray-500'}>Bitiş</span>
                                </div>
                            </div>

                            {newRouteForm.distance && (
                                <div className="absolute bottom-4 left-4 z-[400] bg-[#1A1A17]/90 backdrop-blur border-l-4 border-moto-accent p-4 rounded-r-xl shadow-2xl min-w-[200px] animate-in slide-in-from-left">
                                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">ROTA ÖZETİ</div>
                                    <div className="text-2xl font-mono font-bold text-white">{newRouteForm.distance}</div>
                                    <div className="text-sm font-bold text-gray-300">{(newRouteForm as any).duration}</div>
                                </div>
                            )}

                            <button
                                onClick={handleClearMap}
                                className="absolute bottom-4 right-4 bg-white text-red-600 px-4 py-2 rounded-xl font-bold text-xs shadow-lg z-[400] flex items-center gap-2 hover:bg-red-50 transition-colors"
                            >
                                <Trash2 className="w-4 h-4" /> <span className="hidden md:inline">HARİTAYI TEMİZLE</span>
                            </button>
                        </div>

                        <div className="w-full md:w-[400px] bg-[#242421] border-t md:border-t-0 md:border-l border-white/10 flex flex-col">
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1A1A17]">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Flag className="w-5 h-5 text-moto-accent" /> Rota Detayları
                                </h3>
                                <button onClick={() => setIsCreating(false)} className="text-gray-400 hover:text-white p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Başlık</label>
                                    <input
                                        type="text"
                                        placeholder="Örn: Hafta Sonu Viraj Turu"
                                        className="w-full bg-[#1A1A17] border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none text-sm font-medium"
                                        value={newRouteForm.title}
                                        onChange={e => setNewRouteForm({ ...newRouteForm, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Konum / Şehir</label>
                                    <input
                                        type="text"
                                        placeholder="Örn: İstanbul - Şile"
                                        className="w-full bg-[#1A1A17] border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none text-sm"
                                        value={newRouteForm.location}
                                        onChange={e => setNewRouteForm({ ...newRouteForm, location: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Zorluk</label>
                                        <select
                                            className="w-full bg-[#1A1A17] border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none text-sm appearance-none cursor-pointer"
                                            value={newRouteForm.difficulty}
                                            onChange={e => setNewRouteForm({ ...newRouteForm, difficulty: e.target.value as any })}
                                        >
                                            {['Kolay', 'Orta', 'Zor', 'Extreme'].map(d => <option key={d} value={d}>{d}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mevsim</label>
                                        <select
                                            className="w-full bg-[#1A1A17] border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none text-sm appearance-none cursor-pointer"
                                            value={newRouteForm.bestSeason}
                                            onChange={e => setNewRouteForm({ ...newRouteForm, bestSeason: e.target.value })}
                                        >
                                            {['İlkbahar', 'Yaz', 'Sonbahar', 'Kış'].map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <div className="flex-1 bg-[#1A1A17] p-3 rounded-xl border border-white/10">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Navigation className="w-3 h-3" /> Mesafe</div>
                                        <div className="text-[#F2A619] font-bold text-sm mt-1">{newRouteForm.distance || '--'}</div>
                                    </div>
                                    <div className="flex-1 bg-[#1A1A17] p-3 rounded-xl border border-white/10">
                                        <div className="text-[10px] text-gray-500 uppercase font-bold flex items-center gap-1"><Calendar className="w-3 h-3" /> Süre</div>
                                        <div className="text-[#F2A619] font-bold text-sm mt-1">{(newRouteForm as any).duration || '--'}</div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Açıklama</label>
                                    <textarea
                                        placeholder="Rota hakkında detaylar, mola yerleri, yol durumu..."
                                        className="w-full bg-[#1A1A17] border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none h-32 text-sm resize-none"
                                        value={newRouteForm.description}
                                        onChange={e => setNewRouteForm({ ...newRouteForm, description: e.target.value })}
                                    />
                                </div>

                                {!newRouteForm.path?.length && (
                                    <div className="flex items-center gap-2 p-3 bg-blue-900/20 text-blue-300 text-xs rounded-xl border border-blue-900/50">
                                        <AlertCircle className="w-4 h-4" />
                                        Haritadan A ve B noktalarını seçerek rotayı otomatik oluşturun.
                                    </div>
                                )}
                            </div>

                            <div className="p-6 border-t border-white/10 bg-[#1A1A17]">
                                <Button
                                    type="button"
                                    variant="primary"
                                    className="w-full py-4 text-base font-bold shadow-lg shadow-moto-accent/20"
                                    onClick={handleCreateRoute}
                                    disabled={!newRouteForm.path?.length || !newRouteForm.title}
                                >
                                    <Save className="w-4 h-4 mr-2" /> ROTA KAYDET
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {navChoiceRoute && createPortal(
                <div className="fixed inset-0 z-[1200] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-200">
                    <div className="bg-[#1A1A17] border border-white/10 rounded-3xl p-8 max-w-sm w-full shadow-2xl relative text-center">
                        <button onClick={() => setNavChoiceRoute(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"><X className="w-5 h-5" /></button>
                        <h3 className="text-2xl font-display font-bold text-white mb-2 leading-none">NAVİGASYON SEÇİMİ</h3>
                        <p className="text-gray-400 text-sm mb-8 leading-relaxed"><span className="text-[#F2A619] font-bold">{navChoiceRoute.title}</span> rotası için hangi sistemi kullanmak istersin?</p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleNavigateGoogle}
                                className="bg-white text-black p-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition-colors shadow-lg group"
                            >
                                <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>Google Haritalar</span>
                                <ExternalLink className="w-3 h-3 text-gray-500 ml-auto" />
                            </button>

                            <button
                                onClick={handleNavigateMotoVibe}
                                className="bg-[#F2A619] text-[#1A1A17] p-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-white transition-colors shadow-lg shadow-[#F2A619]/20 group"
                            >
                                <Navigation className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span>MotoVibe Sürüş Modu</span>
                                <ArrowRight className="w-3 h-3 text-[#1A1A17]/60 ml-auto" />
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {selectedRoute && createPortal(
                <div className="fixed inset-0 z-[1100] bg-black/90 backdrop-blur flex items-center justify-center p-4">
                    <div className="bg-[#242421] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-0 relative shadow-2xl flex flex-col">

                        <div className="h-48 relative flex-shrink-0">
                            <img src={selectedRoute.image} className="w-full h-full object-cover opacity-60" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#242421] to-transparent"></div>
                            <button onClick={() => setSelectedRoute(null)} className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-white hover:text-black transition-colors z-20">
                                <X className="w-5 h-5" />
                            </button>
                            <div className="absolute bottom-4 left-6">
                                <h2 className="text-3xl font-bold text-white leading-none">{selectedRoute.title}</h2>
                                <p className="text-sm text-gray-300 mt-1">{selectedRoute.location}</p>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                            {selectedRoute.videoUrl && (
                                <div className="rounded-2xl overflow-hidden border border-white/10 bg-black aspect-video relative group">
                                    {getYouTubeID(selectedRoute.videoUrl) ? (
                                        <iframe
                                            src={`https://www.youtube.com/embed/${getYouTubeID(selectedRoute.videoUrl)}?rel=0`}
                                            className="w-full h-full"
                                            allow="autoplay; encrypted-media"
                                            allowFullScreen
                                        ></iframe>
                                    ) : (
                                        <video
                                            src={selectedRoute.videoUrl}
                                            controls
                                            className="w-full h-full object-cover"
                                            poster={selectedRoute.image}
                                        >
                                            Video desteklenmiyor.
                                        </video>
                                    )}
                                    <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1 shadow-lg pointer-events-none">
                                        <Film className="w-3 h-3" /> ROTA TANITIMI
                                    </div>
                                </div>
                            )}

                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-moto-accent" /> {t('routes.ai_analysis')}
                                </h3>
                                {isLoadingAI ? (
                                    <div className="py-8 text-center bg-black/20 rounded-xl border border-white/5">
                                        <div className="w-8 h-8 border-2 border-moto-accent border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                        <p className="text-gray-500 text-xs">Gemini rotayı analiz ediyor...</p>
                                    </div>
                                ) : (
                                    <div className="bg-[#1A1A17] p-5 rounded-2xl border border-white/5 text-gray-300 leading-relaxed text-sm whitespace-pre-wrap">
                                        {aiAnalysis}
                                    </div>
                                )}
                            </div>

                            <Button variant="primary" className="w-full justify-center py-4 text-base font-bold shadow-lg shadow-moto-accent/20" onClick={() => handleRouteSelection(selectedRoute)}>
                                SÜRÜŞÜ BAŞLAT
                            </Button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
