import React, { useState, useEffect, useRef } from 'react';
import { ViewState } from '../types';
import { Map as MapIcon, ChevronUp, Crosshair, Trash2, Info, X } from 'lucide-react';
import { createPortal } from 'react-dom';

declare const L: any;

interface RideModeProps {
    route?: any; // Keep prop signature compatible
    onNavigate: (view: ViewState) => void;
}

interface MarkerData {
    id: number;
    markerObj: any;
    lat: number;
    lng: number;
    title: string;
}

export const RideMode: React.FC<RideModeProps> = ({ route, onNavigate }) => {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const [markers, setMarkers] = useState<MarkerData[]>([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isLocating, setIsLocating] = useState(false);

    // Initial Map Setup
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current) {
            // Default center: Konya (from user request)
            const defaultLat = 37.8714;
            const defaultLng = 32.4846;

            const map = L.map(mapContainerRef.current, {
                zoomControl: false, // We'll add custom or leave it clean
                attributionControl: false
            }).setView([defaultLat, defaultLng], 13);

            // OpenStreetMap Layer (Standard Light)
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            // Handle Click to Add Marker
            map.on('click', (e: any) => {
                const { lat, lng } = e.latlng;
                addMarker(lat, lng);
            });

            // Initial Resize Fix
            setTimeout(() => {
                map.invalidateSize();
            }, 100);

            mapRef.current = map;
        }

        return () => {
            // Cleanup if needed (optional for singleton maps, but good practice)
        };
    }, []);

    const addMarker = (lat: number, lng: number, title: string = "Yeni Konum") => {
        if (!mapRef.current) return;

        const id = Date.now();
        const marker = L.marker([lat, lng]).addTo(mapRef.current);

        // Custom Popup Content (React-ish interaction via string html)
        const popupContent = `
            <div class="p-3">
                <h3 class="font-bold text-gray-800 text-sm mb-1">📍 İşaretlenen Konum</h3>
                <p class="text-xs text-gray-600 mb-2">${lat.toFixed(4)}, ${lng.toFixed(4)}</p>
                <button onclick="window.dispatchEvent(new CustomEvent('deleteMarker', { detail: ${id} }))" class="text-xs text-red-500 hover:text-red-700 font-medium underline">Bu işareti sil</button>
            </div>
        `;

        marker.bindPopup(popupContent).openPopup();

        // Add to state
        setMarkers(prev => [...prev, { id, markerObj: marker, lat, lng, title }]);
    };

    // Listen for custom delete events from popups
    useEffect(() => {
        const handleDelete = (e: any) => {
            deleteMarker(e.detail);
        };
        window.addEventListener('deleteMarker', handleDelete);
        return () => window.removeEventListener('deleteMarker', handleDelete);
    }, [markers]); // Re-bind if markers change logic depends on it, but deleteMarker uses functional update

    const deleteMarker = (id: number) => {
        setMarkers(prev => {
            const target = prev.find(m => m.id === id);
            if (target && mapRef.current) {
                mapRef.current.removeLayer(target.markerObj);
            }
            return prev.filter(m => m.id !== id);
        });
    };

    const clearMarkers = () => {
        markers.forEach(m => {
            if (mapRef.current) mapRef.current.removeLayer(m.markerObj);
        });
        setMarkers([]);
    };

    const locateUser = () => {
        if (!navigator.geolocation) {
            alert("Tarayıcınız konum servisini desteklemiyor.");
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setIsLocating(false);
                const { latitude, longitude } = position.coords;
                if (mapRef.current) {
                    mapRef.current.setView([latitude, longitude], 16);
                }
                addMarker(latitude, longitude, "Mevcut Konum");
            },
            (error) => {
                setIsLocating(false);
                console.error(error);
                alert("Konum alınamadı.");
            }
        );
    };

    const flyToMarker = (m: MarkerData) => {
        if (mapRef.current) {
            mapRef.current.flyTo([m.lat, m.lng], 16);
            m.markerObj.openPopup();
        }
    };

    return (
        <div className="relative w-full h-screen bg-gray-100 font-sans overflow-hidden">

            {/* Sidebar (Floating) */}
            <div
                className={`absolute top-4 left-4 z-[500] bg-white rounded-lg shadow-xl p-4 w-80 border border-gray-200 transition-all duration-300 transform ${isSidebarOpen ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'}`}
            >
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                        <MapIcon className="w-5 h-5 text-blue-600" /> OSM Harita
                    </h1>
                    {/* Mobile Toggle inside logic usually, here desktop focused but works on mobile too */}
                    <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-gray-600 md:hidden">
                        <ChevronUp />
                    </button>
                </div>

                <div className="space-y-3">
                    <div className="flex gap-2">
                        <button
                            onClick={locateUser}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-md text-sm font-medium transition flex items-center justify-center gap-2"
                        >
                            {isLocating ? <span className="animate-spin">⌛</span> : <Crosshair className="w-4 h-4" />}
                            Konumumu Bul
                        </button>
                        <button
                            onClick={clearMarkers}
                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-600 py-2 px-3 rounded-md text-sm font-medium transition flex items-center justify-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" /> Temizle
                        </button>
                    </div>

                    <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-800 border border-blue-100 flex items-start gap-2">
                        <Info className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>Haritada herhangi bir yere tıklayarak işaretçi (pin) ekleyebilirsin.</span>
                    </div>
                </div>

                {/* Marker List */}
                <div className="mt-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Eklenen Konumlar</h3>
                    <div className="max-h-60 overflow-y-auto custom-scroll space-y-2 min-h-[50px]">
                        {markers.length === 0 ? (
                            <div className="text-center text-gray-400 text-sm py-4 italic">
                                Henüz işaretçi eklenmedi.
                            </div>
                        ) : (
                            // Show generic reversed list
                            [...markers].reverse().map(marker => (
                                <div
                                    key={marker.id}
                                    onClick={() => flyToMarker(marker)}
                                    className="bg-white p-3 rounded border border-gray-100 shadow-sm hover:shadow-md transition cursor-pointer flex justify-between items-start group"
                                >
                                    <div>
                                        <div className="font-medium text-gray-700 text-sm">Konum #{marker.id.toString().slice(-4)}</div>
                                        <div className="text-xs text-gray-400 mt-0.5">{marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}</div>
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteMarker(marker.id); }}
                                        className="text-gray-300 hover:text-red-500 transition px-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Toggle Button (Visible when sidebar closed) */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute top-4 left-4 z-[500] bg-white p-3 rounded-lg shadow-lg text-blue-600"
                >
                    <MapIcon className="w-6 h-6" />
                </button>
            )}

            {/* Map Container */}
            <div ref={mapContainerRef} className="w-full h-full z-0 outline-none" id="map"></div>
        </div>
    );
};