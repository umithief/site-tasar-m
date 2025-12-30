import React, { useState, useEffect, useRef } from 'react';
import { X, Navigation, PlayCircle, Pause, SkipForward, SkipBack, MapPin, Thermometer, Gauge, Mountain, Activity, TrendingUp, Move, ExternalLink, ArrowRight, Crosshair, Power } from 'lucide-react';
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
            updateMarkerIcon();
            markerRef.current = L.marker(initialCenter, {
                icon: L.divIcon({ className: 'dummy' }), // Placeholder
                zIndexOffset: 1000
            }).addTo(map);

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

    // --- OPTIMIZED POSITION UPDATE ---
    const updatePosition = (lat: number, lng: number, newSpeed: number, newHeading: number) => {
        const now = Date.now();
        prevSpeedRef.current = newSpeed;

        // Map Update
        if (now - lastMapUpdateRef.current > 50) {
            if (mapRef.current) {
                // Only auto-pan if NOT exploring a route (user dragging)
                // For simplicity, we pan if speed > 5 km/h or demo mode
                if (newSpeed > 5 || isDemoMode) {
                    mapRef.current.setView([lat, lng], mapRef.current.getZoom(), { animate: true, duration: 0.5 });
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
            const points = route.coordinates || route.path;

            if (points && points.length > 0) {
                // If it's a single point (marker only), just show marker? 
                // But for "Ride Mode", we assume a path.
                // If we want actual NAVIGATION, we need to pass these points to the router.

                const waypoints = points.map(p => L.latLng(p.lat, p.lng));

                // If user is at a different location, maybe add current location as start?
                // For now, let's navigate the specific route path itself.
                // Or, if currentLoc exists, route FROM currentLoc TO start of route, then along route?
                // Complex. Let's stick to: "Navigate along this route". 
                // OSRM can take multiple waypoints.

                try {
                    const control = L.Routing.control({
                        waypoints: waypoints,
                        router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1', profile: 'driving' }),
                        lineOptions: {
                            styles: [{ color: '#F2A619', opacity: 0.8, weight: 8, className: 'neon-polyline' }]
                        },
                        show: false, // Turn off default panel to use our custom UI
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

                    routingControlRef.current = control;
                } catch (e) { console.error("Static Route Error", e); }
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
                <div ref={mapContainerRef} className="w-full h-full brightness-[0.8] contrast-110" />
                {/* Subtle vignette for UI readability */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/90 to-transparent pointer-events-none z-10"></div>
                <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/95 via-black/80 to-transparent pointer-events-none z-10"></div>
            </div>

            {/* --- HIDDEN YOUTUBE --- */}
            <div id="youtube-player" className="absolute top-0 left-0 opacity-0 pointer-events-none" style={{ width: 1, height: 1 }}></div>

            {/* --- COMPACT TOP BAR (Transparent) --- */}
            <div className="absolute top-0 left-0 right-0 h-20 z-50 flex justify-between items-start px-6 pt-safe-top pointer-events-none">
                <div className="pointer-events-auto mt-2">
                    <button
                        onClick={toggleGps}
                        className={`w-10 h-10 btn-icon-glass ${isGpsEnabled
                            ? 'bg-[#1A1A17]/80 text-green-500 border-green-500/30'
                            : 'bg-red-900/60 text-white border-red-500/50 animate-pulse'
                            }`}
                    >
                        {isGpsEnabled ? <Crosshair className="w-5 h-5" /> : <Power className="w-5 h-5" />}
                    </button>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 top-safe-top mt-3">
                    <span className="text-xl font-display font-bold text-white tracking-widest drop-shadow-md opacity-90">
                        {time.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>

                <div className="pointer-events-auto mt-2">
                    <button
                        onClick={() => onNavigate('home')}
                        className="w-10 h-10 btn-icon-glass text-white/70 hover:bg-red-600 hover:text-white hover:border-red-500"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* --- GPS OVERLAY --- */}
            {!isGpsEnabled && !isDemoMode && (
                <div className="absolute inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md">
                    <div className="flex flex-col items-center gap-6 p-8 bg-[#1A1A17] border border-moto-accent/30 rounded-3xl shadow-2xl text-center max-w-xs mx-4">
                        <Navigation className="w-12 h-12 text-moto-accent animate-bounce" />
                        <h3 className="text-xl font-bold text-white">GPS Gerekli</h3>
                        <div className="flex flex-col gap-3 w-full">
                            <button onClick={toggleGps} className="w-full py-3 bg-moto-accent text-black font-bold rounded-xl active:scale-95">GPS AÇ</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- NAV MESSAGE (Compact Pill) --- */}
            {navMessage && (
                <div className="absolute top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none w-full px-4 flex justify-center">
                    <div className="bg-[#1A1A17]/90 backdrop-blur-md border border-moto-accent/30 px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-in slide-in-from-top-2">
                        <div className="w-1.5 h-1.5 bg-moto-accent rounded-full animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/90 truncate max-w-[200px]">{navMessage}</span>
                    </div>
                </div>
            )}

            {/* --- LEFT: TURN INSTRUCTION (Compact) --- */}
            {nextTurn && (
                <div className="absolute top-32 left-4 z-40 bg-[#1A1A17]/90 backdrop-blur-lg border-l-4 border-moto-accent rounded-r-xl p-4 shadow-xl max-w-[160px] animate-in slide-in-from-left-4">
                    <div className="text-3xl font-display font-bold text-white leading-none">
                        {nextTurn.distance > 1000 ? (nextTurn.distance / 1000).toFixed(1) : Math.round(nextTurn.distance)}
                        <span className="text-sm text-gray-400 ml-1 font-sans">{nextTurn.distance > 1000 ? 'km' : 'm'}</span>
                    </div>
                    <div className="text-xs text-gray-300 font-bold mt-1 uppercase leading-tight line-clamp-2">{nextTurn.text}</div>
                    <Navigation className="w-8 h-8 text-white/10 absolute top-2 right-2" />
                </div>
            )}

            {/* --- RIGHT: TELEMETRY ICONS (Compact) --- */}
            <div className="absolute top-32 right-4 z-40 flex flex-col gap-3 pointer-events-auto">
                {!isDemoMode && (route || activeTarget) && (
                    null
                )}
                <button
                    onClick={() => setShowTelemetry(!showTelemetry)}
                    className={`w-10 h-10 btn-icon-glass ${showTelemetry ? 'bg-white text-black border-white' : 'text-gray-400'}`}
                >
                    <Activity className="w-5 h-5" />
                </button>
            </div>

            {/* --- TELEMETRY DATA (Right Side) --- */}
            <div className={`absolute top-56 right-4 w-32 z-40 transition-all duration-300 transform ${showTelemetry ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col gap-2">
                    {[
                        { label: 'G-Force', val: telemetry.gForce.toFixed(1), unit: 'G', icon: Move, color: 'text-moto-accent', border: 'border-moto-accent' },
                        { label: 'Rakım', val: Math.round(telemetry.altitude), unit: 'm', icon: Mountain, color: 'text-blue-500', border: 'border-blue-500' },
                    ].map((item, i) => (
                        <div key={i} className={`bg-[#1A1A17]/80 backdrop-blur-md border-l-2 ${item.border} rounded-r-lg p-2 shadow-lg`}>
                            <div className="flex items-center gap-2">
                                <item.icon className={`w-3 h-3 ${item.color}`} />
                                <span className="text-sm font-mono font-bold text-white">{item.val}<span className="text-[9px] text-gray-500 ml-0.5">{item.unit}</span></span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- CONSOLIDATED BOTTOM DASHBOARD --- */}
            <div className="absolute bottom-6 left-4 right-4 z-50 pointer-events-auto">
                <div className="bg-[#111]/95 backdrop-blur-xl border border-white/10 rounded-[2rem] p-1.5 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex items-center justify-between min-h-[5.5rem]">

                    {/* 1. SPEED & RPM CLUSTER (Left) */}
                    <div className="flex items-center gap-1 pl-2 pr-4 border-r border-white/5">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                            {/* RPM Ring */}
                            <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 80 80">
                                <circle cx="40" cy="40" r={dashRadius} fill="none" stroke="#222" strokeWidth="6" />
                                <circle
                                    cx="40" cy="40" r={dashRadius} fill="none"
                                    stroke={rpm > REDLINE_RPM ? '#ef4444' : '#F2A619'}
                                    strokeWidth="6"
                                    strokeDasharray={dashCircumference}
                                    strokeDashoffset={dashOffset}
                                    strokeLinecap="round"
                                    className="transition-all duration-100 ease-linear"
                                />
                            </svg>
                            {/* Speed Value */}
                            <div className="flex flex-col items-center">
                                <span className="text-3xl font-display font-black text-white leading-none tracking-tighter">{Math.floor(speed)}</span>
                                <span className="text-[8px] font-bold text-gray-500">KMH</span>
                            </div>
                        </div>

                        {/* Gear */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl font-black font-display border overflow-hidden ${gear === 'N' ? 'bg-green-900/40 text-green-400 border-green-500/30' : 'bg-white/5 text-white border-white/10'}`}>
                            {gear}
                        </div>
                    </div>

                    {/* 2. MUSIC CONTROL (Center-Right Expansive) */}
                    <div className="flex-1 flex items-center justify-between px-3 min-w-0">
                        <div className="flex flex-col min-w-0 mr-2">
                            <span className="text-xs font-bold text-white truncate leading-tight">{playlist.length > 0 ? playlist[currentTrackIndex].title : 'MOTOVIBE'}</span>
                            <span className="text-[10px] font-medium text-moto-accent truncate">{playlist.length > 0 ? playlist[currentTrackIndex].artist : 'Ready'}</span>
                        </div>

                        <div className="flex items-center gap-1">
                            <button onClick={togglePlay} className="w-12 h-12 btn-primary rounded-full flex items-center justify-center p-0">
                                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <PlayCircle className="w-5 h-5 fill-current ml-0.5" />}
                            </button>
                            <button onClick={handleNextSong} className="w-10 h-10 btn-icon-glass text-gray-400 !border-0 bg-transparent hover:bg-white/10">
                                <SkipForward className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* 3. QUICK ACTIONS (Far Right) */}
                    <div className="pl-2 border-l border-white/5">
                        <button onClick={() => setShowNav(true)} className="w-14 h-14 btn-glass p-0 flex flex-col items-center justify-center gap-0.5 text-gray-400 hover:text-moto-accent !bg-[#222]">
                            <Navigation className="w-5 h-5" />
                            <span className="text-[8px] font-bold uppercase">ROTA</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* --- NAV MODAL (Quick Actions) --- */}
            {showNav && (
                <div className="absolute inset-0 z-[200] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-300 pointer-events-auto">
                    <h2 className="text-4xl font-display font-black text-white mb-10 tracking-tight italic">HIZLI <span className="text-moto-accent">ROTA</span></h2>
                    <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                        {[
                            { icon: MapPin, label: 'Benzinlik', dist: '2.4km' },
                            { icon: Thermometer, label: 'Mola Yeri', dist: '12km' },
                            { icon: Gauge, label: 'Servis', dist: '8km' },
                            { icon: Navigation, label: 'Eve Dön', dist: '45km' },
                        ].map((item, i) => (
                            <button key={i} onClick={() => handleQuickNavClick(item)} className="bg-[#1A1A17] border border-white/10 hover:border-moto-accent p-6 rounded-3xl flex flex-col items-center gap-3 transition-all active:scale-95 group">
                                <item.icon className="w-10 h-10 text-gray-500 group-hover:text-moto-accent transition-colors" />
                                <div className="text-center">
                                    <span className="block font-bold text-white text-lg">{item.label}</span>
                                    <span className="text-sm text-gray-500 font-mono">{item.dist}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                    <button onClick={() => setShowNav(false)} className="mt-12 w-20 h-20 rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-all active:scale-95">
                        <X className="w-8 h-8" />
                    </button>
                </div>
            )}

            {/* --- CONFIRMATION DIALOGS --- */}
            {pendingNavChoice && (
                <div className="absolute inset-0 z-[250] bg-black/80 backdrop-blur-md flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-200 pointer-events-auto">
                    <div className="bg-[#1A1A17] border border-moto-accent/30 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl relative text-center">
                        <button onClick={() => setPendingNavChoice(null)} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                        <h3 className="text-2xl font-display font-bold text-white mb-2">{pendingNavChoice.label}</h3>
                        <p className="text-gray-400 text-sm mb-8">Nasıl gitmek istersin?</p>

                        <div className="flex flex-col gap-3">
                            <button onClick={handleGoogleNav} className="w-full py-4 bg-white text-black font-bold rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-transform">
                                <MapPin className="w-5 h-5" /> Google Maps
                            </button>
                            <button onClick={handleInternalNav} className="w-full py-4 bg-moto-accent text-black font-bold rounded-xl flex items-center justify-center gap-3 active:scale-95 transition-transform">
                                <Navigation className="w-5 h-5" /> MotoVibe Nav
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};