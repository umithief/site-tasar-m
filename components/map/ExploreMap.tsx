import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { DiscoverySidebar, FloatingSearch, MapHUD, RouteCard } from './MapOverlays';
import { createRiderMarkerElement, createHotspotMarkerElement } from './MapMarkers';
import { routeService } from '../../services/routeService';

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
    const [routes, setRoutes] = useState<any[]>([]);
    const [isNavigating, setIsNavigating] = useState(false);
    const markersRef = useRef<mapboxgl.Marker[]>([]);

    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const data = await routeService.getRoutes();
                // Transform Backend Data (lat/lng objects) to Mapbox ([lng, lat] arrays)
                const transformedRoutes = data.map((r: any) => ({
                    id: r._id,
                    title: r.title,
                    desc: r.description,
                    coordinates: r.coordinates.map((c: any) => [c.lng, c.lat]),
                    dist: r.distance,
                    difficulty: r.difficulty
                }));
                setRoutes(transformedRoutes);
            } catch (error) {
                console.error("Failed to fetch routes", error);
                // Keep MOCK_ROUTES as fallback if needed or empty
                setRoutes(MOCK_ROUTES);
            }
        };

        fetchRoutes();
    }, []);

    // Initialize Map
    useEffect(() => {
        if (map.current) return; // initialize once
        if (!mapContainer.current) return;

        const token = import.meta.env.VITE_MAPBOX_TOKEN;

        if (!token) {
            console.error("Mapbox token check failed. Token is:", token);
            console.warn("TIP: If you just added the token to .env, you MUST restart 'npm run dev' for it to take effect.");
            setLoading(false);
            return;
        }

        mapboxgl.accessToken = token;

        try {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/mapbox/dark-v11', // Midnight Carbon base
                center: [29.6116, 41.1744], // Focus on Istanbul/Şile for demo
                zoom: 9, // Zoom out to see context
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

    // Effect to update map data when routes (or nav state) change
    useEffect(() => {
        if (!map.current) return;

        const updateMapData = () => {
            const m = map.current!;
            if (!m.getStyle()) return; // Safety check

            const sourceId = 'routes';
            // If navigating, only show the active route. Otherwise show all.
            // We need to store the route being navigated, let's assume selectedRoute is kept or we store it elsewhere.
            // For now, let's use a local variable or depend on the hook state.
            // Note: We need a state for 'activeRoute' if we want to close the card but keep nav.

            // FILTERING LOGIC:
            // If isNavigating is true, we need to know WHICH route.
            // Current logic clears selectedRoute on nav start. We should fix that in the handler first.
            // But assuming we fix that, here is the render logic:

            const displayedRoutes = isNavigating && selectedRoute ? [selectedRoute] : routes;

            const geojson: GeoJSON.FeatureCollection = {
                type: 'FeatureCollection',
                features: displayedRoutes.map(route => ({
                    type: 'Feature',
                    properties: {
                        id: route.id,
                        title: route.title,
                        description: route.desc,
                        // Add interactive state for styling if needed
                        isNavigating: isNavigating
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: route.coordinates
                    }
                }))
            };

            if (m.getSource(sourceId)) {
                (m.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(geojson);
            } else {
                m.addSource('routes', {
                    type: 'geojson',
                    data: geojson
                });

                // 1. Glow Layer
                m.addLayer({
                    id: 'routes-glow',
                    type: 'line',
                    source: 'routes',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                        'line-color': '#E2FF3B',
                        'line-width': isNavigating ? 12 : 8, // Thicker in nav mode
                        'line-opacity': 0.4,
                        'line-blur': 4
                    }
                });

                // 2. Core Line Layer
                m.addLayer({
                    id: 'routes-core',
                    type: 'line',
                    source: 'routes',
                    layout: { 'line-join': 'round', 'line-cap': 'round' },
                    paint: {
                        'line-color': '#E2FF3B',
                        'line-width': isNavigating ? 6 : 3, // Thicker in nav mode
                        'line-opacity': 1
                    }
                });

                // Add click interaction
                m.on('click', 'routes-core', (e) => {
                    // Disable click when navigating?
                    if (isNavigating) return;

                    const feature = e.features?.[0];
                    if (feature) {
                        const routeId = feature.properties?.id;
                        const route = routes.find(r => r.id === routeId);
                        if (route) handleRouteSelect(route);
                    }
                });

                m.on('mouseenter', 'routes-core', () => m.getCanvas().style.cursor = 'pointer');
                m.on('mouseleave', 'routes-core', () => m.getCanvas().style.cursor = '');
            }
        };

        if (map.current.isStyleLoaded()) {
            updateMapData();
        } else {
            map.current.once('style.load', updateMapData);
        }

    }, [routes, isNavigating, selectedRoute]); // Re-render when these change

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



    // ... existing effects ...

    const [navigationData, setNavigationData] = useState<any>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Fetch Directions from Mapbox API
    const getDirections = async (start: [number, number], end: [number, number]) => {
        try {
            const query = await fetch(
                `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
                { method: 'GET' }
            );
            const json = await query.json();
            const data = json.routes[0];
            const steps = data.legs[0].steps;

            setNavigationData({
                duration: Math.floor(data.duration / 60), // min
                distance: (data.distance / 1000).toFixed(1), // km
                steps: steps
            });
        } catch (error) {
            console.warn("Failed to fetch Mapbox directions, using fallback simulation", error);
            // Fallback if API fails or quota exceeded
            setNavigationData({
                duration: 45,
                distance: "12.5",
                steps: [
                    { maneuver: { instruction: "Head north on Main St", type: "depart" }, distance: 500 },
                    { maneuver: { instruction: "Turn right onto Coastal Hwy", type: "turn" }, distance: 2000 },
                    { maneuver: { instruction: "Keep left at the fork", type: "fork" }, distance: 5000 },
                    { maneuver: { instruction: "Arrive at destination", type: "arrive" }, distance: 0 }
                ]
            });
        }
    };

    // Navigation Simulation Loop
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isNavigating && navigationData && navigationData.steps.length > 0) {
            interval = setInterval(() => {
                setCurrentStepIndex((prev) => {
                    const next = prev + 1;
                    if (next >= navigationData.steps.length) {
                        return prev; // End of route
                    }

                    // Simulate camera movement along step if possible (advanced)
                    // For now, just simulated bearing/pitch shift to feel dynamic
                    if (map.current) {
                        map.current.easeTo({
                            bearing: map.current.getBearing() + (Math.random() * 10 - 5),
                            pitch: 60 + (Math.random() * 10 - 5),
                            duration: 4000
                        });
                    }

                    return next;
                });
            }, 5000); // Advance step every 5 seconds for simulation
        }
        return () => clearInterval(interval);
    }, [isNavigating, navigationData]);


    const handleStartNavigation = () => {
        setIsNavigating(true);
        setCurrentStepIndex(0);

        if (map.current && selectedRoute && selectedRoute.coordinates.length > 0) {
            const coords = selectedRoute.coordinates;
            const start = coords[0];
            const end = coords[coords.length - 1];

            // 1. Fetch real directions
            getDirections(start, end);

            // 2. Fly to start 
            map.current.flyTo({
                center: start,
                zoom: 17,
                pitch: 65,
                bearing: 0,
                duration: 2000
            });
        }
    };

    const handleStopNavigation = () => {
        setIsNavigating(false);
        setNavigationData(null);
        setCurrentStepIndex(0);
        if (map.current) {
            map.current.flyTo({
                pitch: 45,
                zoom: 12,
                duration: 2000
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

            {/* Overlays - Hide Standard overlays when navigating */}
            {!isNavigating && (
                <>
                    <FloatingSearch />
                    <DiscoverySidebar routes={routes} onSelectRoute={handleRouteSelect} />
                    <MapHUD coords={map.current ? `${map.current.getCenter().lng.toFixed(4)}, ${map.current.getCenter().lat.toFixed(4)}` : "Loading..."} userCount={124} onRecenter={handleRecenter} />
                    <RouteCard
                        route={selectedRoute}
                        onClose={() => setSelectedRoute(null)}
                        onStartNavigation={handleStartNavigation}
                    />
                </>
            )}

            {/* Navigation HUD */}
            {isNavigating && navigationData && (
                <>
                    {/* Top Bar - Turn Instructions */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-[400px] z-[1200] bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-lime-400 rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(226,255,59,0.3)] animate-pulse">
                            <span className="text-2xl font-black">
                                {navigationData.steps[currentStepIndex]?.maneuver?.type === 'arrive' ? '🏁' : '↱'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest flex justify-between">
                                <span>Current Step</span>
                                <span className="text-lime-400">{currentStepIndex + 1} / {navigationData.steps.length}</span>
                            </div>
                            <div className="text-lg leading-tight font-black text-white mt-1">
                                {navigationData.steps[currentStepIndex]?.maneuver?.instruction || "Proceed to route"}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Data Bar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] z-[1200] grid grid-cols-3 gap-2">
                        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl text-center">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Arrival</div>
                            <div className="text-xl font-black text-white">
                                {new Date(new Date().getTime() + navigationData.duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl text-center">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Remaining</div>
                            <div className="text-xl font-black text-lime-400">{Math.max(0, navigationData.duration - (currentStepIndex * 2))} min</div>
                        </div>
                        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl text-center">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Distance</div>
                            <div className="text-xl font-black text-white">{navigationData.distance} km</div>
                        </div>
                    </div>

                    {/* Exit Button */}
                    <button
                        onClick={handleStopNavigation}
                        className="absolute top-6 right-6 z-[1200] w-10 h-10 bg-red-500/20 text-red-500 border border-red-500/50 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    >
                        <span className="font-bold">X</span>
                    </button>

                    {/* Perspective Effect Overlay */}
                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/20 via-transparent to-transparent z-[1000]" />
                </>
            )}

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
