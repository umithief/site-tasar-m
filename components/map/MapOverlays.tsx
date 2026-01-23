import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Navigation, MapPin, X, Layers, Wind, Zap, Users, Compass, ChevronRight, Menu, Filter, Info, Heart } from 'lucide-react';

// --- LUXE MINIMALIST EDITION (TURKISH) ---

export const DiscoverySidebar = ({ routes, onSelectRoute, isOpen, onClose }: any) => {
    // "Discovery Dock" - Floating Island Concept
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Minimal Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[890] bg-black/20 backdrop-blur-[2px] pointer-events-auto"
                        onClick={onClose}
                    />

                    {/* The Dock */}
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        className="fixed bottom-8 left-0 right-0 z-[900] flex justify-center pointer-events-none"
                    >
                        <div className="bg-black/50 backdrop-blur-2xl border border-white/10 rounded-full p-2 pl-6 pr-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 pointer-events-auto ring-1 ring-white/5 hover:border-moto-accent/30 transition-colors duration-500">

                            {/* Dock Title */}
                            <div className="flex flex-col">
                                <span className="text-[9px] text-moto-accent/80 uppercase tracking-[0.2em] font-medium">Keşfet</span>
                                <span className="text-sm font-semibold text-white tracking-tight">Popüler Rotalar</span>
                            </div>

                            {/* Divider */}
                            <div className="w-[1px] h-8 bg-white/10" />

                            {/* Horizontal Scroll Area */}
                            <div className="flex items-center gap-3 overflow-x-auto max-w-[60vw] md:max-w-[400px] no-scrollbar py-2">
                                {routes.map((route: any) => (
                                    <div
                                        key={route.id}
                                        onClick={() => onSelectRoute(route)}
                                        className="relative group min-w-[60px] cursor-pointer"
                                    >
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 group-hover:border-moto-accent transition-all duration-300 relative ring-2 ring-transparent group-hover:ring-moto-accent/20">
                                            <img src={route.image || "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87"} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                        </div>
                                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            <span className="text-[9px] text-black font-bold bg-moto-accent px-2 py-0.5 rounded-full shadow-lg">{route.time}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Close Action */}
                            <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors border border-white/5">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export const FloatingSearch = ({ onSearch }: any) => {
    return (
        <div className="absolute top-0 left-0 right-0 z-[1000] p-4 pointer-events-none flex justify-center">
            {/* "Island" Header */}
            <div className="w-full max-w-[90%] md:max-w-[600px] bg-black/50 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-5 pr-2 shadow-2xl pointer-events-auto flex items-center justify-between ring-1 ring-white/5 transition-all hover:bg-black/60 group">

                <div className="flex items-center gap-4 flex-1">
                    <Menu className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors cursor-pointer" />
                    <input
                        type="text"
                        placeholder="Rota, lokasyon veya sürücü ara..."
                        className="bg-transparent border-none outline-none text-white text-sm font-light tracking-wide w-full placeholder-zinc-500 h-10"
                    />
                </div>

                <div className="flex items-center gap-1">
                    <button className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-white/5 text-zinc-400 hover:text-white transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                    <button className="w-10 h-10 rounded-full bg-moto-accent text-black flex items-center justify-center hover:scale-105 transition-all duration-300 shadow-[0_0_15px_rgba(226,255,59,0.3)]">
                        <Search className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const MapHUD = ({ coords, userCount, onRecenter }: any) => {
    return (
        <>
            {/* Top Right Status Indicators - Now Integrated elegantly */}
            <div className="absolute top-24 right-6 z-[950] flex flex-col items-end gap-4 pointer-events-none">
                {/* Live Riders Pill */}
                <div className="pointer-events-auto flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/5 shadow-xl">
                    <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-xs font-medium text-white tracking-wide">Canlı</span>
                    </div>
                    <div className="w-[1px] h-3 bg-white/20" />
                    <div className="text-xs text-zinc-300">
                        <span className="font-bold text-white">{userCount}</span> Sürücü
                    </div>
                </div>
            </div>

            {/* Bottom Right Controls - Minimal */}
            <div className="absolute bottom-6 right-6 z-[950] flex flex-col gap-3 pointer-events-none">
                <button
                    onClick={onRecenter}
                    className="pointer-events-auto w-12 h-12 bg-black/50 backdrop-blur-xl text-white border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl hover:bg-moto-accent hover:text-black hover:border-moto-accent transition-all duration-300 group ring-1 ring-white/5"
                >
                    <Navigation className="w-5 h-5 fill-current transition-transform group-hover:rotate-45" />
                </button>
            </div>
        </>
    );
};

export const RouteCard = ({ route, onClose, onStartNavigation }: any) => {
    if (!route) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[1100] flex justify-end pointer-events-none"
            >
                {/* Backdrop */}
                <div className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto" onClick={onClose} />

                {/* The "Golden Ticket" Card */}
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="relative w-full md:w-[480px] h-full bg-[#050505] border-l border-white/5 shadow-2xl pointer-events-auto flex flex-col"
                >
                    {/* Header Image Area */}
                    <div className="h-[45vh] relative text-[#fdfdfd]">
                        {/* Close Button */}
                        <button onClick={onClose} className="absolute top-6 right-6 z-30 w-10 h-10 rounded-full bg-black/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-black transition-all border border-white/10">
                            <X className="w-5 h-5" />
                        </button>

                        <div className="absolute inset-0 z-0">
                            <img src={route.image} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#050505]" />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full border backdrop-blur-md ${route.difficulty === 'Hard' ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-amber-200/50 text-amber-200 bg-amber-200/10'
                                        }`}>
                                        {route.difficulty === 'Hard' ? 'Zor' : route.difficulty === 'Medium' ? 'Orta' : 'Kolay'}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 uppercase tracking-widest">• {route.rating} Yıldız</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-light text-white leading-[0.95] tracking-tight mb-2">{route.title}</h2>
                                <p className="text-sm text-zinc-400 font-light flex items-center gap-2">
                                    <span className="w-4 h-[1px] bg-amber-200/50" />
                                    Oluşturan: {route.author || 'MotoVibe Editör'}
                                </p>
                            </motion.div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-8 flex flex-col justify-between relative">
                        {/* Decorative Line */}
                        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        <div className="space-y-8">
                            <div className="flex justify-between items-center text-center">
                                <div>
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Mesafe</div>
                                    <div className="text-2xl font-light text-white">{route.dist}</div>
                                </div>
                                <div className="w-[1px] h-10 bg-white/5" />
                                <div>
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Süre</div>
                                    <div className="text-2xl font-light text-white">{route.time}</div>
                                </div>
                                <div className="w-[1px] h-10 bg-white/5" />
                                <div>
                                    <div className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-2">Hava</div>
                                    <div className="text-2xl font-light text-white">{route.weather}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xs uppercase tracking-widest text-amber-200 font-medium">Rota Detayı</h3>
                                <p className="text-zinc-400 text-sm leading-7 font-light">
                                    {route.desc}
                                    <br /><br />
                                    Bu rota, yüksek irtifa virajları ve nefes kesen manzaraları ile bilinir. Lastik basınçlarınızı kontrol edin ve tam depo ile yola çıkın.
                                </p>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="space-y-4">
                            <button className="w-full h-14 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center gap-2 text-white transition-all group">
                                <Heart className="w-5 h-5 text-zinc-500 group-hover:text-red-500 transition-colors" />
                                <span className="text-xs uppercase tracking-widest">Favorilere Ekle</span>
                            </button>

                            <button
                                onClick={() => {
                                    if (onStartNavigation) onStartNavigation();
                                    else {
                                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${route.coordinates[route.coordinates.length - 1][0]},${route.coordinates[route.coordinates.length - 1][1]}&travelmode=driving`, '_blank');
                                        onClose();
                                    }
                                }}
                                className="w-full h-16 bg-gradient-to-r from-amber-200 to-yellow-100 text-black hover:scale-[1.02] active:scale-[0.98] rounded-xl flex items-center justify-center gap-3 transition-all shadow-[0_0_40px_rgba(253,230,138,0.2)]"
                            >
                                <span className="text-sm font-bold uppercase tracking-[0.1em]">Rotayı Başlat</span>
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
