import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DiscoverySidebar, FloatingSearch, MapHUD, RouteCard } from './MapOverlays';
import { createRiderMarkerElement, createHotspotMarkerElement } from './MapMarkers';

// --- Types ---
interface ExploreMapProps {
    onNavigate: (view: any) => void;
}

// --- Mock Data ---
const MOCK_ROUTES = [
    {
        id: 1,
        title: 'Black Forest Run',
        dist: '120km',
        time: '2h 15m',
        difficulty: 'Medium',
        rating: 4.8,
        weather: 'Sunny 22°C',
        riders: 12,
        coordinates: [
            [-74.0060, 40.7128],
            [-73.99, 40.722],
            [-74.01, 40.73],
            [-73.98, 40.74]
        ],
        image: 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?auto=format&fit=crop&q=80',
        desc: 'A scenic run through the urban jungle with twisty flyovers and tunnel echoes.'
    },
    {
        id: 2,
        title: 'Midnight City Loop',
        dist: '45km',
        time: '50m',
        difficulty: 'Easy',
        rating: 4.5,
        weather: 'Clear 18°C',
        riders: 5,
        coordinates: [
            [-73.98, 40.75],
            [-73.97, 40.76],
            [-73.96, 40.77]
        ],
        image: 'https://images.unsplash.com/photo-1471341971474-27c530ad282d?auto=format&fit=crop&q=80',
        desc: 'Quick night loop for city lights and coffee stops.'
    },
    {
        id: 3,
        title: 'Canyon Pass',
        dist: '85km',
        time: '1h 30m',
        difficulty: 'Hard',
        rating: 4.9,
        weather: 'Windy 15°C',
        riders: 24,
        coordinates: [
            [-74.02, 40.70],
            [-74.03, 40.69],
            [-74.01, 40.68]
        ],
        image: 'https://images.unsplash.com/photo-1582216507426-ed895e69d71c?auto=format&fit=crop&q=80',
        desc: 'Technical curves for experienced riders only.'
    },
];

const MOCK_RIDERS = [
    { id: 1, name: 'AlexMot', pos: [-73.995, 40.715] as [number, number], status: 'live' },
    { id: 2, name: 'SpeedDemon', pos: [-74.005, 40.725] as [number, number], status: 'live' },
    { id: 3, name: 'CruiserJoe', pos: [-73.985, 40.735] as [number, number], status: 'offline' },
];

const MOCK_HOTSPOTS = [
    { id: 1, title: 'MotoCafe NY', type: 'Cafe', pos: [-74.000, 40.720] as [number, number] },
    { id: 2, title: 'Sunset Point', type: 'View', pos: [-74.010, 40.740] as [number, number] },
];

