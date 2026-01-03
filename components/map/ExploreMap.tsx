import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { DiscoverySidebar, FloatingSearch, MapHUD, RouteCard } from './MapOverlays';
import { RiderMarker, HotspotMarker } from './MapMarkers';

// --- Types ---
interface ExploreMapProps {
    onNavigate: (view: any) => void;
}

// --- Map Controller ---
const MapController = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.flyTo(center, map.getZoom(), { duration: 2 });
    }, [center, map]);
    return null;
};

// --- Mock Data ---
const MOCK_ROUTES = [
    { id: 1, title: 'Black Forest Run', dist: '120km', time: '2h 15m', difficulty: 'Medium', rating: 4.8, weather: 'Sunny 22°C', riders: 12, path: [[40.7128, -74.0060], [40.722, -73.99], [40.73, -74.01], [40.74, -73.98]], image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&q=80' },
    { id: 2, title: 'Midnight City Loop', dist: '45km', time: '50m', difficulty: 'Easy', rating: 4.5, weather: 'Clear 18°C', riders: 5, path: [[40.75, -73.98], [40.76, -73.97], [40.77, -73.96]], image: 'https://images.unsplash.com/photo-1471341971474-27c530ad282d?auto=format&fit=crop&q=80' },
    { id: 3, title: 'Canyon Pass', dist: '85km', time: '1h 30m', difficulty: 'Hard', rating: 4.9, weather: 'Windy 15°C', riders: 24, path: [[40.70, -74.02], [40.69, -74.03], [40.68, -74.01]], image: 'https://images.unsplash.com/photo-1582216507426-ed895e69d71c?auto=format&fit=crop&q=80' },
];

const MOCK_RIDERS = [
    { id: 1, name: 'AlexMot', pos: [40.715, -73.995], status: 'live' },
    { id: 2, name: 'SpeedDemon', pos: [40.725, -74.005], status: 'live' },
    { id: 3, name: 'CruiserJoe', pos: [40.735, -73.985], status: 'offline' },
];

const MOCK_HOTSPOTS = [
    { id: 1, title: 'MotoCafe NY', type: 'Cafe', pos: [40.720, -74.000] },
    { id: 2, title: 'Sunset Point', type: 'View', pos: [40.740, -74.010] },
];

export const ExploreMap: React.FC<ExploreMapProps> = ({ onNavigate }) => {
    const [center, setCenter] = useState<[number, number]>([40.7128, -74.0060]);
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="w-full h-full bg-[#09090b] flex items-center justify-center text-gray-500">Loading Map Core...</div>;

    const handleRouteSelect = (route: any) => {
        setSelectedRoute(route);
        if (route.path && route.path.length > 0) {
            setCenter(route.path[0]);
        }
    };

    return (
        <div className="relative w-full h-full bg-[#050505] overflow-hidden">
            {/* Overlays */}
            <FloatingSearch />
            <DiscoverySidebar routes={MOCK_ROUTES} onSelectRoute={handleRouteSelect} />
            <MapHUD coords={`${center[0].toFixed(4)}, ${center[1].toFixed(4)}`} userCount={124} onRecenter={() => setCenter([40.7128, -74.0060])} />
            <RouteCard route={selectedRoute} onClose={() => setSelectedRoute(null)} />

            {/* Map Core */}
            <MapContainer
                center={center}
                zoom={13}
                style={{ width: '100%', height: '100%', outline: 'none' }}
                zoomControl={false}
                attributionControl={false}
            >
                <MapController center={center} />

                {/* Midnight Carbon Tiles */}
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Routes */}
                {MOCK_ROUTES.map(route => (
                    <Polyline
                        key={route.id}
                        positions={route.path as any}
                        pathOptions={{
                            color: selectedRoute?.id === route.id ? '#E2FF3B' : '#334155',
                            weight: selectedRoute?.id === route.id ? 5 : 3,
                            opacity: selectedRoute?.id === route.id ? 1 : 0.6,
                            className: selectedRoute?.id === route.id ? 'neon-polyline' : '' // We'll add filter in CSS
                        }}
                        eventHandlers={{ click: () => handleRouteSelect(route) }}
                    />
                ))}

                {/* Markers */}
                {MOCK_RIDERS.map(rider => (
                    <RiderMarker type="rider" key={rider.id} position={rider.pos} name={rider.name} status={rider.status} />
                ))}

                {MOCK_HOTSPOTS.map(spot => (
                    <HotspotMarker key={spot.id} position={spot.pos} title={spot.title} type={spot.type} />
                ))}

            </MapContainer>
        </div>
    );
};
