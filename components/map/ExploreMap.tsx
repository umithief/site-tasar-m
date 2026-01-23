import React, { useState, useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion, AnimatePresence } from 'framer-motion';
import { DiscoverySidebar, FloatingSearch, MapHUD, RouteCard } from './MapOverlays';
import { routeService } from '../../services/routeService';
import { Layers } from 'lucide-react';

// --- Styles for Custom Markers (Leaflet needs CSS classes) ---
const PULSE_ICON_HTML = `
  <div class="relative w-full h-full flex items-center justify-center">
    <div class="absolute w-full h-full bg-moto-accent/30 rounded-full animate-ping"></div>
    <div class="relative w-3 h-3 bg-moto-accent rounded-full border-2 border-[#111] shadow-[0_0_20px_rgba(226,255,59,0.8)]"></div>
  </div>
`;

const USER_PUCK_HTML = `
  <div class="relative w-full h-full flex items-center justify-center">
    <div class="absolute w-[40px] h-[40px] bg-blue-500/20 rounded-full animate-pulse"></div>
    <div class="relative w-4 h-4 bg-blue-500 rounded-full border-[3px] border-white shadow-[0_0_25px_rgba(59,130,246,0.8)] z-10"></div>
    <div class="absolute w-[100px] h-[100px] bg-gradient-to-t from-blue-500/10 to-transparent rounded-full transform rotate-45 pointer-events-none"></div>
  </div>
`;

interface ExploreMapProps {
    onNavigate?: (view: any) => void;
    variant?: 'desktop' | 'mobile';
}

const INITIAL_RIDERS = [
    { id: 1, name: 'GhostRider', lat: 41.1744, lng: 29.6116, speed: '124 km/h' },
    { id: 2, name: 'ApexPredator', lat: 41.1800, lng: 29.6200, speed: '98 km/h' },
    { id: 3, name: 'NightFury', lat: 41.1600, lng: 29.6000, speed: '0 km/h' },
];

