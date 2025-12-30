import React, { useState, useEffect, useRef } from 'react';
import { X, Navigation, PlayCircle, Pause, SkipForward, SkipBack, MapPin, Thermometer, Gauge, Mountain, Activity, TrendingUp, Move, ExternalLink, ArrowRight, Crosshair, Power, Zap, Play } from 'lucide-react';
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
    const [gpsStatus, setGpsStatus] = useState<'active' | 'searching' | 'off'>('off');
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
            // If a route is present, center on its start, otherwise default
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

            // MODERN DARK MAP (CartoDB Dark Matter)
            tileLayerRef.current = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; CARTO',
                maxZoom: 20,
                subdomains: 'abcd'
            }).addTo(map);

            mapRef.current = map;

            // Initial Rider Marker
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
            .neon-polyline { filter: drop-shadow(0 0 6px #F2A619); }
            .trail-polyline { filter: drop-shadow(0 0 4px #00f3ff); opacity: 0.8 !important; }
            .leaflet-container { background: #111 !important; }
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
                <div class="absolute w-16 h-16 bg-moto-accent/20 rounded-full animate-ping opacity-50"></div>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 0 10px #F2A619);">
                    <path d="M12 2L4.5 20.29C4.21 21.01 4.96 21.72 5.67 21.37L12 18.25L18.33 21.37C19.04 21.72 19.79 21.01 19.5 20.29L12 2Z" fill="#F2A619" stroke="white" stroke-width="2" stroke-linejoin="round"/>
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

    const hasInitialPanRef = useRef(false);

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
                    router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: 'driving' }),
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
                        setNextTurn({ text: r.instructions[0].text, distance: r.instructions[0].distance, type: r.instructions[0].type, modifier: r.instructions[0].modifier });
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
                        router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: 'driving' }),
                        lineOptions: {
                            styles: [{ color: '#F2A619', opacity: 0.8, weight: 8, className: 'neon-polyline' }]
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
                                text: r.instructions[0].text,
                                distance: r.instructions[0].distance,
                                type: r.instructions[0].type,
                                modifier: r.instructions[0].modifier
                            });
                        }
                    });

                    control.on('routingerror', (e: any) => {
                        console.error("OSRM Routing Error:", e);
                        // Fallback: Just draw the polyline if OSRM fails
                        const polyline = L.polyline(points.map((p: any) => [p.lat, p.lng]), { color: '#F2A619', opacity: 0.8, weight: 8 }).addTo(mapRef.current);
                        mapRef.current.fitBounds(polyline.getBounds());
                    });

                    routingControlRef.current = control;
                } catch (e) {
                    console.error("Static Route Error", e);
                    // Fallback in catch
                    const polyline = L.polyline(points.map((p: any) => [p.lat, p.lng]), { color: '#F2A619', opacity: 0.8, weight: 8 }).addTo(mapRef.current);
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

            {/* --- TOP HUD BAR --- */}
            <div className="absolute top-0 left-0 right-0 h-24 z-50 flex justify-between items-start px-8 pt-6 pointer-events-none bg-gradient-to-b from-black/90 to-transparent">
                <div className="pointer-events-auto flex items-center gap-4">
                    <button
                        onClick={toggleGps}
                        className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all ${isGpsEnabled
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                            : 'bg-red-500/10 text-red-500 border-red-500/30 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                            }`}
                    >
                        {isGpsEnabled ? <Crosshair className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                    </button>

                    <button
                        onClick={() => setIsLowPowerMode(!isLowPowerMode)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md border border-white/10 transition-all ${isLowPowerMode ? 'bg-blue-500/20 text-blue-400' : 'bg-black/30 text-zinc-400'}`}
                    >
                        <Zap className="w-5 h-5" />
                    </button>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 top-6 flex flex-col items-center">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-display font-black text-white/90 tracking-wider">
                            {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                <div className="pointer-events-auto">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-12 h-12 rounded-full bg-red-600/10 border border-red-500/30 text-red-500 hover:bg-red-600 hover:text-white transition-all backdrop-blur-md flex items-center justify-center"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* --- GPS ALERT --- */}
            {!isGpsEnabled && !isDemoMode && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <div className="relative overflow-hidden flex flex-col items-center gap-6 p-10 bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl text-center max-w-sm mx-4">
                        <div className="absolute inset-0 bg-moto-accent/5 pointer-events-none"></div>
                        <div className="w-20 h-20 bg-moto-accent/10 rounded-full flex items-center justify-center animate-bounce">
                            <Navigation className="w-10 h-10 text-moto-accent" />
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-wide">Sinyal Yok</h3>
                            <p className="text-zinc-400 text-sm">Sürüş takibi ve hız verileri için GPS erişimine izin verin.</p>
                        </div>
                        <button onClick={toggleGps} className="w-full py-4 bg-moto-accent text-black font-black uppercase tracking-wider rounded-xl hover:bg-white transition-colors">GPS Aktifleştir</button>
                    </div>
                </div>
            )}

            {/* --- NAV INSTRUCTIONS --- */}
            {navMessage && (
                <div className="absolute top-28 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-full max-w-md px-6 flex justify-center">
                    <div className="bg-black/80 backdrop-blur-xl border border-white/10 px-6 py-2 rounded-full shadow-2xl flex items-center gap-3">
                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_#10b981]"></div>
                        <span className="text-xs font-bold uppercase tracking-widest text-white/80 truncate">{navMessage}</span>
                    </div>
                </div>
            )}

            {/* --- TURN BY TURN --- */}
            {nextTurn && (
                <div className="absolute top-40 left-6 z-40">
                    <div className="bg-black/80 backdrop-blur-xl border-l-[6px] border-moto-accent rounded-r-2xl p-6 shadow-2xl min-w-[200px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Navigation className="w-24 h-24 text-white" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-black text-white tracking-tighter">
                                    {nextTurn.distance > 1000 ? (nextTurn.distance / 1000).toFixed(1) : Math.round(nextTurn.distance)}
                                </span>
                                <span className="text-lg font-bold text-zinc-400">{nextTurn.distance > 1000 ? 'KM' : 'M'}</span>
                            </div>
                            <div className="mt-2 text-sm font-bold text-white/90 uppercase tracking-wider max-w-[160px] leading-tight">
                                {nextTurn.text}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- TELEMETRY TOGGLE --- */}
            <div className="absolute top-40 right-6 z-40 pointer-events-auto text-right space-y-4">
                <button
                    onClick={() => setShowTelemetry(!showTelemetry)}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md border transition-all shadow-lg ${showTelemetry ? 'bg-white text-black border-white' : 'bg-black/40 text-white/50 border-white/5 hover:bg-black/60 hover:text-white'}`}
                >
                    <Activity className="w-6 h-6" />
                </button>
            </div>

            {/* --- TELEMETRY PANEL --- */}
            <div className={`absolute top-56 right-6 w-40 z-40 transition-all duration-500 ease-out transform ${showTelemetry ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col gap-3">
                    <div className="bg-black/80 backdrop-blur-md border-l-2 border-moto-accent rounded-r-xl p-3 shadow-lg">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">G-Force</span>
                            <Move className="w-3 h-3 text-moto-accent" />
                        </div>
                        <div className="text-xl font-mono font-bold text-white">{telemetry.gForce.toFixed(1)} <span className="text-xs text-zinc-500">G</span></div>
                    </div>

                    <div className="bg-black/80 backdrop-blur-md border-l-2 border-blue-500 rounded-r-xl p-3 shadow-lg">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">Rakım</span>
                            <Mountain className="w-3 h-3 text-blue-500" />
                        </div>
                        <div className="text-xl font-mono font-bold text-white">{Math.round(telemetry.altitude)} <span className="text-xs text-zinc-500">M</span></div>
                    </div>

                    <div className="bg-black/80 backdrop-blur-md border-l-2 border-purple-500 rounded-r-xl p-3 shadow-lg">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase">Eğim</span>
                            <TrendingUp className="w-3 h-3 text-purple-500" />
                        </div>
                        <div className="text-xl font-mono font-bold text-white">{isLowPowerMode ? '0' : Math.round(leanAngle)}°</div>
                    </div>
                </div>
            </div>

            {/* --- TFT DASHBOARD (Bottom) --- */}
            <div className="absolute bottom-8 left-6 right-6 z-50 pointer-events-auto">
                <div className="relative bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-2 shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">

                    {/* Gloss Effect */}
                    <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none"></div>

                    <div className="flex items-center gap-2 relative z-10">

                        {/* 1. SPEED & RPM (Digital Cluster) */}
                        <div className="bg-black/60 rounded-[2rem] p-4 pr-8 border border-white/5 flex items-center gap-6 min-w-[280px]">
                            {/* RPM Circle with Shader-like gradient */}
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_10px_rgba(242,166,25,0.3)]" viewBox="0 0 100 100">
                                    {/* Track */}
                                    <circle cx="50" cy="50" r="42" fill="none" stroke="#222" strokeWidth="8" />
                                    {/* Fill */}
                                    <circle
                                        cx="50" cy="50" r="42" fill="none"
                                        stroke="url(#rpmGradient)"
                                        strokeWidth="8"
                                        strokeDasharray={2 * Math.PI * 42}
                                        strokeDashoffset={(2 * Math.PI * 42) * (1 - rpmPercentage)}
                                        strokeLinecap="round"
                                        className="transition-all duration-100 ease-linear"
                                    />
                                    <defs>
                                        <linearGradient id="rpmGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#F2A619" />
                                            <stop offset="80%" stopColor="#F2A619" />
                                            <stop offset="100%" stopColor="#ef4444" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                <div className="absolute flex flex-col items-center">
                                    <span className="text-4xl font-display font-black text-white tracking-tighter leading-none">{Math.floor(speed)}</span>
                                    <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">KM/H</span>
                                </div>
                            </div>

                            {/* Gear & Stats */}
                            <div className="flex flex-col gap-2">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black font-display border shadow-inner ${gear === 'N' ? 'bg-emerald-900/40 text-emerald-400 border-emerald-500/30 shadow-emerald-900/20' : 'bg-zinc-800 text-white border-white/10'}`}>
                                    {gear}
                                </div>
                                <div className="text-[10px] font-mono text-zinc-500">
                                    {rpm} <span className="text-zinc-700">RPM</span>
                                </div>
                            </div>
                        </div>

                        {/* 2. MEDIA & INFO CENTER */}
                        <div className="flex-1 bg-black/40 rounded-[2rem] border border-white/5 h-32 flex items-center px-6 justify-between relative overflow-hidden group">
                            {/* BG Visualizer */}
                            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-moto-accent/10 to-transparent opacity-30"></div>

                            <div className="flex items-center gap-4 z-10 w-full">
                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/10 shrink-0">
                                    {isPlaying ? (
                                        <div className="flex gap-1 items-end h-5">
                                            <span className="w-1 bg-moto-accent/80 animate-[bounce_1s_infinite] h-3 rounded-full"></span>
                                            <span className="w-1 bg-moto-accent animate-[bounce_1.2s_infinite] h-5 rounded-full"></span>
                                            <span className="w-1 bg-moto-accent/80 animate-[bounce_0.8s_infinite] h-2 rounded-full"></span>
                                        </div>
                                    ) : (
                                        <PlayCircle className="w-6 h-6 text-zinc-600" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-white font-bold truncate text-base">{playlist[currentTrackIndex]?.title || 'MotoVibe Player'}</h4>
                                    <p className="text-zinc-500 text-xs truncate">{playlist[currentTrackIndex]?.artist || 'Sürüş için hazır'}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={togglePlay} className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform active:scale-95">
                                        {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                                    </button>
                                    <button onClick={handleNextSong} className="w-10 h-10 rounded-full bg-zinc-800 text-white flex items-center justify-center hover:bg-zinc-700 transition-colors">
                                        <SkipForward className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* 3. QUICK NAV BTN */}
                        <button
                            onClick={() => setShowNav(true)}
                            className="h-32 w-20 bg-zinc-900/80 rounded-[2rem] border border-white/5 hover:border-moto-accent/50 flex flex-col items-center justify-center gap-2 hover:bg-zinc-800 transition-all hover:-translate-y-1 active:scale-95"
                        >
                            <Navigation className="w-6 h-6 text-white" />
                            <span className="text-[9px] font-bold text-zinc-500 uppercase rotate-[-90deg]">ROTA</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- NAV MODAL (Full Screen Overlay) --- */}
            {showNav && (
                <div className="absolute inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-8 animate-in zoom-in-95 duration-300 pointer-events-auto">
                    <h2 className="text-5xl font-display font-black text-white mb-16 tracking-tighter italic">HIZLI <span className="text-moto-accent">ROTA</span></h2>

                    <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
                        {[
                            { icon: MapPin, label: 'En Yakın Benzinlik', dist: '2.4 KM' },
                            { icon: Thermometer, label: 'Mola Yeri', dist: '12 KM' },
                            { icon: Gauge, label: 'Tamirhane', dist: '8 KM' },
                            { icon: Navigation, label: 'Eve Dön', dist: '45 KM' },
                        ].map((item, i) => (
                            <button key={i} onClick={() => handleQuickNavClick({ label: item.label, dist: item.dist })} className="group relative overflow-hidden bg-zinc-900 border border-white/5 p-8 rounded-3xl flex flex-col items-center gap-4 transition-all hover:border-moto-accent/50 active:scale-95">
                                <div className="absolute inset-0 bg-moto-accent/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                                <item.icon className="w-12 h-12 text-zinc-500 group-hover:text-moto-accent transition-colors relative z-10" />
                                <div className="text-center relative z-10">
                                    <span className="block font-bold text-white text-xl mb-1">{item.label}</span>
                                    <span className="text-sm text-zinc-500 font-mono group-hover:text-white/60 transition-colors">{item.dist}</span>
                                </div>
                            </button>
                        ))}
                    </div>

                    <button onClick={() => setShowNav(false)} className="mt-16 w-20 h-20 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white hover:border-white hover:scale-110 flex items-center justify-center transition-all">
                        <X className="w-8 h-8" />
                    </button>
                </div>
            )}

            {/* --- CONFIRMATION DIALOGS --- */}
            {pendingNavChoice && (
                <div className="absolute inset-0 z-[250] bg-black/90 backdrop-blur-xl flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
                    <div className="bg-zinc-900 border border-moto-accent/30 rounded-[2.5rem] p-10 max-w-sm w-full shadow-[0_0_50px_rgba(242,166,25,0.1)] relative text-center">
                        <button onClick={() => setPendingNavChoice(null)} className="absolute top-6 right-6 text-zinc-500 hover:text-white"><X className="w-6 h-6" /></button>
                        <h3 className="text-3xl font-display font-black text-white mb-2 italic tracking-tight">{pendingNavChoice.label}</h3>
                        <p className="text-zinc-400 text-sm mb-10">Rotayı nasıl başlatmak istersin?</p>

                        <div className="flex flex-col gap-4">
                            <button onClick={handleInternalNav} className="w-full py-5 bg-moto-accent hover:bg-white text-black font-black uppercase tracking-wider rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-moto-accent/20">
                                <Navigation className="w-5 h-5" /> MotoVibe Nav
                            </button>
                            <button onClick={handleGoogleNav} className="w-full py-5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all">
                                <MapPin className="w-5 h-5 text-zinc-400" /> Google Maps
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};