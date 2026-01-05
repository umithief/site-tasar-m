
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Calendar, Save, Trash2, Search, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { notify } from '../../services/notificationService';
import { Route } from '../../types';

import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix for default marker icons in Leaflet with webpack/vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface RouteCreatorProps {
    onSave: (routeData: Partial<Route>) => Promise<void>;
    onCancel: () => void;
}

export const RouteCreator: React.FC<RouteCreatorProps> = ({ onSave, onCancel }) => {
    const [formData, setFormData] = useState<Partial<Route>>({
        title: '',
        description: '',
        difficulty: 'Orta',
        distance: '',
        estimatedTime: '',
        location: '',
        bestSeason: 'Yaz',
        path: []
    });

    const [mapSearchQuery, setMapSearchQuery] = useState('');
    const [isCalculating, setIsCalculating] = useState(false);

    const mapRef = useRef<any>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const waypointsRef = useRef<any[]>([]);
    const routingControlRef = useRef<any>(null);

    // Initialize Map
    useEffect(() => {
        if (!mapContainerRef.current || mapRef.current) return;
        // if (typeof L === 'undefined') return; // validation removed as L is imported

        const map = L.map(mapContainerRef.current, { zoomControl: false }).setView([39.0, 35.0], 6); // Turkey center

        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CARTO',
            maxZoom: 20
        }).addTo(map);

        map.on('click', handleMapClick);
        mapRef.current = map;

        setTimeout(() => map.invalidateSize(), 100);

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const handleMapClick = (e: any) => {
        if (waypointsRef.current.length >= 2) {
            notify.info("Şimdilik sadece Başlangıç ve Bitiş noktaları seçebilirsiniz. Lütfen haritayı temizleyin.");
            return;
        }

        const map = mapRef.current;
        const latlng = e.latlng;
        waypointsRef.current.push(latlng);

        // Marker Styling
        const isStart = waypointsRef.current.length === 1;
        const colorClass = isStart ? 'bg-green-500' : 'bg-red-600';
        const label = isStart ? 'A' : 'B';

        const iconHtml = `
            <div class="relative flex items-center justify-center w-8 h-8">
                <div class="absolute inset-0 ${colorClass} rounded-full animate-ping opacity-50"></div>
                <div class="relative w-8 h-8 ${colorClass} rounded-full border-2 border-white shadow-xl flex items-center justify-center text-white font-bold">${label}</div>
            </div>
        `;

        L.marker(latlng, {
            icon: L.divIcon({ className: 'custom-pin', html: iconHtml, iconSize: [32, 32] })
        }).addTo(map);

        // Calculate Route if 2 points
        if (waypointsRef.current.length === 2) {
            calculateRoute();
        }
    };

    const calculateRoute = () => {
        const map = mapRef.current;
        setIsCalculating(true);

        if (routingControlRef.current) {
            try { map.removeControl(routingControlRef.current); } catch (e) { }
        }

        const control = L.Routing.control({
            waypoints: waypointsRef.current,
            router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: 'driving' }),
            lineOptions: {
                styles: [{ color: '#F2A619', opacity: 0.8, weight: 6 }],
                extendToWaypoints: false,
                missingRouteTolerance: 0
            },
            createMarker: () => null,
            addWaypoints: false,
            show: false,
            fitSelectedRoutes: true
        } as any).addTo(map);

        control.on('routesfound', (e: any) => {
            const r = e.routes[0];
            const distKm = (r.summary.totalDistance / 1000).toFixed(1);
            const timeMin = Math.round(r.summary.totalTime / 60);

            setFormData(prev => ({
                ...prev,
                distance: `${distKm} km`,
                estimatedTime: `${timeMin} dk`,
                path: r.coordinates.map((c: any) => ({ lat: c.lat, lng: c.lng })),
                // Default location to start point if empty
                location: prev.location || 'Harita Konumu'
            }));
            setIsCalculating(false);
            notify.success(`Rota hesaplandı: ${distKm} km`);
        });

        control.on('routingerror', () => {
            setIsCalculating(false);
            notify.error("Rota hesaplanamadı.");
        });

        routingControlRef.current = control;
    };

    const handleClearMap = () => {
        const map = mapRef.current;
        if (!map) return;

        // Remove all layers except tiles (simplified)
        map.eachLayer((layer: any) => {
            if (!layer._url) map.removeLayer(layer);
        });

        waypointsRef.current = [];
        routingControlRef.current = null;
        setFormData(prev => ({ ...prev, distance: '', estimatedTime: '', path: [] }));
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mapSearchQuery) return;

        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(mapSearchQuery)}`);
            const data = await res.json();
            if (data && data.length > 0) {
                const { lat, lon } = data[0];
                mapRef.current.flyTo([lat, lon], 12);
                notify.success(`Bulundu: ${data[0].display_name.split(',')[0]}`);
            } else {
                notify.error("Konum bulunamadı");
            }
        } catch {
            notify.error("Arama hatası");
        }
    };

    const isFormValid = formData.title && formData.description && formData.path && formData.path.length > 0;

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-in fade-in slide-in-from-bottom-4">
            {/* Map Section */}
            <div className="flex-1 bg-zinc-900 rounded-3xl overflow-hidden relative border border-white/10 shadow-2xl">
                <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-zinc-900" />

                {/* Map Overlays */}
                <div className="absolute top-4 left-4 z-[400] w-64">
                    <form onSubmit={handleSearch} className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input
                            className="w-full bg-black/80 backdrop-blur border border-white/20 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-orange-500"
                            placeholder="Haritada yer ara..."
                            value={mapSearchQuery}
                            onChange={e => setMapSearchQuery(e.target.value)}
                        />
                    </form>
                </div>

                <div className="absolute top-4 right-4 z-[400]">
                    <button onClick={handleClearMap} className="bg-red-600/90 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-red-500 transition-colors flex items-center gap-2">
                        <Trash2 className="w-4 h-4" /> TEMİZLE
                    </button>
                </div>

                {/* Instructions */}
                {waypointsRef.current.length === 0 && (
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[400] bg-black/80 backdrop-blur px-6 py-3 rounded-full border border-white/10 text-white text-sm font-medium shadow-xl pointer-events-none animate-bounce">
                        <span className="text-green-400 font-bold">Başlangıç</span> noktasını seçmek için haritaya tıklayın
                    </div>
                )}
            </div>

            {/* Sidebar Form */}
            <div className="w-full lg:w-[400px] bg-zinc-900/80 backdrop-blur border border-white/10 rounded-3xl p-6 flex flex-col overflow-y-auto custom-scrollbar">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Navigation className="w-5 h-5 text-orange-500" /> Yeni Rota
                    </h2>
                    <button onClick={onCancel} className="text-zinc-500 hover:text-white p-2">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 flex-1">
                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Rota Başlığı</label>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-orange-500 outline-none"
                            placeholder="Örn: Hafta Sonu Turu"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Zorluk</label>
                            <select
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none"
                                value={formData.difficulty}
                                onChange={e => setFormData({ ...formData, difficulty: e.target.value as any })}
                            >
                                <option value="Kolay">Kolay</option>
                                <option value="Orta">Orta</option>
                                <option value="Zor">Zor</option>
                                <option value="Extreme">Extreme</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Mevsim</label>
                            <select
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none"
                                value={formData.bestSeason}
                                onChange={e => setFormData({ ...formData, bestSeason: e.target.value })}
                            >
                                <option value="Yaz">Yaz</option>
                                <option value="Kış">Kış</option>
                                <option value="İlkbahar">İlkbahar</option>
                                <option value="Sonbahar">Sonbahar</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Konum / Bölge</label>
                        <input
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-orange-500 outline-none"
                            placeholder="Örn: İstanbul, Şile"
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                        />
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 grid grid-cols-2 gap-4 border border-white/5">
                        <div className="text-center">
                            <div className="text-[10px] text-zinc-500 font-bold uppercase">Mesafe</div>
                            <div className="text-orange-500 font-mono font-bold text-lg">{formData.distance || '--'}</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] text-zinc-500 font-bold uppercase">Süre</div>
                            <div className="text-orange-500 font-mono font-bold text-lg">{formData.estimatedTime || '--'}</div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-zinc-500 uppercase mb-2">Açıklama <span className="text-red-500">*</span></label>
                        <textarea
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-orange-500 outline-none h-32 resize-none"
                            placeholder="Rota hakkında detaylı bilgi giriniz..."
                            value={formData.description || ''}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                </div>

                <div className="pt-6 mt-4 border-t border-white/10">
                    <Button
                        onClick={() => onSave(formData)}
                        disabled={!isFormValid || isCalculating}
                        className="w-full py-4 text-base font-bold flex items-center justify-center gap-2"
                        variant="primary"
                    >
                        {isCalculating ? (
                            <>Hesaplanıyor...</>
                        ) : (
                            <><Save className="w-5 h-5" /> ROTAYI KAYDET</>
                        )}
                    </Button>
                    {!formData.path?.length && (
                        <div className="text-center mt-3 text-xs text-zinc-500 flex items-center justify-center gap-2">
                            <AlertCircle className="w-3 h-3" />
                            Kaydetmek için haritada rota çizmelisiniz.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