export const ExploreMap: React.FC<ExploreMapProps> = ({ onNavigate, variant = 'desktop' }) => {
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
    const [isMobileRoutesOpen, setIsMobileRoutesOpen] = useState(false);

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
                    // Robust Coordinate Parsing: Handle {lat, lng} OR [lat, lng] OR [lng, lat] (GeoJSON)
                    // Leaflet wants [Lat, Lng].
                    coordinates: r.coordinates.map((c: any) => {
                        if (Array.isArray(c)) return [c[1], c[0]]; // Assume GeoJSON [Lng, Lat] if array
                        if (c.lat && c.lng) return [c.lat, c.lng]; // Object
                        return [0, 0]; // Fallback
                    }),
                    dist: r.distance,
                    difficulty: r.difficulty,
                    image: r.image,
                    rating: r.rating,
                    weather: r.weather,
                    riders: r.riders
                }));
                // debug
                console.log("Mapped Routes:", transformedRoutes);
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
            zoom: 13,
            // Smooth zoom interaction
            zoomSnap: 0.1,
            zoomDelta: 0.5,
            wheelPxPerZoomLevel: 120
        });

        // Dark Matter Tiles (CartoDB) - Ultra Premium Dark Look
        L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            maxZoom: 20,
            subdomains: 'abcd',
        }).addTo(map.current);

        // Optional: Custom canvas renderer for better performance with many markers
        const myRenderer = L.canvas({ padding: 0.5 });

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
                    <div class="p-3 bg-[#09090b] text-white font-mono text-xs shadow-2xl rounded-xl border border-white/10 min-w-[120px]">
                        <strong class="text-moto-accent text-sm block mb-1 tracking-wider">${rider.name}</strong>
                        <div class="flex items-center gap-2 text-gray-400">
                             <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                             ${rider.speed}
                        </div>
                    </div>
                `, { closeButton: false, className: 'leaflet-popup-dark custom-popup-arrow' })
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
                color: isSelected ? 'rgba(226, 255, 59, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                weight: isSelected ? 10 : 4,
                opacity: 1,
                className: isSelected ? 'drop-shadow-[0_0_15px_rgba(226,255,59,0.4)]' : ''
            }).addTo(routesLayer.current!);

            // Core Line
            const poly = L.polyline(route.coordinates, {
                color: isSelected ? '#E2FF3B' : '#555', // Moto Accent for selected, dark grey for others
                weight: isSelected ? 3 : 2,
                opacity: 1,
                dashArray: isSelected ? '' : '5, 10'
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
        if (!selectedRoute || !selectedRoute.coordinates || selectedRoute.coordinates.length === 0) {
            alert("Invalid destination coordinates");
            handleStopNavigation();
            return;
        }

        const end = selectedRoute.coordinates[selectedRoute.coordinates.length - 1]; // [Lat, Lng]
        const endLat = end[0];
        const endLng = end[1];

        // OSRM expects Lng,Lat
        const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true`;
        console.log("Fetching OSRM:", url);

        try {
            const res = await fetch(url);
            const json = await res.json();

            console.log("OSRM Response:", json);

            if (json.code !== 'Ok' || !json.routes || json.routes.length === 0) {
                alert("Route not found by OSRM");
                handleStopNavigation();
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
                    color: '#3B82F6', // Electric Blue
                    weight: 6,
                    opacity: 1,
                    className: 'drop-shadow-[0_0_20px_rgba(59,130,246,0.6)] animate-pulse-slow'
                }).addTo(navLayer.current);
            }

        } catch (e) {
            console.error("OSRM Error", e);
            alert("Failed to calculate route");
            handleStopNavigation();
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
        <div className={`relative w-full bg-[#09090b] overflow-hidden ${variant === 'mobile'
            ? 'h-[100dvh] rounded-none border-none'
            : 'h-[85vh] rounded-[2rem] border border-white/5 shadow-2xl ring-1 ring-white/5'
            }`}>
            {/* Map Container */}
            <div ref={mapContainer} className="w-full h-full z-0" />

            {loading && (
                <div className="absolute inset-0 z-50 bg-white flex items-center justify-center">
                    <div className="text-moto-accent font-mono animate-pulse">SYSTEM INITIALIZING...</div>
                </div>
            )}

            {/* Overlays */}
            {!isNavigating && (
                <>
                    <FloatingSearch />

                    <DiscoverySidebar
                        routes={routes}
                        onSelectRoute={(r: any) => handleRouteSelect(r)}
                        isOpen={isMobileRoutesOpen}
                        onClose={() => setIsMobileRoutesOpen(false)}
                    />

                    {/* Mobile: Toggle Routes Button */}
                    <button
                        onClick={() => setIsMobileRoutesOpen(!isMobileRoutesOpen)}
                        className="md:hidden absolute bottom-24 left-4 z-[950] bg-white/90 backdrop-blur border border-gray-100 p-3 rounded-xl text-gray-900 shadow-lg flex items-center gap-2"
                    >
                        <Layers className="w-5 h-5 text-moto-accent" />
                        <span className="text-xs font-bold uppercase">Rotalar</span>
                    </button>

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
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-[400px] z-[1200] bg-white/90 backdrop-blur-xl border border-gray-100 p-4 rounded-2xl shadow-xl flex items-center gap-4">
                        <div className="w-12 h-12 bg-moto-accent rounded-xl flex items-center justify-center text-black shadow-[0_0_20px_rgba(226,255,59,0.3)] animate-pulse">
                            <span className="text-2xl font-black">
                                {navigationData.steps[currentStepIndex]?.maneuver?.type === 'arrive' ? '🏁' : '↱'}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-gray-500 font-bold uppercase tracking-widest flex justify-between">
                                <span>Action</span>
                                <span className="text-moto-accent-dark">{currentStepIndex + 1} / {navigationData.steps.length}</span>
                            </div>
                            <div className="text-lg leading-tight font-black text-gray-900 mt-1">
                                {navigationData.steps[currentStepIndex]?.maneuver?.instruction || "Proceed on route"}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Data Bar */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] z-[1200] grid grid-cols-3 gap-2">
                        <div className="bg-white/90 backdrop-blur-xl border border-gray-100 p-3 rounded-2xl text-center">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Estimated Arrival</div>
                            <div className="text-xl font-black text-gray-900">
                                {new Date(new Date().getTime() + navigationData.duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                        <div className="bg-white/90 backdrop-blur-xl border border-gray-100 p-3 rounded-2xl text-center">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Remaining</div>
                            <div className="text-xl font-black text-moto-accent-dark">{navigationData.duration} min</div>
                        </div>
                        <div className="bg-white/90 backdrop-blur-xl border border-gray-100 p-3 rounded-2xl text-center">
                            <div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Distance</div>
                            <div className="text-xl font-black text-gray-900">{navigationData.distance} km</div>
                        </div>
                    </div>

                    {/* Exit Button */}
                    <button
                        onClick={handleStopNavigation}
                        className="absolute top-6 right-6 z-[1200] w-10 h-10 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    >
                        <span className="font-bold">X</span>
                    </button>
                </>
            )}

            {isNavigating && !navigationData && (
                <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur border border-gray-200 text-gray-900 px-6 py-3 rounded-full flex items-center gap-3 z-[1500] shadow-lg">
                    <div className="w-2 h-2 bg-moto-accent rounded-full animate-ping" />
                    <span className="font-bold tracking-widest text-xs uppercase">CALCULATING VECTOR...</span>
                </div>
            )}
        </div>
    );
};
