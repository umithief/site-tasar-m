import React, { useState, useEffect, useRef } from 'react';
import { X, Navigation, PlayCircle, Pause, SkipForward, SkipBack, MapPin, Thermometer, Gauge, Mountain, Activity, TrendingUp, Move, ExternalLink, ArrowRight, Crosshair, Power, Zap, Play, Search, AlertCircle } from 'lucide-react';
import { musicService } from '../services/musicService';
import { MusicTrack, Route, ViewState } from '../types';

declare const L: any;

interface RideModeProps {
    route?: Route | null;
    onNavigate: (view: ViewState) => void;
}

interface ActiveTarget {
    name: string;
    distance: number;
    originalDistance: number;
}

interface NavInstruction {
    text: string;
    distance: number;
    type: string;
    modifier?: string;
}

interface TelemetryData {
    altitude: number;
    gForce: number;
    slope: number;
    windSpeed: number;
    windDir: string;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: any;
    }
}

// Helper: Extract YouTube ID
function getYouTubeID(url: string) {
    if (!url) return false;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7] && match[7].length === 11) ? match[7] : false;
}

// Helper: Calculate bearing between two points
function calculateBearing(startLat: number, startLng: number, destLat: number, destLng: number) {
    const startLatRad = startLat * (Math.PI / 180);
    const startLngRad = startLng * (Math.PI / 180);
    const destLatRad = destLat * (Math.PI / 180);
    const destLngRad = destLng * (Math.PI / 180);

    const y = Math.sin(destLngRad - startLngRad) * Math.cos(destLatRad);
    const x = Math.cos(startLatRad) * Math.sin(destLatRad) -
        Math.sin(startLatRad) * Math.cos(destLatRad) * Math.cos(destLngRad - startLngRad);
    let brng = Math.atan2(y, x);
    brng = brng * (180 / Math.PI);
    return (brng + 360) % 360;
}

// Helper: Translate OSRM Instructions to Turkish (Fallback)
function translateInstruction(text: string): string {
    if (!text) return '';
    let t = text.toLowerCase();

    // Directions
    t = t.replace(/\bturn right\b/g, 'Sağa dön');
    t = t.replace(/\bturn left\b/g, 'Sola dön');
    t = t.replace(/\bslight right\b/g, 'Hafif sağa');
    t = t.replace(/\bslight left\b/g, 'Hafif sola');
    t = t.replace(/\bcontinue\b/g, 'Devam et');
    t = t.replace(/\bstraight\b/g, 'Düz git');
    t = t.replace(/\bkeep right\b/g, 'Sağdan devam et');
    t = t.replace(/\bkeep left\b/g, 'Soldan devam et');
    t = t.replace(/\bmake a u-turn\b/g, 'U dönüşü yap');
    t = t.replace(/\benter the roundabout\b/g, 'Dönel kavşağa gir');
    t = t.replace(/\band take the\b/g, 've çıkış:');
    t = t.replace(/\bexit\b/g, 'çıkış');
    t = t.replace(/\bdestination\b/g, 'Hedef');
    t = t.replace(/\bon the right\b/g, 'sağda');
    t = t.replace(/\bon the left\b/g, 'solda');
    t = t.replace(/\bit looks like you have arrived\b/g, 'Hedefe ulaştınız');
    t = t.replace(/\byou have arrived\b/g, 'Vardınız');
    t = t.replace(/\bat the end of the road\b/g, 'Yolun sonunda');

    // Prepositions/Connectors
    t = t.replace(/\bonto\b/g, 'yönüne:');
    t = t.replace(/\btowards\b/g, 'istikametine:');

    // Capitalize first letter
    return t.charAt(0).toUpperCase() + t.slice(1);
}

