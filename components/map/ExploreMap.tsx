import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { DiscoverySidebar, FloatingSearch, MapHUD, RouteCard } from './MapOverlays';
import { routeService } from '../../services/routeService';

// --- Styles for Custom Markers (Leaflet needs CSS classes) ---
const PULSE_ICON_HTML = `
  <div class="relative w-full h-full">
    <div class="absolute inset-0 bg-cyan-400 rounded-full opacity-40 animate-ping"></div>
    <div class="absolute inset-2 bg-cyan-400 rounded-full border-2 border-white shadow-[0_0_15px_rgba(34,211,238,0.6)]"></div>
  </div>
`;

const USER_PUCK_HTML = `
  <div class="relative w-full h-full">
    <div class="absolute inset-[-10px] bg-blue-500 rounded-full opacity-30 animate-pulse"></div>
    <div class="absolute inset-0 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_20px_rgba(59,130,246,0.6)]"></div>
  </div>
`;

interface ExploreMapProps {
    onNavigate?: (view: any) => void;
}

const INITIAL_RIDERS = [
    { id: 1, name: 'GhostRider', lat: 41.1744, lng: 29.6116, speed: '124 km/h' },
    { id: 2, name: 'ApexPredator', lat: 41.1800, lng: 29.6200, speed: '98 km/h' },
    { id: 3, name: 'NightFury', lat: 41.1600, lng: 29.6000, speed: '0 km/h' },
];

