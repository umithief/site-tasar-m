import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../types';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { RefreshCcw, Layers } from 'lucide-react';

interface RideModeProps {
    onNavigate: (view: ViewState) => void;
}

export const RideMode: React.FC<RideModeProps> = ({ onNavigate }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);

    // Mock Locations
    const locations = [
        { id: 1, name: "İstanbul Merkez", lat: 41.0082, lng: 28.9784, color: "#3b82f6" },
        { id: 2, name: "Ankara Kızılay", lat: 39.9334, lng: 32.8597, color: "#ef4444" },
        { id: 3, name: "İzmir Kordon", lat: 38.4237, lng: 27.1428, color: "#10b981" },
    ];

    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {

            // Init Leaflet
            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false
            }).setView([39.9334, 32.8597], 6);

            // Light / Minimalist Tile Layer (CartoDB Voyager or Positron)
            // Using Voyager (Modern/Pastel) as requested
            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                maxZoom: 20,
                subdomains: 'abcd',
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            }).addTo(map);

            // Add Markers with Pulse Effect via DIV Icon
            locations.forEach(loc => {
                const icon = L.divIcon({
                    className: 'custom-div-icon',
                    html: `<div style="background-color: ${loc.color}" class="marker-pulse"></div>`,
                    iconSize: [22, 22],
                    iconAnchor: [11, 11]
                });

                L.marker([loc.lat, loc.lng], { icon }).addTo(map)
                    .bindPopup(`<b style="font-family:sans-serif; color:#333">${loc.name}</b>`);
            });

            mapRef.current = map;
        }

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const flyTo = (lat: number, lng: number) => {
        mapRef.current?.flyTo([lat, lng], 13, { duration: 1.5 });
    };

    const resetView = () => {
        mapRef.current?.flyTo([39.9334, 32.8597], 6);
    };

    return (
        <div className="relative w-full h-screen font-sans overflow-hidden bg-slate-50">
            {/* Map Container */}
            <div ref={mapContainerRef} className="absolute inset-0 z-0" />

            {/* Sidebar Overlay (Glassmorphism) */}
            <div className="absolute top-5 left-5 w-80 z-10 pointer-events-none flex flex-col gap-3">

                {/* 1. Header Panel */}
                <div className="glass-panel text-slate-800 pointer-events-auto">
                    <h2 className="m-0 text-lg font-bold font-sans">Harita Başlığı</h2>
                    <p className="m-0 mt-1 text-slate-500 text-sm">
                        Modern ve temiz bir görünüm için CartoDB Voyager stili kullanılıyor.
                    </p>
                </div>

                {/* 2. List Panel */}
                <div className="glass-panel overflow-y-auto max-h-[60vh] custom-scroll p-0 pointer-events-auto">
                    {locations.map(loc => (
                        <div
                            key={loc.id}
                            onClick={() => flyTo(loc.lat, loc.lng)}
                            className="flex items-center gap-3 p-3 border-b border-slate-100 cursor-pointer hover:bg-white/40 transition-colors last:border-0"
                        >
                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: loc.color }} />
                            <span className="text-sm font-medium text-slate-700">{loc.name}</span>
                        </div>
                    ))}
                </div>

                {/* 3. Controls Panel */}
                <div className="glass-panel flex gap-2 p-2 pointer-events-auto">
                    <button
                        onClick={resetView}
                        className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-sm font-medium transition cursor-pointer border-none flex items-center justify-center gap-2"
                    >
                        <RefreshCcw className="w-4 h-4" /> Sıfırla
                    </button>
                    <button
                        className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition cursor-pointer border-none flex items-center justify-center gap-2"
                    >
                        <Layers className="w-4 h-4" /> Stil
                    </button>
                </div>

            </div>
        </div>
    );
};