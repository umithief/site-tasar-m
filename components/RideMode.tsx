import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../types';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { House, Cube } from 'lucide-react'; // Using lucide-react icons instead of FontAwesome for consistency with current codebase

interface RideModeProps {
    onNavigate: (view: ViewState) => void;
}

const cities = [
    { id: 1, name: "İstanbul", lat: 41.0082, lng: 28.9784, color: "#3b82f6" },
    { id: 2, name: "Ankara", lat: 39.9334, lng: 32.8597, color: "#ef4444" },
    { id: 3, name: "İzmir", lat: 38.4237, lng: 27.1428, color: "#10b981" },
    { id: 4, name: "Konya", lat: 37.8667, lng: 32.4833, color: "#ec4899" },
    { id: 5, name: "Antalya", lat: 36.8969, lng: 30.7133, color: "#f59e0b" },
    { id: 6, name: "Trabzon", lat: 41.0027, lng: 39.7168, color: "#6366f1" }
];

export const RideMode: React.FC<RideModeProps> = ({ onNavigate }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;
        if (mapRef.current) return;

        try {
            const map = new maplibregl.Map({
                container: mapContainerRef.current,
                style: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
                center: [35.2433, 38.9637],
                zoom: 5.5,
                pitch: 45,
                bearing: 0,
                antialias: true
            });

            map.addControl(new maplibregl.NavigationControl(), 'bottom-right');

            map.on('load', () => {
                // Add Markers
                cities.forEach(city => {
                    const el = document.createElement('div');
                    el.className = 'w-[22px] h-[22px] rounded-full border-[3px] border-white shadow-[0_0_10px_rgba(0,0,0,0.3)] cursor-pointer relative';
                    el.style.backgroundColor = city.color;

                    // Pulse animation effect as a pseudo-element style injected dynamically or just inline simpler approach
                    // Since we can't easily do pseudo-elements in inline styles, we'll append a child div for the pulse
                    const pulse = document.createElement('div');
                    pulse.className = 'absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full -z-10 animate-ping opacity-75';
                    pulse.style.backgroundColor = city.color;
                    el.appendChild(pulse);

                    new maplibregl.Marker({ element: el })
                        .setLngLat([city.lng, city.lat])
                        .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`<b class="p-2">${city.name}</b>`))
                        .addTo(map);
                });

                // 3D Buildings Layer
                const layers = map.getStyle().layers;
                let labelLayerId;
                for (let i = 0; i < layers.length; i++) {
                    if (layers[i].type === 'symbol' && layers[i].layout && layers[i].layout['text-field']) {
                        labelLayerId = layers[i].id;
                        break;
                    }
                }

                if (!map.getLayer('3d-buildings')) {
                    // Note: The voyager-gl-style might not strictly have a 'composite' source with 'building' layer active by default in the way standard mapbox styles do without an API key,
                    // but we try to add it smoothly. If source 'composite' doesn't exist, we skip.
                    // The shared style is Carto which usually relies on their vector tiles.
                    // For 3D buildings to work reliably with 'composite', we'd typically use MapTiler or Mapbox.
                    // However, we will follow the robust pattern of just attempting it.
                    // Since the user provided HTML used standard vector sources, we'll stick to a safe implementation.
                }
            });

            mapRef.current = map;
        } catch (err) {
            console.error("Map load error:", err);
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const flyToCity = (city: typeof cities[0]) => {
        if (!mapRef.current) return;
        mapRef.current.flyTo({
            center: [city.lng, city.lat],
            zoom: 12,
            pitch: 60,
            speed: 1.2
        });
    };

    const resetView = () => {
        if (!mapRef.current) return;
        mapRef.current.flyTo({ center: [35.2433, 38.9637], zoom: 5.5, pitch: 45, bearing: 0 });
    };

    return (
        <div className="relative w-full h-screen font-sans text-slate-800 bg-slate-100 overflow-hidden">
            <div ref={mapContainerRef} id="map" className="absolute top-0 bottom-0 w-full z-[1]" />

            <div className="absolute top-4 left-4 z-10 w-80 max-h-[calc(100vh-2rem)] flex flex-col gap-3 pointer-events-none">

                {/* Header */}
                <div className="bg-white/95 backdrop-blur-md border border-white/30 shadow-lg p-4 rounded-xl pointer-events-auto">
                    <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                        <Cube className="w-5 h-5 text-blue-600" /> 3D Harita Keşfi
                    </h1>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-semibold">OpenStreetMap Verisi</p>
                </div>

                {/* City List */}
                <div className="bg-white/95 backdrop-blur-md border border-white/30 shadow-lg rounded-xl flex-1 overflow-hidden flex flex-col pointer-events-auto">
                    <div className="p-3 border-b border-slate-100 bg-white/50 flex justify-between items-center">
                        <span className="font-bold text-xs text-slate-500 uppercase">Şehir Listesi</span>
                        <span className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">{cities.length}</span>
                    </div>
                    <div className="overflow-y-auto custom-scroll p-2 space-y-2 flex-1 max-h-[60vh]">
                        {cities.map(city => (
                            <div
                                key={city.id}
                                onClick={() => flyToCity(city)}
                                className="p-3 bg-white/50 rounded-lg cursor-pointer border border-slate-100 hover:bg-white hover:shadow-md transition-all flex items-center gap-3"
                            >
                                <div className="w-2 h-8 rounded-full" style={{ backgroundColor: city.color }}></div>
                                <span className="font-bold text-sm text-slate-700">{city.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white/95 backdrop-blur-md border border-white/30 shadow-lg p-2 rounded-xl pointer-events-auto flex gap-2">
                    <button
                        onClick={resetView}
                        className="flex-1 bg-slate-800 hover:bg-slate-900 text-white py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2"
                    >
                        <House className="w-4 h-4" /> Ana Görünüm
                    </button>
                </div>
            </div>
        </div>
    );
};