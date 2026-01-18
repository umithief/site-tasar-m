import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Navigation, MapPin, X, Layers, Wind, Zap, Users, Compass, Crosshair, Radio, ChevronRight, Activity, Cpu } from 'lucide-react';

// --- PHANTOM EDITION UI ---

export const DiscoverySidebar = ({ routes, onSelectRoute, isOpen, onClose }: any) => {
    // Mission Control: Horizontal Deck
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed bottom-0 left-0 right-0 z-[900] pointer-events-none flex flex-col justify-end h-[40vh] md:h-[35vh]">
                    {/* Background Gradient Mesh */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent pointer-events-none" />

                    <div className="container mx-auto px-4 pb-8 w-full overflow-x-auto no-scrollbar pointer-events-auto relative z-10">
                        <div className="flex items-end gap-6 pl-4 md:pl-0">
                            {/* Title Block */}
                            <div className="min-w-[200px] mb-8 hidden md:block">
                                <div className="flex items-center gap-2 text-moto-accent mb-2">
                                    <Activity className="w-4 h-4 animate-pulse" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] font-mono">Mission Control</span>
                                </div>
                                <h1 className="text-4xl font-black italic text-white leading-[0.85] tracking-tighter uppercase whitespace-nowrap">
                                    Sector<br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-moto-accent to-white">Scan</span>
                                </h1>
                            </div>

                            {/* Cards Deck */}
                            {routes.map((route: any, i: number) => (
                                <motion.div
                                    initial={{ y: 100, opacity: 0, scale: 0.9 }}
                                    animate={{ y: 0, opacity: 1, scale: 1 }}
                                    exit={{ y: 100, opacity: 0, scale: 0.9 }}
                                    transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
                                    key={route.id}
                                    onClick={() => onSelectRoute(route)}
                                    className="group relative min-w-[280px] w-[280px] md:w-[320px] h-[220px] bg-[#09090b] border border-white/10 hover:border-moto-accent/100 transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-4 shadow-2xl skew-x-0 md:-skew-x-6 hover:skew-x-0"
                                    style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 100%, 0 100%, 0 10%)' }}
                                >
                                    {/* Image Bg */}
                                    <div className="absolute inset-0">
                                        <div className="absolute inset-0 bg-black/60 group-hover:bg-black/40 transition-colors z-10" />
                                        <img src={route.image || "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                    </div>

                                    {/* Content */}
                                    <div className="absolute inset-0 p-5 flex flex-col justify-between z-20 md:skew-x-6 group-hover:skew-x-0 transition-transform">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border border-current w-fit mb-2 ${route.difficulty === 'Hard' ? 'text-red-500 border-red-500' : 'text-moto-accent border-moto-accent'}`}>
                                                    {route.difficulty} CLASS
                                                </span>
                                                <h3 className="text-2xl font-black text-white italic leading-none uppercase max-w-[180px]">{route.title}</h3>
                                            </div>
                                            <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-moto-accent group-hover:border-moto-accent group-hover:text-black transition-all text-white">
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-t border-white/20 pt-3">
                                            <div className="flex gap-4">
                                                <div>
                                                    <div className="text-[8px] text-gray-400 uppercase tracking-widest font-mono">DIST</div>
                                                    <div className="text-sm font-bold text-white font-mono">{route.dist}</div>
                                                </div>
                                                <div>
                                                    <div className="text-[8px] text-gray-400 uppercase tracking-widest font-mono">EST</div>
                                                    <div className="text-sm font-bold text-white font-mono">{route.time}</div>
                                                </div>
                                            </div>
                                            <Navigation className="w-12 h-12 text-white/5 absolute -bottom-2 -right-2" />
                                        </div>
                                    </div>

                                    {/* Scanline Effect */}
                                    <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none opacity-20" />
                                </motion.div>
                            ))}

                            {/* See All / Close */}
                            <button onClick={onClose} className="min-w-[80px] h-[220px] flex items-center justify-center border-l border-white/10 text-gray-500 hover:text-white hover:bg-white/5 transition-colors">
                                <div className="rotate-90 text-xs font-black uppercase tracking-[0.3em] flex items-center gap-2">
                                    Close Deck <X className="w-4 h-4" />
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};

export const FloatingSearch = ({ onSearch }: any) => {
    return (
        <div className="absolute top-6 left-6 z-[1000] pointer-events-none">
            <div className="bg-black/80 border-l-2 border-moto-accent backdrop-blur-md p-0.5 pointer-events-auto shadow-[0_0_30px_rgba(226,255,59,0.1)]">
                <div className="flex items-center bg-[#09090b]">
                    <div className="w-10 h-10 flex items-center justify-center text-moto-accent border-r border-white/10">
                        <Cpu className="w-4 h-4" />
                    </div>
                    <input
                        type="text"
                        placeholder="CMD: SEARCH_SECTOR"
                        className="bg-transparent border-none outline-none text-white text-xs font-mono px-4 w-[200px] md:w-[300px] placeholder-gray-600 uppercase"
                    />
                    <div className="px-3 py-1 bg-white/5 text-[8px] text-gray-500 font-mono border-l border-white/10 mr-1">
                        V.2.0
                    </div>
                </div>
            </div>
            {/* Decorative Data Lines */}
            <div className="flex items-start gap-1 mt-1 opacity-50">
                <div className="w-1 h-3 bg-moto-accent" />
                <div className="w-32 h-0.5 bg-moto-accent mt-1" />
            </div>
        </div>
    );
};

export const MapHUD = ({ coords, userCount, onRecenter }: any) => {
    return (
        <div className="absolute bottom-6 right-6 z-[1000] flex flex-col items-end gap-2 pointer-events-none">

            {/* Radar Widget */}
            <div className="mb-4 pointer-events-auto relative group">
                <div className="w-24 h-24 rounded-full border border-white/10 bg-black/40 backdrop-blur-sm relative flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 border border-moto-accent/30 rounded-full animate-[ping_3s_linear_infinite]" />
                    <div className="w-full h-[1px] bg-moto-accent/20 absolute top-1/2 left-0 -translate-y-1/2" />
                    <div className="h-full w-[1px] bg-moto-accent/20 absolute top-0 left-1/2 -translate-x-1/2" />
                    <div className="w-1 h-1 bg-moto-accent rounded-full shadow-[0_0_10px_#e2ff3b]" />
                    {/* Blips */}
                    <div className="absolute top-6 right-6 w-0.5 h-0.5 bg-white rounded-full animate-pulse" />
                    <div className="absolute bottom-8 left-6 w-0.5 h-0.5 bg-red-500 rounded-full animate-pulse delay-75" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-black border border-white/20 text-[8px] font-mono text-moto-accent px-1">
                    RADAR ACTIVE
                </div>
            </div>

            {/* Coordinates / Telemetry */}
            <div className="flex flex-col items-end pointer-events-auto">
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">Target Vector</span>
                </div>
                <div className="bg-black/90 border border-white/10 p-2 flex items-center gap-4">
                    <div className="text-right">
                        <div className="text-[10px] text-gray-600 font-mono leading-none mb-0.5">LAT</div>
                        <div className="text-xs font-bold text-white font-mono">{coords.split(',')[0] || '41.0082'}</div>
                    </div>
                    <div className="w-[1px] h-6 bg-white/20" />
                    <div className="text-right">
                        <div className="text-[10px] text-gray-600 font-mono leading-none mb-0.5">LNG</div>
                        <div className="text-xs font-bold text-white font-mono">{coords.split(',')[1] || '28.9784'}</div>
                    </div>
                </div>
            </div>

            {/* Tactical Controls */}
            <div className="flex gap-1 mt-2 pointer-events-auto">
                <button className="w-10 h-10 bg-black border border-white/20 hover:border-moto-accent text-gray-400 hover:text-moto-accent flex items-center justify-center transition-colors">
                    <Radio className="w-4 h-4" />
                </button>
                <button
                    onClick={onRecenter}
                    className="w-10 h-10 bg-moto-accent text-black flex items-center justify-center hover:bg-white transition-colors"
                >
                    <Crosshair className="w-4 h-4 animate-[spin_10s_linear_infinite]" />
                </button>
            </div>
        </div>
    );
};

export const RouteCard = ({ route, onClose, onStartNavigation }: any) => {
    const [launching, setLaunching] = useState(false);

    if (!route) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1100] flex items-center justify-center pointer-events-none"
            >
                {/* Backdrop with Grid */}
                <div className="absolute inset-0 bg-black/90 backdrop-blur-xl pointer-events-auto" onClick={onClose}>
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>

                {/* Main Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.1, opacity: 0 }}
                    className="relative w-full max-w-4xl h-[80vh] bg-black border border-white/10 pointer-events-auto overflow-hidden flex flex-col md:flex-row shadow-[0_0_100px_rgba(0,0,0,0.8)]"
                >
                    {/* Left: Visuals */}
                    <div className="w-full md:w-1/2 h-[40vh] md:h-full relative group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent z-10 md:bg-gradient-to-r" />
                        <img src={route.image} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-1000 grayscale group-hover:grayscale-0" />

                        {/* Overlay Data */}
                        <div className="absolute bottom-8 left-8 z-20">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-2 h-2 rounded-full ${route.difficulty === 'Hard' ? 'bg-red-500 box-shadow-[0_0_10px_red]' : 'bg-moto-accent box-shadow-[0_0_10px_#e2ff3b]'}`} />
                                <span className="text-xs font-mono text-gray-300 uppercase tracking-widest">Sector Grade: {route.difficulty}</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black italic text-white uppercase leading-[0.85] tracking-tighter mix-blend-difference">{route.title}</h1>
                        </div>
                    </div>

                    {/* Right: Flight Plan */}
                    <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-[#050505]">
                        <div>
                            <div className="flex justify-between items-start mb-8 border-b border-white/10 pb-4">
                                <div>
                                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Author</div>
                                    <div className="text-white font-bold">{route.author || 'MotoVibe Sys'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Rating</div>
                                    <div className="text-moto-accent font-black text-xl">{route.rating}</div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <p className="text-gray-400 text-sm md:text-base leading-relaxed font-light border-l-2 border-white/10 pl-4">{route.desc}</p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 border border-white/5 hover:border-moto-accent/50 transition-colors group">
                                        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Total Distance</div>
                                        <div className="text-2xl font-black text-white italic group-hover:text-moto-accent transition-colors">{route.dist}</div>
                                    </div>
                                    <div className="bg-white/5 p-4 border border-white/5 hover:border-moto-accent/50 transition-colors group">
                                        <div className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Conditions</div>
                                        <div className="text-2xl font-black text-white italic group-hover:text-moto-accent transition-colors truncate">{route.weather}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={() => {
                                    setLaunching(true);
                                    setTimeout(() => {
                                        if (onStartNavigation) onStartNavigation();
                                        else {
                                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${route.coordinates[route.coordinates.length - 1][0]},${route.coordinates[route.coordinates.length - 1][1]}&travelmode=driving`, '_blank');
                                            onClose();
                                        }
                                    }, 2000);
                                }}
                                className="w-full h-16 bg-white text-black hover:bg-moto-accent transition-all font-black uppercase tracking-[0.2em] text-lg relative overflow-hidden group"
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {launching ? 'INITIALIZING...' : 'INITIATE ROUTE'}
                                    {!launching && <ChevronRight className="w-5 h-5" />}
                                </span>
                                {launching && (
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 2, ease: "linear" }}
                                        className="absolute inset-0 bg-moto-accent z-0"
                                    />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Close Btn */}
                    <button onClick={onClose} className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white hover:text-moto-accent transition-colors md:hidden">
                        <X className="w-6 h-6" />
                    </button>
                    <button onClick={onClose} className="absolute top-8 right-8 z-50 hidden md:flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white transition-colors uppercase tracking-widest">
                        [ ESC ] ABORT
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