export const ExploreMap: React.FC<ExploreMapProps> = ({ onNavigate }) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<L.Map | null>(null);

    // Layers
    const ridersLayer = useRef<L.LayerGroup | null>(null);
    const routesLayer = useRef<L.LayerGroup | null>(null);
    const navLayer = useRef<L.LayerGroup | null>(null);
    const userMarker = useRef<L.Marker | null>(null);

    // State
    const [loading, setLoading] = useState(true);
    const [routes, setRoutes] = useState<any[]>([]);
    const [selectedRoute, setSelectedRoute] = useState<any>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    // Navigation Data
    const [navigationData, setNavigationData] = useState<any>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null); // [Lat, Lng] for Leaflet
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

    const watchId = useRef<number | null>(null);
    const ridersRef = useRef(INITIAL_RIDERS);

    // --- 1. Fetch Routes ---
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const data = await routeService.getRoutes();
                const transformedRoutes = data.map((r: any) => ({
                    id: r._id,
                    title: r.title,
                    desc: r.description,
                    // Leaflet needs [Lat, Lng], GeoJSON is [Lng, Lat]. We must FLIP if source is GeoJSON.
                    // Assuming API returns {lat, lng} objects or standard GeoJSON [lng, lat] arrays.
                    // routeService usually returns objects with coords. Let's normalize to [Lat, Lng].
                    coordinates: r.coordinates.map((c: any) => [c.lat, c.lng]),
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

    // --- 2. Initialize Map (Leaflet) ---
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        // Init Map
        map.current = L.map(mapContainer.current, {
            zoomControl: false,
            attributionControl: false,
            center: [41.1744, 29.6116], // Istanbul
            zoom: 13
        });

        // Dark Matter Tiles (CartoDB) - Premium Look
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            subdomains: 'abcd',
        }).addTo(map.current);

        // Layer Groups
        ridersLayer.current = L.layerGroup().addTo(map.current);
        routesLayer.current = L.layerGroup().addTo(map.current);
        navLayer.current = L.layerGroup().addTo(map.current); // Use for Nav Path

        setLoading(false);

        // Cleanup
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // --- 3. Render Riders ---
    useEffect(() => {
        if (!map.current || !ridersLayer.current) return;

        // Clear existing
        ridersLayer.current.clearLayers();

        // Add Riders
        ridersRef.current.forEach(rider => {
            const icon = L.divIcon({
                html: PULSE_ICON_HTML,
                className: 'bg-transparent',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            L.marker([rider.lat, rider.lng], { icon })
                .bindPopup(`
                    <div class="p-2 bg-black text-white font-mono text-xs">
                        <strong class="text-cyan-400">${rider.name}</strong><br/>
                        ${rider.speed}
                    </div>
                `, { closeButton: false, className: 'leaflet-popup-dark' })
                .addTo(ridersLayer.current!);
        });

    }, [ridersRef.current]); // Re-run if riders update (add simulation interval later if needed)

    // --- 4. Render Routes Lines ---
    useEffect(() => {
        if (!map.current || !routesLayer.current) return;

        routesLayer.current.clearLayers();

        // If navigating, we DON'T show all routes, we show the NAV path in a separate layer.
        // But if user cancels nav, we show routes again.
        if (isNavigating) return;

        routes.forEach(route => {
            // Check if is selected
            const isSelected = selectedRoute?.id === route.id;

            // Base Line (Outer Glow)
            L.polyline(route.coordinates, {
                color: isSelected ? '#E2FF3B' : '#E2FF3B',
                weight: isSelected ? 8 : 4,
                opacity: isSelected ? 0.6 : 0.3,
                className: isSelected ? 'drop-shadow-[0_0_10px_rgba(226,255,59,0.5)]' : ''
            }).addTo(routesLayer.current!);

            // Core Line
            const poly = L.polyline(route.coordinates, {
                color: '#E2FF3B',
                weight: isSelected ? 4 : 2,
                opacity: 1
            }).addTo(routesLayer.current!);

            // Click Handler
            poly.on('click', () => {
                handleRouteSelect(route);
            });
        });

    }, [routes, selectedRoute, isNavigating]);

    const handleRouteSelect = (route: any) => {
        setSelectedRoute(route);
        if (map.current && route.coordinates.length > 0) {
            map.current.flyTo(route.coordinates[0], 14, { duration: 1.5 });
        }
    };

    // --- 5. Navigation Logic (OSRM + GPS) ---
    const handleStartNavigation = () => {
        if (!selectedRoute) return;

        // 1. Permission
        if (!navigator.geolocation) {
            alert("Geolocation not supported");
            return;
        }

        // 2. Set State
        setIsNavigating(true);
        setCurrentStepIndex(0);

        // 3. Clear Static Routes
        routesLayer.current?.clearLayers();

        // 4. Get Position
        navigator.geolocation.getCurrentPosition((pos) => {
            const userLat = pos.coords.latitude;
            const userLng = pos.coords.longitude;
            setUserLocation([userLat, userLng]);

            // Start Watch
            watchId.current = navigator.geolocation.watchPosition(p => {
                const lat = p.coords.latitude;
                const lng = p.coords.longitude;
                setUserLocation([lat, lng]);

                // Move Camera
                if (map.current) map.current.panTo([lat, lng]);

            }, err => console.error(err), { enableHighAccuracy: true });

            // 5. Fetch OSRM Route
            fetchOSRMRoute(userLat, userLng);

        }, (err) => {
            console.error(err);
            alert("Location permission denied");
            handleStopNavigation();
        });
    };

    const fetchOSRMRoute = async (startLat: number, startLng: number) => {
        if (!selectedRoute) return;
        const end = selectedRoute.coordinates[selectedRoute.coordinates.length - 1]; // [Lat, Lng]
        const endLat = end[0];
        const endLng = end[1];

        // OSRM expects Lng,Lat
        const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;

        try {
            const res = await fetch(url);
            const json = await res.json();

            if (json.code !== 'Ok' || !json.routes || json.routes.length === 0) {
                alert("Route not found");
                return;
            }

            const routeData = json.routes[0];

            // Set Navigation Data
            setNavigationData({
                duration: Math.floor(routeData.duration / 60), // min
                distance: (routeData.distance / 1000).toFixed(1), // km
                steps: routeData.legs[0].steps
            });

            // Draw Route Component (GeoJSON from OSRM is [Lng, Lat], Leaflet needs [Lat, Lng])
            const coords = routeData.geometry.coordinates.map((c: number[]) => [c[1], c[0]]);

            if (navLayer.current) {
                navLayer.current.clearLayers();
                // Draw Calculated Path
                L.polyline(coords, {
                    color: '#06b6d4', // Cyan for Navigation
                    weight: 6,
                    opacity: 0.9,
                    className: 'drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]'
                }).addTo(navLayer.current);
            }

        } catch (e) {
            console.error("OSRM Error", e);
            alert("Failed to calculate route");
        }
    };

    const handleStopNavigation = () => {
        setIsNavigating(false);
        setUserLocation(null);
        setNavigationData(null);
        if (watchId.current) navigator.geolocation.clearWatch(watchId.current);

        if (navLayer.current) navLayer.current.clearLayers();
        if (userMarker.current) {
            userMarker.current.remove();
            userMarker.current = null;
        }

        // Reset View
        if (map.current) map.current.flyTo([41.1744, 29.6116], 13);
    };

    // --- 6. Update User Puck ---
    useEffect(() => {
        if (!map.current || !userLocation) return;

        // Icon
        const icon = L.divIcon({
            html: USER_PUCK_HTML,
            className: 'bg-transparent',
            iconSize: [32, 32],
            iconAnchor: [16, 16]
        });

        if (userMarker.current) {
            userMarker.current.setLatLng(userLocation);
        } else {
            userMarker.current = L.marker(userLocation, { icon }).addTo(map.current);
        }

    }, [userLocation]);


    const handleRecenter = () => {
        if (map.current) map.current.flyTo([41.1744, 29.6116], 13);
    };

    return (
        <div className="relative w-full h-[85vh] bg-[#0A0A0A] overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            {/* Map Container */}
            <div ref={mapContainer} className="w-full h-full z-0" />

            {loading && (
                <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
                    <div className="text-lime-400 font-mono animate-pulse">SYSTEM INITIALIZING...</div>
                </div>
            )}

            {/* Overlays */}
            {!isNavigating && (
                <>
                    <FloatingSearch />
                    <DiscoverySidebar routes={routes} onSelectRoute={(r: any) => handleRouteSelect(r)} />
                    <MapHUD
                        coords={userLocation ? `${userLocation[0].toFixed(4)}, ${userLocation[1].toFixed(4)}` : "scanning..."}
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

            {/* Nav HUD */}
            {isNavigating && navigationData && (
                <>
                    {/* Top Bar - Turn Instructions */}
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-[400px] z-[1200] bg-black/90 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-cyan-400 rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(34,211,238,0.3)] animate-pulse">
                            <span className="text-2xl font-black">
                                {navigationData.steps[currentStepIndex]?.maneuver?.type === 'arrive' ? '🏁' : '↱'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-400 font-bold uppercase tracking-widest flex justify-between">
                                <span>Action</span>
                                <span className="text-cyan-400">{currentStepIndex + 1} / {navigationData.steps.length}</span>
                            </div>
                            <div className="text-lg leading-tight font-black text-white mt-1">
                                {navigationData.steps[currentStepIndex]?.maneuver?.instruction || "Proceed on route"}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Data Bar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] z-[1200] grid grid-cols-3 gap-2">
                        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl text-center">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Estimated Arrival</div>
                            <div className="text-xl font-black text-white">
                                {new Date(new Date().getTime() + navigationData.duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div className="bg-black/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl text-center">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Remaining</div>
                            <div className="text-xl font-black text-cyan-400">{navigationData.duration} min</div>
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
                </>
            )}

            {isNavigating && !navigationData && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur border border-cyan-400/50 text-cyan-400 px-6 py-3 rounded-full flex items-center gap-3 z-[1500] shadow-[0_0_30px_rgba(6,182,212,0.2)]">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                    <span className="font-bold tracking-widest text-xs uppercase">CALCULATING VECTOR...</span>
                </div>
            )}
        </div>
    );
};
