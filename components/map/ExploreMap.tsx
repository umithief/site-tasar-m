import React, { useState, useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Navigation, Users, Zap } from 'lucide-react';
import { DiscoverySidebar, FloatingSearch, MapHUD, RouteCard } from './MapOverlays'; // Re-using your existing overlays
import { routeService } from '../../services/routeService';

// --- Types ---
interface ExploreMapProps {
    onNavigate?: (view: any) => void;
}

// --- Mock Data for Riders (Initial) ---
// We will convert this to GeoJSON dynamically
const INITIAL_RIDERS = [
    { id: 1, name: 'GhostRider', lat: 41.1744, lng: 29.6116, speed: '124 km/h' },
    { id: 2, name: 'ApexPredator', lat: 41.1800, lng: 29.6200, speed: '98 km/h' },
    { id: 3, name: 'NightFury', lat: 41.1600, lng: 29.6000, speed: '0 km/h (Parking)' },
    { id: 4, name: 'TurboTom', lat: 41.1700, lng: 29.6300, speed: '110 km/h' },
];

export const ExploreMap: React.FC<ExploreMapProps> = ({ onNavigate }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    // State
    const [loading, setLoading] = useState(true);
    const [routes, setRoutes] = useState<any[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    // Navigation Simulation State
    const [navigationData, setNavigationData] = useState<any>(null);
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    // Live Rider Simulation Ref
    const ridersRef = useRef(INITIAL_RIDERS);

    // Real User Location Tracking
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const watchId = useRef<number | null>(null);

    // --- 1. Fetch Data (Routes) ---
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const data = await routeService.getRoutes();
                const transformedRoutes = data.map((r: any) => ({
                    id: r._id,
                    title: r.title,
                    desc: r.description,
                    coordinates: r.coordinates.map((c: any) => [c.lng, c.lat]),
                    dist: r.distance,
                    difficulty: r.difficulty,
                    image: r.image,
                    rating: r.rating,
                    weather: r.weather,
                    riders: r.riders
                }));
                setRoutes(transformedRoutes);
            } catch (error) {
                console.error("Failed to fetch routes", error);
            }
        };
        fetchRoutes();
    }, []);

    // --- 2. Map Initialization & Architecture ---
    useEffect(() => {
        if (map.current) return; // Ensure singleton
        if (!mapContainer.current) return;

        const token = import.meta.env.VITE_MAPBOX_TOKEN;
        if (!token) {
            console.error("Mapbox Token Missing");
            setLoading(false);
            return;
        }

        mapboxgl.accessToken = token;

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [29.6116, 41.1744], // Istanbul/Şile
            zoom: 2, // Start zoomed out for Intro Fly-in
            pitch: 0,
            attributionControl: false,
        });

        const m = map.current;

        m.on('load', () => {
            setLoading(false);

            // --- Intro Fly-in Animation ---
            m.flyTo({
                center: [29.6116, 41.1744],
                zoom: 13,
                pitch: 45,
                bearing: -10,
                duration: 4000,
                essential: true
            });

            // --- A. Riders Source (GeoJSON) ---
            m.addSource('riders', {
                type: 'geojson',
                data: {
                    type: 'FeatureCollection',
                    features: INITIAL_RIDERS.map(rider => ({
                        type: 'Feature',
                        geometry: { type: 'Point', coordinates: [rider.lng, rider.lat] },
                        properties: { ...rider }
                    }))
                }
            });

            // --- B. Riders Layer (Circle + Neon Glow) ---
            // 1. Outer Glow
            m.addLayer({
                id: 'riders-glow',
                type: 'circle',
                source: 'riders',
                paint: {
                    'circle-radius': 15,
                    'circle-color': '#06b6d4', // Cyan
                    'circle-opacity': 0.4,
                    'circle-blur': 0.5
                }
            });
            // 2. Core Dot
            m.addLayer({
                id: 'riders-core',
                type: 'circle',
                source: 'riders',
                paint: {
                    'circle-radius': 6,
                    'circle-color': '#ffffff',
                    'circle-stroke-width': 2,
                    'circle-stroke-color': '#06b6d4'
                }
            });

            // --- C. Rider Interaction (Hover Popup) ---
            const popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'premium-popup',
                offset: 20
            });

            m.on('mouseenter', 'riders-core', (e) => {
                m.getCanvas().style.cursor = 'pointer';
                if (!e.features || !e.features[0]) return;

                const coordinates = (e.features[0].geometry as any).coordinates.slice();
                const props = e.features[0].properties;

                const popupContent = `
                    <div class="p-3 bg-black/90 backdrop-blur-md rounded-lg border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                        <div class="flex items-center gap-2 mb-1">
                            <span class="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                            <h3 class="text-white font-bold text-sm font-mono tracking-wide">${props.name}</h3>
                        </div>
                        <div class="text-cyan-400 text-xs font-black uppercase">${props.speed}</div>
                    </div>
                `;

                popup.setLngLat(coordinates).setHTML(popupContent).addTo(m);
            });

            m.on('mouseleave', 'riders-core', () => {
                m.getCanvas().style.cursor = '';
                popup.remove();
            });

            // --- D. Routes Source (Placeholder initialization) ---
            m.addSource('routes', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] }
            });

            // Route Layers (Glow + Core)
            m.addLayer({
                id: 'routes-glow',
                type: 'line',
                source: 'routes',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': '#E2FF3B',
                    'line-width': 8,
                    'line-opacity': 0.4,
                    'line-blur': 4
                }
            });
            m.addLayer({
                id: 'routes-core',
                type: 'line',
                source: 'routes',
                layout: { 'line-join': 'round', 'line-cap': 'round' },
                paint: {
                    'line-color': '#E2FF3B',
                    'line-width': 3,
                    'line-opacity': 1
                }
            });

            // Route Interaction
            m.on('click', 'routes-core', (e) => {
                if (isNavigating) return; // Lock clicks during nav
                const feature = e.features?.[0];
                if (feature) {
                    const routeId = feature.properties?.id;
                    // We need to find the route object from our state
                    // This is tricky inside the closure. We'll handle this via a ref or event bubbling ideally.
                    // For simply, we can emit a custom event or relying on React state update in 'click'.
                }
            });
            m.on('mouseenter', 'routes-core', () => m.getCanvas().style.cursor = 'pointer');
            m.on('mouseleave', 'routes-core', () => m.getCanvas().style.cursor = '');
        });

        // Cleanup
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []); // Run ONCE

    // --- 3. Live Rider Simulation (Interval) ---
    useEffect(() => {
        if (!map.current) return;

        const interval = setInterval(() => {
            if (!map.current || !map.current.getSource('riders')) return;

            // Jitter positions
            ridersRef.current = ridersRef.current.map(rider => ({
                ...rider,
                lng: rider.lng + (Math.random() - 0.5) * 0.001,
                lat: rider.lat + (Math.random() - 0.5) * 0.001
            }));

            const data: GeoJSON.FeatureCollection = {
                type: 'FeatureCollection',
                features: ridersRef.current.map(rider => ({
                    type: 'Feature',
                    geometry: { type: 'Point', coordinates: [rider.lng, rider.lat] },
                    properties: { ...rider }
                }))
            };

            (map.current.getSource('riders') as mapboxgl.GeoJSONSource).setData(data);

        }, 3000); // Update every 3 seconds

        return () => clearInterval(interval);
    }, []);

    // --- 4. React to Data Changes (Routes) ---
    // Separate effect to handle style loading race condition
    useEffect(() => {
        const updateRoutes = () => {
            if (!map.current || !map.current.getStyle() || !map.current.getSource('routes')) return;

            const displayedRoutes = isNavigating && selectedRoute ? [selectedRoute] : routes;

            const data: GeoJSON.FeatureCollection = {
                type: 'FeatureCollection',
                features: displayedRoutes.map(r => ({
                    type: 'Feature',
                    geometry: { type: 'LineString', coordinates: r.coordinates },
                    properties: { id: r.id, title: r.title }
                }))
            };

            (map.current.getSource('routes') as mapboxgl.GeoJSONSource).setData(data);

            // Adjust Line Width for Navigation
            if (isNavigating) {
                map.current.setPaintProperty('routes-core', 'line-width', 6);
                map.current.setPaintProperty('routes-glow', 'line-width', 12);
            } else {
                map.current.setPaintProperty('routes-core', 'line-width', 3);
                map.current.setPaintProperty('routes-glow', 'line-width', 8);
            }
        };

        if (map.current && map.current.isStyleLoaded()) {
            updateRoutes();
        } else if (map.current) {
            map.current.on('style.load', updateRoutes);
        }
    }, [routes, isNavigating, selectedRoute]);


    // --- 5. Interaction Handlers ---

    // We need to re-bind the click event listener if routes change, OR simplify by using stored state access.
    // Since map events are persistent, let's use a "selectedId" check inside the click handler or just find it from current Routes.
    useEffect(() => {
        if (!map.current) return;
        const clickHandler = (e: mapboxgl.MapMouseEvent & mapboxgl.EventData) => {
            if (isNavigating) return;
            const feature = map.current?.queryRenderedFeatures(e.point, { layers: ['routes-core'] })[0];
            if (feature) {
                const routeId = feature.properties?.id;
                const route = routes.find(r => r.id === routeId);
                if (route) handleRouteSelect(route);
            }
        };
        map.current.on('click', clickHandler);
        return () => { map.current?.off('click', clickHandler); };
    }, [routes, isNavigating]);


    const handleRouteSelect = useCallback((route: any) => {
        setSelectedRoute(route);
        if (map.current && route.coordinates.length > 0) {
            map.current.flyTo({
                center: route.coordinates[0],
                zoom: 13.5,
                pitch: 50,
                bearing: 20,
                duration: 2000
            });
        }
    }, []);

    const handleStartNavigation = () => {
        setIsNavigating(true);
        setCurrentStepIndex(0);

        if (map.current && selectedRoute && selectedRoute.coordinates.length > 0) {
            const coords = selectedRoute.coordinates;
            const start = coords[0];
            const end = coords[coords.length - 1];

            // Real Navigation Data Fetch
            const getDirections = async () => {
                try {
                    const query = await fetch(
                        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`,
                        { method: 'GET' }
                    );
                    const json = await query.json();
                    const data = json.routes[0];
                    setNavigationData({
                        duration: Math.floor(data.duration / 60),
                        distance: (data.distance / 1000).toFixed(1),
                        steps: data.legs[0].steps
                    });
                } catch (e) {
                    console.error("Nav fetch failed", e);
                    // Fallback
                    setNavigationData({
                        duration: 30, distance: "10", steps: [{ maneuver: { instruction: "Follow the neon line", type: "depart" } }]
                    });
                }
            };
            getDirections();

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
        setUserLocation(null);
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);

        if (map.current) {
            map.current.flyTo({ pitch: 45, zoom: 12, duration: 2000 });
        }
    };

    // User Location Puck Layer
    useEffect(() => {
        if (!map.current || !map.current.isStyleLoaded()) return;
        const m = map.current;
        const sourceId = 'user-location';

        const data = {
            type: 'FeatureCollection',
            features: userLocation ? [{
                type: 'Feature',
                geometry: { type: 'Point', coordinates: userLocation },
                properties: {}
            }] : []
        } as GeoJSON.FeatureCollection;

        if (m.getSource(sourceId)) {
            (m.getSource(sourceId) as mapboxgl.GeoJSONSource).setData(data);
        } else {
            // Add Source
            m.addSource(sourceId, { type: 'geojson', data });
            // Glow
            m.addLayer({
                id: 'user-puck-glow',
                type: 'circle',
                source: sourceId,
                paint: {
                    'circle-radius': 20,
                    'circle-color': '#3b82f6',
                    'circle-opacity': 0.3,
                    'circle-blur': 0.5
                }
            });
            // Core
            m.addLayer({
                id: 'user-puck-core',
                type: 'circle',
                source: sourceId,
                paint: {
                    'circle-radius': 8,
                    'circle-color': '#3b82f6',
                    'circle-stroke-width': 3,
                    'circle-stroke-color': '#ffffff'
                }
            });
        }
    }, [userLocation]);

    // Navigation Simulation Loop
    useEffect(() => {
        if (!isNavigating || !navigationData) return;
        const interval = setInterval(() => {
            setCurrentStepIndex(items => (items + 1) % navigationData.steps.length);
            // Simulate subtle camera movement
            if (map.current) {
                map.current.easeTo({
                    bearing: map.current.getBearing() + (Math.random() * 4 - 2),
                    duration: 4000
                });
            }
        }, 5000);
        return () => clearInterval(interval);
    }, [isNavigating, navigationData]);


    const handleRecenter = () => {
        map.current?.flyTo({ center: [29.6116, 41.1744], zoom: 13, pitch: 45, bearing: 0 });
    };

    return (
        <div className="relative w-full h-[85vh] bg-[#0A0A0A] overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            {/* Loading */}
            {loading && (
                <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 border-4 border-t-lime-400 border-white/10 rounded-full animate-spin"></div>
                        <div className="text-lime-400 font-mono text-xs tracking-widest">INITIALIZING SATELLITE...</div>
                    </div>
                </div>
            )}

            {/* Overlays */}
            {!isNavigating && (
                <>
                    <FloatingSearch />
                    <DiscoverySidebar routes={routes} onSelectRoute={handleRouteSelect} />
                    <MapHUD
                        coords={map.current ? `${map.current.getCenter().lng.toFixed(4)}, ${map.current.getCenter().lat.toFixed(4)}` : "Loading..."}
                        userCount={124}
                        onRecenter={handleRecenter}
                    />
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
                                <span>Action</span>
                                <span className="text-lime-400">{currentStepIndex + 1} / {navigationData.steps.length}</span>
                            </div>
                            <div className="text-lg leading-tight font-black text-white mt-1">
                                {navigationData.steps[currentStepIndex]?.maneuver?.instruction || "Proceed on route"}
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
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Speed limit</div>
                            <div className="text-xl font-black text-white">70</div>
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

            <div ref={mapContainer} className="w-full h-full" />

            {/* Error State */}
            {!import.meta.env.VITE_MAPBOX_TOKEN && !loading && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/10 text-red-500 p-4 rounded-xl border border-red-500/50 backdrop-blur">
                    Mapbox Token Missing
                </div>
            )}
        </div>
    );
};