export const ExploreMap: React.FC<ExploreMapProps> = ({ onNavigate }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    // Initialize Map
    useEffect(() => {
        if (map.current) return; // initialize once
        if (!mapContainer.current) return;

        const token = import.meta.env.VITE_MAPBOX_TOKEN;

        if (!token) {
            console.error("Mapbox token missing! Aborting map initialization.");
            setLoading(false);
            return;
        }

        mapboxgl.accessToken = token;

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/dark-v11', // Midnight Carbon base
                center: [-74.0060, 40.7128],
                zoom: 12,
                attributionControl: false,
                pitch: 45, // 3D feel
            });
        } catch (err) {
            console.error("Mapbox init failed:", err);
            setLoading(false);
            return;
        }

        const m = map.current;

        m.on('load', () => {
            setLoading(false);

            // Clean up POIs for "Midnight Carbon" clean look
            /*
            const layersToRemove = ['poi-label', 'transit-label', 'road-label-simple'];
            layersToRemove.forEach(layer => {
                if(m.getLayer(layer)) m.removeLayer(layer);
            });
            */
            // Better approach: use style filtering or accepted style, but 'dark-v11' is okay for now.

            // --- Add Routes Source ---
            const geojson: GeoJSON.FeatureCollection = {
                type: 'FeatureCollection',
                features: MOCK_ROUTES.map(route => ({
                    type: 'Feature',
                    properties: {
                        id: route.id,
                        title: route.title,
                        description: route.desc
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: route.coordinates
                    }
                }))
            };

            m.addSource('routes', {
                type: 'geojson',
                data: geojson
            });

            // 1. Glow Layer (Blur)
            m.addLayer({
                id: 'routes-glow',
                type: 'line',
                source: 'routes',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#E2FF3B',
                    'line-width': 8,
                    'line-opacity': 0.4,
                    'line-blur': 4
                }
            });

            // 2. Core Line Layer
            m.addLayer({
                id: 'routes-core',
                type: 'line',
                source: 'routes',
                layout: {
                    'line-join': 'round',
                    'line-cap': 'round'
                },
                paint: {
                    'line-color': '#E2FF3B', // Electric Lime
                    'line-width': 3,
                    'line-opacity': 1
                }
            });

            // Add click interaction for routes
            m.on('click', 'routes-core', (e) => {
                // Identify which route was clicked
                // Ideally use feature id, but here we can match loosely or use props
                // Simplified for mock: just picking the first feature found
                const feature = e.features?.[0];
                if (feature) {
                    const routeId = feature.properties?.id;
                    const route = MOCK_ROUTES.find(r => r.id === routeId);
                    if (route) handleRouteSelect(route);
                }
            });

            // Change cursor on hover
            m.on('mouseenter', 'routes-core', () => m.getCanvas().style.cursor = 'pointer');
            m.on('mouseleave', 'routes-core', () => m.getCanvas().style.cursor = '');

            // --- Add Markers ---
            MOCK_RIDERS.forEach(rider => {
                const el = createRiderMarkerElement(rider.status === 'live');
                const marker = new mapboxgl.Marker({ element: el })
                    .setLngLat(rider.pos)
                    .setPopup(new mapboxgl.Popup({ offset: 25, className: 'premium-popup' }).setHTML(`<div class="p-2 text-black font-bold">${rider.name}</div>`))
                    .addTo(m);
                markersRef.current.push(marker);
            });

            MOCK_HOTSPOTS.forEach(spot => {
                const el = createHotspotMarkerElement(spot.type);
                const marker = new mapboxgl.Marker({ element: el })
                    .setLngLat(spot.pos)
                    .setPopup(new mapboxgl.Popup({ offset: 25, className: 'premium-popup' }).setHTML(`<div class="p-2 text-black font-bold">${spot.title} <br/><span class="text-xs text-lime-600">${spot.type}</span></div>`))
                    .addTo(m);
                markersRef.current.push(marker);
            });
        });

        // Cleanup
        return () => {
            m.remove();
            markersRef.current = [];
        };
    }, []);

    const handleRouteSelect = useCallback((route: any) => {
        setSelectedRoute(route);
        if (map.current && route.coordinates && route.coordinates.length > 0) {
            // Find center of the route approximately or just fly to start
            const start = route.coordinates[0];
            map.current.flyTo({
                center: start,
                zoom: 13.5,
                duration: 2000,
                essential: true,
                pitch: 50,
                bearing: 20
            });
        }
    }, []);

    const handleRecenter = () => {
        if (map.current) {
            map.current.flyTo({
                center: [-74.0060, 40.7128],
                zoom: 12,
                pitch: 45,
                bearing: 0,
                duration: 1500
            });
        }
    };

    return (
        <div className="relative w-full h-[85vh] bg-[#0A0A0A] overflow-hidden rounded-3xl border border-white/10 shadow-2xl group">
            {/* Loading Spinner */}
            {loading && (
                <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-lime-400/30 border-t-lime-400 rounded-full animate-spin"></div>
                        <div className="text-lime-400 font-mono text-sm animate-pulse">INITIALIZING SAT-LINK...</div>
                    </div>
                </div>
            )}

            {/* Overlays */}
            <FloatingSearch />
            <DiscoverySidebar routes={MOCK_ROUTES} onSelectRoute={handleRouteSelect} />
            <MapHUD coords={map.current ? `${map.current.getCenter().lng.toFixed(4)}, ${map.current.getCenter().lat.toFixed(4)}` : "Loading..."} userCount={124} onRecenter={handleRecenter} />
            <RouteCard route={selectedRoute} onClose={() => setSelectedRoute(null)} />

            {/* Map Container */}
            <div ref={mapContainer} className="w-full h-full" />

            {!import.meta.env.VITE_MAPBOX_TOKEN && !loading && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/10 border border-red-500/50 p-4 rounded-xl backdrop-blur text-red-500 font-bold z-40 text-center">
                    Mapbox Token Missing<br />
                    <span className="text-xs font-normal opacity-80">Add VITE_MAPBOX_TOKEN to .env</span>
                </div>
            )}
        </div>
    );
};