export const RideMode: React.FC<RideModeProps> = ({ route, onNavigate }) => {
    // System State
    const [time, setTime] = useState(new Date());
    const [showTelemetry, setShowTelemetry] = useState(false);
    const [isLowPowerMode, setIsLowPowerMode] = useState(false); // PERFORMANCE MODE TOGGLE

    // GPS State
    // FIX: Initialize currentLoc with route start point if available
    const [currentLoc, setCurrentLoc] = useState<{ lat: number; lng: number } | null>(() => {
        if (!route) return null;
        // Handle path first (most accurate)
        if (route.path && route.path.length > 0) {
            return { lat: route.path[0].lat, lng: route.path[0].lng };
        }
        // Handle coordinates which might be object or array
        const coords = route.coordinates as any;
        if (coords) {
            if (Array.isArray(coords) && coords.length > 0) {
                return { lat: coords[0].lat, lng: coords[0].lng };
            } else if (typeof coords.lat === 'number' && typeof coords.lng === 'number') {
                return { lat: coords.lat, lng: coords.lng };
            }
        }
        return null;
    });

    const [isGpsEnabled, setIsGpsEnabled] = useState(false); // Default OFF
    const [gpsStatus, setGpsStatus] = useState<'active' | 'searching' | 'off' | 'denied' | 'unavailable'>('off');
    const [heading, setHeading] = useState(0);

    // Physics & Demo
    const [speed, setSpeed] = useState(0);
    const [rpm, setRpm] = useState(1000);
    const [gear, setGear] = useState('N');
    const [leanAngle, setLeanAngle] = useState(0);
    const [distance, setDistance] = useState(0.0);
    const [telemetry, setTelemetry] = useState<TelemetryData>({ altitude: 120, gForce: 0, slope: 0, windSpeed: 12, windDir: 'KB' });

    const [isDemoMode, setIsDemoMode] = useState(false);
    const [demoRoutePoints, setDemoRoutePoints] = useState<any[]>([]);

    // Refs for Performance Throttling
    const demoIndexRef = useRef(0);
    const watchIdRef = useRef<number | null>(null);
    const prevSpeedRef = useRef(0);
    const lastMapUpdateRef = useRef(0);
    const lastUiUpdateRef = useRef(0);

    // Nav
    const [navMessage, setNavMessage] = useState<string | null>(route ? `ROTA: ${route.title}` : 'SİSTEM HAZIR');
    const [nextTurn, setNextTurn] = useState<NavInstruction | null>(null);
    const [showNav, setShowNav] = useState(false);
    const [activeTarget, setActiveTarget] = useState<ActiveTarget | null>(null);

    // Quick Nav Choice State
    const [pendingNavChoice, setPendingNavChoice] = useState<{ label: string; dist: string } | null>(null);

    // Map Refs
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const tileLayerRef = useRef<any>(null);
    const markerRef = useRef<any>(null);
    const trailPolylineRef = useRef<any>(null);
    const routingControlRef = useRef<any>(null);
    const routeLineRef = useRef<any>(null); // New Ref for static route lines
    const routeMarkersRef = useRef<any[]>([]); // New Ref for start/end markers
    const hasInitialPanRef = useRef(false);

    // --- MUSIC STATE ---
    const [playlist, setPlaylist] = useState<MusicTrack[]>([]);
    const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const ytPlayerRef = useRef<any>(null);

    // 1. Load Playlist
    useEffect(() => {
        const loadMusic = async () => {
            const tracks = await musicService.getMusic();
            if (tracks.length > 0) {
                setPlaylist(tracks);
                setCurrentTrackIndex(0);
            }
        };
        loadMusic();
    }, []);

    // 2. Init YouTube API
    useEffect(() => {
        const initYT = () => {
            if (window.YT && window.YT.Player) {
                createPlayer();
            } else {
                const checkYT = setInterval(() => {
                    if (window.YT && window.YT.Player) {
                        clearInterval(checkYT);
                        createPlayer();
                    }
                }, 100);
            }
        };

        const createPlayer = () => {
            if (ytPlayerRef.current) return;
            try {
                ytPlayerRef.current = new window.YT.Player('youtube-player', {
                    height: '1',
                    width: '1',
                    playerVars: {
                        'playsinline': 1,
                        'controls': 0,
                        'disablekb': 1,
                        'fs': 0,
                        'iv_load_policy': 3,
                        'rel': 0,
                        'enablejsapi': 1,
                        'origin': window.location.origin
                    },
                    events: {
                        'onReady': onPlayerReady,
                        'onStateChange': onPlayerStateChange,
                        'onError': onPlayerError
                    }
                });
            } catch (e) {
                console.warn("YT Player Init Error:", e);
            }
        };

        if (!window.YT) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
            window.onYouTubeIframeAPIReady = initYT;
        } else {
            initYT();
        }

        // Clock update - Low frequency
        const timer = setInterval(() => setTime(new Date()), 10000);
        return () => clearInterval(timer);
    }, []);

    const onPlayerReady = (event: any) => {
        setIsPlayerReady(true);
        if (playlist.length > 0) {
            const track = playlist[currentTrackIndex];
            const vidId = getYouTubeID(track.url);
            if (vidId && ytPlayerRef.current) {
                ytPlayerRef.current.cueVideoById(vidId);
            }
        }
    };

    const onPlayerStateChange = (event: any) => {
        if (event.data === 0) handleNextSong();
        if (event.data === 1) setIsPlaying(true);
        if (event.data === 2) setIsPlaying(false);
        if (event.data === 3) setIsPlaying(true);
    };

    const onPlayerError = (event: any) => {
        console.warn("YouTube Player Error Code:", event.data);
        setTimeout(() => handleNextSong(), 1000);
    };

    const playCurrentTrack = () => {
        const track = playlist[currentTrackIndex];
        if (!track || !ytPlayerRef.current || typeof ytPlayerRef.current.loadVideoById !== 'function') return;

        const vidId = getYouTubeID(track.url);
        if (vidId) {
            ytPlayerRef.current.loadVideoById(vidId);
        } else {
            handleNextSong();
        }
    };

    useEffect(() => {
        if (isPlayerReady && playlist.length > 0) {
            playCurrentTrack();
        }
    }, [currentTrackIndex, playlist.length]);

    const togglePlay = () => {
        if (!ytPlayerRef.current || typeof ytPlayerRef.current.playVideo !== 'function') return;
        if (isPlaying) {
            ytPlayerRef.current.pauseVideo();
            setIsPlaying(false);
        } else {
            ytPlayerRef.current.playVideo();
            setIsPlaying(true);
        }
    };

    const handleNextSong = () => {
        if (playlist.length === 0) return;
        setCurrentTrackIndex((prev) => (prev + 1) % playlist.length);
    };

    const handlePrevSong = () => {
        if (playlist.length === 0) return;
        setCurrentTrackIndex((prev) => (prev - 1 + playlist.length) % playlist.length);
    };

    // --- MAP INITIALIZATION ---
    useEffect(() => {
        if (mapContainerRef.current && !mapRef.current && typeof L !== 'undefined') {
            // If a route is present, center on its start, otherwise default (Ankara)
            let initialCenter: [number, number] = [39.92, 32.85];

            if (route) {
                if (route.path && route.path.length > 0 && typeof route.path[0].lat === 'number' && typeof route.path[0].lng === 'number') {
                    initialCenter = [route.path[0].lat, route.path[0].lng];
                } else if (route.coordinates && typeof (route.coordinates as any).lat === 'number' && typeof (route.coordinates as any).lng === 'number') {
                    initialCenter = [(route.coordinates as any).lat, (route.coordinates as any).lng];
                }
            }

            const map = L.map(mapContainerRef.current, {
                zoomControl: false,
                attributionControl: false,
                dragging: true, // Allow dragging to inspect route
                scrollWheelZoom: true,
                doubleClickZoom: false,
                fadeAnimation: true,
                markerZoomAnimation: true,
                zoomAnimation: true,
                inertia: true
            }).setView(initialCenter, 15);

            // SATELLITE MAP (Esri World Imagery)
            tileLayerRef.current = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
                attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
                maxZoom: 19
            }).addTo(map);

            mapRef.current = map;

            // Initial Rider Marker
            updateMarkerIcon();
            markerRef.current = L.marker(initialCenter, {
                icon: L.divIcon({ className: 'dummy' }), // Placeholder
                zIndexOffset: 1000
            }).addTo(map);
            updateMarkerIcon(); // Call AFTER creation

            // GLOWING TRAIL Polyline (History)
            trailPolylineRef.current = L.polyline([], {
                color: '#00f3ff', // Cyan Neon
                weight: 4,
                opacity: 0.5,
                lineCap: 'round',
                className: 'trail-polyline'
            }).addTo(map);

            // Add CSS for the neon line
            const style = document.createElement('style');
            style.innerHTML = `
            .neon-polyline { filter: drop-shadow(0 0 8px #E2FF3B); }
            .trail-polyline { filter: drop-shadow(0 0 5px #00f3ff); }
            .leaflet-container { background: #000 !important; }
          `;
            document.head.appendChild(style);
        }

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
            if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
        };
    }, []);

    // --- MARKER STYLE UPDATE ---
    useEffect(() => {
        updateMarkerIcon();
    }, [isLowPowerMode]);

    // GPS Watcher Toggle Logic
    useEffect(() => {
        if (isDemoMode) return;

        if (!isGpsEnabled) {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
                watchIdRef.current = null;
            }
            setGpsStatus('off');
            return;
        }

        if (isGpsEnabled && navigator.geolocation) {
            setGpsStatus('searching');
            watchIdRef.current = navigator.geolocation.watchPosition(
                (pos) => {
                    setGpsStatus('active');
                    const newLat = pos.coords.latitude;
                    const newLng = pos.coords.longitude;
                    const newSpeed = (pos.coords.speed || 0) * 3.6;

                    let newHeading = pos.coords.heading;
                    if (!newHeading && currentLoc) {
                        newHeading = calculateBearing(currentLoc.lat, currentLoc.lng, newLat, newLng);
                    }

                    updatePosition(newLat, newLng, newSpeed, newHeading || heading);
                },
                (err) => {
                    console.warn("GPS Watch Error:", err);
                    setGpsStatus('searching');
                },
                {
                    enableHighAccuracy: true,
                    maximumAge: 0,
                    timeout: 5000
                }
            );
        }

        return () => {
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
        };
    }, [isDemoMode, isGpsEnabled]);

    const toggleGps = () => {
        setIsGpsEnabled(!isGpsEnabled);
        if (!isGpsEnabled) setGpsStatus('searching');
        else setGpsStatus('off');
    };

    const updateMarkerIcon = () => {
        if (!markerRef.current) return;

        const html = `
        <div id="rider-icon" style="transition: transform 0.3s linear; transform-origin: center;">
            <div class="relative flex items-center justify-center">
                <div class="absolute w-16 h-16 bg-[#E2FF3B]/20 rounded-full animate-ping opacity-50"></div>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px #E2FF3B);">
                    <path d="M12 2L4.5 20.29C4.21 21.01 4.96 21.72 5.67 21.37L12 18.25L18.33 21.37C19.04 21.72 19.79 21.01 19.5 20.29L12 2Z" fill="#E2FF3B" stroke="black" stroke-width="2" stroke-linejoin="round"/>
                </svg>
            </div>
        </div>
      `;

        const icon = L.divIcon({
            className: 'custom-nav-arrow',
            html: html,
            iconSize: [48, 48],
            iconAnchor: [24, 24]
        });

        markerRef.current.setIcon(icon);
    };

    // --- OPTIMIZED POSITION UPDATE ---
    const updatePosition = (lat: number, lng: number, newSpeed: number, newHeading: number) => {
        const now = Date.now();
        prevSpeedRef.current = newSpeed;

        // Map Update
        if (now - lastMapUpdateRef.current > 50) {
            if (mapRef.current) {
                // Auto-pan if speed > 5 km/h OR if it's the first location update (initial center) OR demo mode
                if (newSpeed > 5 || isDemoMode || !hasInitialPanRef.current) {
                    mapRef.current.setView([lat, lng], mapRef.current.getZoom(), { animate: true, duration: 0.5 });
                    hasInitialPanRef.current = true;
                }
            }

            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
                const el = document.getElementById('rider-icon');
                if (el) el.style.transform = `rotate(${newHeading}deg)`;
            }

            if (trailPolylineRef.current) {
                trailPolylineRef.current.addLatLng([lat, lng]);
                const latlngs = trailPolylineRef.current.getLatLngs();
                if (latlngs.length > 50) {
                    latlngs.shift();
                    trailPolylineRef.current.setLatLngs(latlngs);
                }
            }
            lastMapUpdateRef.current = now;
        }

        // UI Update
        if (now - lastUiUpdateRef.current > 100) {
            setCurrentLoc({ lat, lng });
            setSpeed(newSpeed);
            setHeading(newHeading);

            const simulatedRpm = newSpeed > 0 ? 3000 + (newSpeed * 50) % 7000 : 1000;
            setRpm(simulatedRpm);
            const simulatedGear = newSpeed === 0 ? 'N' : newSpeed < 20 ? '1' : newSpeed < 40 ? '2' : newSpeed < 70 ? '3' : newSpeed < 100 ? '4' : newSpeed < 130 ? '5' : '6';
            setGear(simulatedGear);

            if (showTelemetry) {
                setTelemetry(prev => ({
                    ...prev,
                    gForce: isLowPowerMode ? 0 : parseFloat(((newSpeed - prevSpeedRef.current) / 30).toFixed(2))
                }));
            }
            lastUiUpdateRef.current = now;
        }
    };

    // --- ROUTING LOGIC (CORE FIX) ---
    useEffect(() => {
        if (!mapRef.current || typeof L === 'undefined') return;

        // 1. Cleanup
        if (routingControlRef.current) {
            try {
                routingControlRef.current.setWaypoints([]);
                mapRef.current.removeControl(routingControlRef.current);
            } catch (e) { }
            routingControlRef.current = null;
        }
        if (routeLineRef.current) {
            try { routeLineRef.current.remove(); } catch (e) { }
            routeLineRef.current = null;
        }
        routeMarkersRef.current.forEach(m => m.remove());
        routeMarkersRef.current = [];

        setDemoRoutePoints([]);
        setNextTurn(null);
        setNavMessage(activeTarget ? `HEDEF: ${activeTarget.name}` : route ? `ROTA: ${route.title}` : 'SİSTEM HAZIR');

        // 2. PRIORITY: Active Target (Quick Nav - Dynamic OSRM)
        if (activeTarget && currentLoc) {
            const offsetLat = (activeTarget.name.length % 2 === 0) ? 0.008 : 0.004;
            const offsetLng = (activeTarget.name.length % 3 === 0) ? 0.008 : -0.004;
            const targetLat = currentLoc.lat + offsetLat;
            const targetLng = currentLoc.lng + offsetLng;

            const waypoints = [L.latLng(currentLoc.lat, currentLoc.lng), L.latLng(targetLat, targetLng)];

            try {
                const control = L.Routing.control({
                    waypoints,
                    router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: 'driving', language: 'tr' }),
                    lineOptions: {
                        styles: [{ color: '#00f3ff', opacity: 0.8, weight: 8, className: 'neon-polyline' }]
                    },
                    show: false,
                    addWaypoints: false,
                    routeWhileDragging: false,
                    fitSelectedRoutes: true,
                    containerClassName: 'hidden-routing-container'
                }).addTo(mapRef.current);

                control.on('routesfound', (e: any) => {
                    const r = e.routes[0];
                    if (r.coordinates) {
                        const simplePoints = r.coordinates.map((c: any) => ({ lat: c.lat, lng: c.lng }));
                        setDemoRoutePoints(simplePoints);
                        demoIndexRef.current = 0;
                    }
                    if (r.instructions && r.instructions.length > 0) {
                        setNextTurn({ text: translateInstruction(r.instructions[0].text), distance: r.instructions[0].distance, type: r.instructions[0].type, modifier: r.instructions[0].modifier });
                    }
                });

                routingControlRef.current = control;
            } catch (error) { console.error("Routing Error:", error); }
            return; // Exit if using dynamic routing
        }

        // 3. PRIORITY: Pre-defined Route (Turn-by-Turn Navigation)
        if (route) {
            // Prioritize path (array) over coordinates (which might be a single object)
            // Also ensure we handle the case where coordinates IS the array (legacy)
            let points: any[] = [];
            if (route.path && Array.isArray(route.path) && route.path.length > 0) {
                points = route.path;
            } else if (route.coordinates && Array.isArray(route.coordinates) && route.coordinates.length > 0) {
                points = route.coordinates;
            }

            if (points.length > 0) {
                // For OSRM navigation, we only need the key waypoints (Start and End), 
                // effectively recalculating the route to get turn-by-turn instructions.
                // We do NOT pass every point in the path as a waypoint, or OSRM will fail/choke.
                const start = points[0];
                const end = points[points.length - 1];
                const waypoints = [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)];

                console.log("Starting navigation with waypoints:", waypoints);

                try {
                    const control = L.Routing.control({
                        waypoints: waypoints,
                        router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: 'driving', language: 'tr' }),
                        lineOptions: {
                            styles: [{ color: '#E2FF3B', opacity: 0.8, weight: 8, className: 'neon-polyline' }]
                        },
                        show: false,
                        addWaypoints: false,
                        routeWhileDragging: false,
                        fitSelectedRoutes: true,
                        containerClassName: 'hidden-routing-container'
                    }).addTo(mapRef.current);

                    control.on('routesfound', (e: any) => {
                        const r = e.routes[0];
                        if (r.instructions && r.instructions.length > 0) {
                            setNextTurn({
                                text: translateInstruction(r.instructions[0].text),
                                distance: r.instructions[0].distance,
                                type: r.instructions[0].type,
                                modifier: r.instructions[0].modifier
                            });
                        }
                    });

                    control.on('routingerror', (e: any) => {
                        console.error("OSRM Routing Error:", e);
                        // Fallback: Just draw the polyline if OSRM fails
                        // Fallback: Just draw the polyline if OSRM fails
                        const polyline = L.polyline(points.map((p: any) => [p.lat, p.lng]), { color: '#E2FF3B', opacity: 0.8, weight: 8 }).addTo(mapRef.current);
                        mapRef.current.fitBounds(polyline.getBounds());
                    });

                    routingControlRef.current = control;
                } catch (e) {
                    console.error("Static Route Error", e);
                    // Fallback in catch
                    // Fallback in catch
                    const polyline = L.polyline(points.map((p: any) => [p.lat, p.lng]), { color: '#E2FF3B', opacity: 0.8, weight: 8 }).addTo(mapRef.current);
                    try { mapRef.current.fitBounds(polyline.getBounds()); } catch (ex) { }
                }
            }
        }

    }, [route, activeTarget]); // Removed currentLoc dependency to prevent redraw loops

    // Demo Loop
    useEffect(() => {
        let interval: any;
        if (isDemoMode && demoRoutePoints.length > 0) {
            setGpsStatus('active');
            if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);

            const freq = 100;

            interval = setInterval(() => {
                const pt = demoRoutePoints[demoIndexRef.current];
                const nextPt = demoRoutePoints[(demoIndexRef.current + 1) % demoRoutePoints.length];

                if (pt && nextPt) {
                    const bearing = calculateBearing(pt.lat, pt.lng, nextPt.lat, nextPt.lng);
                    const simulatedSpeed = 80 + Math.sin(Date.now() / 1000) * 10;

                    if (!isLowPowerMode) {
                        const lean = Math.sin(Date.now() / 800) * 25;
                        setLeanAngle(lean);
                    } else {
                        setLeanAngle(0);
                    }

                    updatePosition(pt.lat, pt.lng, simulatedSpeed, bearing);

                    const distDelta = (simulatedSpeed / 3600) * (freq / 1000);
                    setDistance(prev => prev + distDelta);

                    if (nextTurn) {
                        setNextTurn(prev => prev ? ({ ...prev, distance: Math.max(0, prev.distance - (distDelta * 1000)) }) : null);
                    }

                    demoIndexRef.current = (demoIndexRef.current + 1) % demoRoutePoints.length;
                }
            }, freq);
        } else if (!isDemoMode && isGpsEnabled) {
            setGpsStatus('searching');
        } else {
            if (!isGpsEnabled) setGpsStatus('off');
        }
        return () => clearInterval(interval);
    }, [isDemoMode, demoRoutePoints, isLowPowerMode]);

    // Quick Nav Handlers
    const handleQuickNavClick = (item: { label: string; dist: string }) => {
        setPendingNavChoice(item);
        setShowNav(false);
    };

    const handleGoogleNav = () => {
        if (!currentLoc) {
            alert("Konum bilgisi alınıyor... Lütfen GPS'in açık olduğundan emin olun.");
            return;
        }
        const targetLat = currentLoc.lat + 0.005;
        const targetLng = currentLoc.lng + 0.005;
        const url = `https://www.google.com/maps/dir/?api=1&destination=${targetLat},${targetLng}`;
        window.open(url, '_blank');
        setPendingNavChoice(null);
    };

    const handleInternalNav = () => {
        if (pendingNavChoice) {
            setActiveTarget({ name: pendingNavChoice.label, distance: 5, originalDistance: 5 });
            setPendingNavChoice(null);
        }
    };

    // --- GAUGE CALCULATIONS ---
    const MAX_RPM = 13000;
    const REDLINE_RPM = 11000;
    const rpmPercentage = Math.min(rpm / MAX_RPM, 1);

    // Bottom Dashboard Gauge
    const dashRadius = 36;
    const dashCircumference = 2 * Math.PI * dashRadius;
    const dashOffset = dashCircumference - (rpmPercentage * dashCircumference);

    return (
        <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col font-sans select-none overflow-hidden h-[100dvh]">

            {/* --- MAP BACKGROUND (Clean & Full) --- */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <div ref={mapContainerRef} className="w-full h-full brightness-[0.85] contrast-110 saturate-0" />
                {/* Tech Vignette */}
                <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.9)_100%)] z-10"></div>

                {/* HUD Grid Overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10" style={{
                    backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`,
                    backgroundSize: '100px 100px'
                }}></div>
            </div>

            {/* --- HIDDEN YOUTUBE --- */}
            <div id="youtube-player" className="absolute top-0 left-0 opacity-0 pointer-events-none" style={{ width: 1, height: 1 }}></div>

            {/* --- TOP HUD BAR (Compact Mobile) --- */}
            <div className="absolute top-0 left-0 right-0 h-16 pt-safe-top z-50 flex justify-between items-center px-4 pointer-events-none bg-gradient-to-b from-black/90 to-transparent">
                <div className="pointer-events-auto flex items-center gap-3">
                    <button
                        onClick={toggleGps}
                        className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${isGpsEnabled
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
                            : 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse'
                            }`}
                    >
                        {isGpsEnabled ? <Crosshair className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={() => setIsLowPowerMode(!isLowPowerMode)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-all ${isLowPowerMode ? 'bg-blue-500/20 text-blue-400' : 'bg-black/30 text-zinc-400'}`}
                    >
                        <Zap className="w-5 h-5" />
                    </button>

                    {/* Quick Nav Button (Moved for Mobile Visibility) */}
                    <button
                        onClick={() => setShowNav(!showNav)}
                        className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 bg-black/30 text-cyan-400 hover:bg-cyan-500/20 hover:text-cyan-300 transition-all"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 top-4 flex flex-col items-center">
                    <span className="text-xl font-display font-black text-white/90 tracking-wider">
                        {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <div className="pointer-events-auto">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-10 h-10 rounded-full bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white transition-all backdrop-blur-md flex items-center justify-center"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* --- CENTER HUD INFO (Compact Dynamic Island Style) --- */}
            <div className="absolute top-20 left-0 right-0 z-40 pointer-events-none px-4 flex justify-center w-full">
                <div className="flex flex-col items-center w-full max-w-sm">
                    {/* Dynamic Active Target */}
                    {activeTarget && (
                        <div className="bg-black/80 backdrop-blur-xl border border-cyan-500/30 px-6 py-3 rounded-full border-b-2 border-b-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.1)] flex items-center justify-between w-full mb-2">
                            <div className="flex flex-col">
                                <span className="text-cyan-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
                                    HEDEF
                                </span>
                                <span className="text-white font-bold truncate max-w-[150px]">{activeTarget.name}</span>
                            </div>
                            <div className="text-xl font-mono text-cyan-200">
                                {(activeTarget.distance).toFixed(1)} <span className="text-xs">km</span>
                            </div>
                        </div>
                    )}

                    {nextTurn && (
                        <div className="bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-3 rounded-2xl shadow-2xl animate-in slide-in-from-top-4 w-full flex items-center gap-4">
                            <div className="w-12 h-12 bg-[#E2FF3B] rounded-xl flex items-center justify-center shrink-0">
                                <ArrowRight className="w-6 h-6 text-black" strokeWidth={3} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-3xl font-black text-white leading-none">
                                    {nextTurn.distance > 1000 ? (nextTurn.distance / 1000).toFixed(1) + ' km' : Math.round(nextTurn.distance) + ' m'}
                                </div>
                                <div className="text-zinc-400 font-medium text-sm truncate leading-tight mt-0.5">{nextTurn.text}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* --- BOTTOM DASHBOARD --- */}
            <div className="absolute bottom-0 left-0 right-0 z-50">

                {/* --- MUSIC PLAYER WIDGET (Compact & Clean) --- */}
                {
                    playlist.length > 0 && (
                        <div className="absolute bottom-40 left-8 z-50 pointer-events-auto">
                            <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 hover:bg-black/60 transition-colors w-[300px] overflow-hidden group">
                                <div className="w-12 h-12 bg-zinc-800 rounded-lg overflow-hidden relative flex-shrink-0">
                                    {playlist[currentTrackIndex]?.thumbnail ? (
                                        <img src={playlist[currentTrackIndex].thumbnail} className="w-full h-full object-cover opacity-80" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-zinc-800"><div className="w-3 h-3 bg-white/20 rounded-full animate-bounce"></div></div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        {isPlaying ? <div className="flex gap-[2px] items-end h-4 pb-1"><div className="w-1 h-3 bg-[#E2FF3B] animate-pulse"></div><div className="w-1 h-2 bg-[#E2FF3B] animate-pulse delay-75"></div><div className="w-1 h-4 bg-[#E2FF3B] animate-pulse delay-150"></div></div> : <PlayCircle className="w-6 h-6 text-white/50" />}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-bold truncate text-sm leading-tight mb-0.5">{playlist[currentTrackIndex]?.title}</div>
                                    <div className="text-zinc-400 text-xs truncate font-medium">{playlist[currentTrackIndex]?.artist || 'Bilinmeyen Sanatçı'}</div>
                                </div>
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
                                    <button onClick={handlePrevSong} className="p-2 hover:text-white text-zinc-400 transition-colors"><SkipBack size={16} /></button>
                                    <button onClick={togglePlay} className="p-2 hover:text-white text-white transition-colors">{isPlaying ? <Pause size={18} /> : <Play size={18} />}</button>
                                    <button onClick={handleNextSong} className="p-2 hover:text-white text-zinc-400 transition-colors"><SkipForward size={16} /></button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* --- MAIN DASHBOARD CLUSTER --- */}
                <div className="relative flex items-end justify-center pb-8 px-8 gap-12 bg-gradient-to-t from-black via-black/90 to-transparent pt-32">

                    {/* Left Stats: Distance & Trip */}
                    <div className="hidden md:flex flex-col items-end gap-2 text-right opacity-80 w-32">
                        <div>
                            <div className="text-3xl font-display font-black text-white tracking-tight">{distance.toFixed(1)}</div>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">TRIP KM</div>
                        </div>
                        <div className="h-px w-full bg-white/10 my-1"></div>
                        <div>
                            <div className="text-xl font-mono text-zinc-300">{route ? (route.distance || '--') : '--'}</div>
                            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">TOTAL</div>
                        </div>
                    </div>

                    {/* CENTER GAUGE (The Core) */}
                    <div className="relative group cursor-pointer" onClick={() => setShowTelemetry(!showTelemetry)}>
                        {/* Outer Glow */}
                        <div className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-40 bg-[#E2FF3B]/20 blur-[100px] rounded-full transition-opacity duration-500 ${rpm > REDLINE_RPM ? 'opacity-100 bg-red-500/30' : 'opacity-40'}`}></div>

                        <div className="relative">
                            <span className="text-[120px] md:text-[160px] leading-[0.8] font-black italic tracking-tighter text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] tabular-nums relative z-20 font-display block text-center min-w-[200px] md:min-w-[280px]">
                                {Math.floor(speed)}
                            </span>
                            <span className="absolute -right-2 md:-right-4 top-2 md:top-4 text-sm md:text-xl font-bold text-zinc-500 rotate-12">KMH</span>
                        </div>

                        {/* RPM Bar (Minimalist Line) */}
                        <div className="w-[400px] h-2 bg-zinc-900 rounded-full mt-4 overflow-hidden relative border border-white/5 mx-auto">
                            {/* Gradient Bar */}
                            <div
                                className={`h-full transition-all duration-100 ease-out ${rpm > REDLINE_RPM ? 'bg-red-500 shadow-[0_0_15px_#ef4444]' : 'bg-gradient-to-r from-zinc-700 via-white to-[#E2FF3B]'}`}
                                style={{ width: `${(rpm / MAX_RPM) * 100}%` }}
                            ></div>
                            {/* Markers */}
                            <div className="absolute inset-0 flex justify-between px-[10%]">
                                {[...Array(9)].map((_, i) => (
                                    <div key={i} className={`w-0.5 h-full ${i > 6 ? 'bg-red-500/50' : 'bg-black/30'}`}></div>
                                ))}
                            </div>
                        </div>

                        {/* Gear Indicator & RPM Text */}
                        <div className="flex justify-center items-center gap-6 mt-2 opacity-80">
                            <div className="text-xs text-zinc-500 font-mono">{rpm} RPM</div>
                            <div className={`w-10 h-10 flex items-center justify-center rounded-lg font-black text-xl border ${gear === 'N' ? 'border-green-500/30 text-green-500 bg-green-500/10' : 'border-white/10 bg-white/5 text-white'}`}>
                                {gear}
                            </div>
                            <div className="text-xs text-zinc-500 font-mono">GEAR</div>
                        </div>
                    </div>

                    {/* Right Stats: Env & Buttons */}
                    <div className="hidden md:flex flex-col items-start gap-4 w-32">
                        {/* Quick Nav Button */}
                        {/* Quick Nav Button REMOVED HERE - MOVED TO TOP BAR FOR MOBILE */}

                        <div className="space-y-2 opacity-80">
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Thermometer className="w-4 h-4" />
                                <span className="font-mono text-sm">24°C</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400">
                                <Mountain className="w-4 h-4" />
                                <span className="font-mono text-sm">{telemetry.altitude}m</span>
                            </div>
                        </div>
                    </div>

                </div>
            </div >

            {/* --- MODALS / OVERLAYS --- */}

            {/* Quick Nav Modal */}
            {
                showNav && (
                    <div className="absolute inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center pointer-events-auto p-4 animate-in fade-in zoom-in-95" onClick={() => setShowNav(false)}>
                        <div className="bg-[#121212] border border-white/10 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-white/5">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Crosshair className="text-cyan-400" />
                                    Hızlı Rota
                                </h3>
                                <p className="text-zinc-500 text-xs mt-1">Gitmek istediğiniz yeri seçin</p>
                            </div>
                            <div className="p-2 space-y-1">
                                {[
                                    { label: 'En Yakın Benzinlik', dist: '2.4 km', icon: '⛽' },
                                    { label: 'Dinlenme Tesisi', dist: '15 km', icon: '☕' },
                                    { label: 'Servis Noktası', dist: '8.2 km', icon: '🔧' },
                                    { label: 'Hastane', dist: '4.5 km', icon: '🏥' },
                                    { label: 'Arkadaşım (Ahmet)', dist: '12 km', icon: '👤' }
                                ].map((item, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickNavClick(item)}
                                        className="w-full text-left p-4 rounded-xl hover:bg-white/5 active:bg-white/10 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-2xl grayscale group-hover:grayscale-0 transition-all">{item.icon}</span>
                                            <div>
                                                <div className="text-white font-bold text-sm">{item.label}</div>
                                                <div className="text-zinc-500 text-xs">{item.dist}</div>
                                            </div>
                                        </div>
                                        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-zinc-500 group-hover:border-cyan-500/50 group-hover:text-cyan-400">
                                            <ArrowRight size={14} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Nav Confirmation Dialog */}
            {
                pendingNavChoice && (
                    <div className="absolute bottom-32 left-1/2 -translate-x-1/2 min-w-[320px] bg-[#1a1a1c] border border-white/10 p-5 rounded-2xl shadow-2xl z-[70] animate-in slide-in-from-bottom-10 pointer-events-auto">
                        <div className="text-center mb-6">
                            <div className="w-12 h-12 bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mx-auto mb-3">
                                <Navigation size={24} />
                            </div>
                            <div className="text-lg font-bold text-white mb-1">Rotayı Başlat?</div>
                            <div className="text-zinc-400 text-sm">Hedef: <span className="text-white font-bold">{pendingNavChoice.label}</span></div>
                            <div className="text-zinc-500 text-xs mt-1">{pendingNavChoice.dist} mesafe</div>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleInternalNav}
                                className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-3 rounded-xl font-bold text-sm transition-colors"
                            >
                                Dahili Nav
                            </button>
                            <button
                                onClick={handleGoogleNav}
                                className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                            >
                                Google Maps <ExternalLink size={12} />
                            </button>
                        </div>
                        <button onClick={() => setPendingNavChoice(null)} className="absolute top-2 right-2 p-2 text-zinc-500 hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                )
            }

            {/* Demo Mode Overlay (Optional Debug) */}
            {
                isDemoMode && (
                    <div className="absolute top-24 right-4 bg-red-500/20 border border-red-500/50 px-3 py-1 rounded text-red-400 text-[10px] font-bold tracking-wider animate-pulse pointer-events-none z-50">
                        DEMO MODE
                    </div>
                )
            }

        </div >
    );
};