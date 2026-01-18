import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Navigation, MapPin, X, Layers, Wind, Zap, Users, Compass, ChevronUp, Clock, Move } from 'lucide-react';

// --- Overlay Components ---

export const DiscoverySidebar = ({ routes, onSelectRoute, isOpen, onClose }: any) => {
    return (
        <div className={`
            fixed z-[900] transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1) pointer-events-none
            md:absolute md:top-6 md:bottom-6 md:left-6 md:w-[380px] md:translate-y-0
            left-0 right-0 bottom-0 top-auto w-full h-[70vh] rounded-t-[2.5rem]
            ${isOpen ? 'translate-y-0' : 'translate-y-[110%] md:translate-y-0'}
        `}>
            {/* Mobile Drag Handle / Close Header */}
            <div className="md:hidden absolute -top-12 left-0 right-0 h-12 flex justify-center items-center pointer-events-auto" onClick={onClose}>
                <div className="w-16 h-1.5 bg-white/20 rounded-full shadow-lg backdrop-blur-sm"></div>
            </div>

            {/* Glass Panel */}
            <div className="w-full h-full bg-[#0a0a0a]/80 backdrop-blur-2xl md:border border-white/10 md:rounded-[2.5rem] pointer-events-auto flex flex-col pt-2 shadow-2xl relative overflow-hidden">
                {/* Internal Gradient Glow */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

                <div className="p-8 pb-4 relative z-10">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <div className="flex items-center gap-2 text-moto-accent mb-2">
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">Live Feed</span>
                            </div>
                            <h2 className="text-3xl font-black text-white italic tracking-tighter shadow-black drop-shadow-lg">POPULAR ROUTES</h2>
                        </div>
                        {/* Mobile Close Button */}
                        <button onClick={onClose} className="md:hidden p-3 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors backdrop-blur-md border border-white/5">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear">
                        {['All', 'Twisty', 'Scenic', 'Urban'].map((f, i) => (
                            <button key={f} className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all whitespace-nowrap ${i === 0 ? 'bg-moto-accent text-black border-moto-accent' : 'bg-transparent text-gray-400 border-white/10 hover:border-white/30 hover:text-white'}`}>
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 pt-0 space-y-4 no-scrollbar pb-32 md:pb-6 relative z-10">
                    {routes.map((route: any, i: number) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            key={route.id}
                            onClick={() => {
                                onSelectRoute(route);
                                onClose && onClose(); // Close on mobile select
                            }}
                            className="group relative p-5 bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/5 hover:border-moto-accent/50 rounded-3xl cursor-pointer transition-all active:scale-[0.98] hover:shadow-lg hover:shadow-moto-accent/10 overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-moto-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex justify-between items-start mb-3 relative z-10">
                                <h3 className="font-bold text-lg text-white group-hover:text-moto-accent transition-colors leading-tight">{route.title}</h3>
                                <div className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${route.difficulty === 'Hard' ? 'bg-red-500 text-black' :
                                    route.difficulty === 'Medium' ? 'bg-orange-500 text-black' : 'bg-moto-accent text-black'
                                    }`}>
                                    {route.difficulty}
                                </div>
                            </div>

                            <div className="flex items-center gap-6 text-xs text-gray-400 font-medium relative z-10">
                                <div className="flex items-center gap-1.5">
                                    <Move className="w-3.5 h-3.5 text-gray-500" />
                                    <span>{route.dist}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <Clock className="w-3.5 h-3.5 text-gray-500" />
                                    <span>{route.time}</span>
                                </div>
                            </div>

                            {/* Hover CTA */}
                            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                <div className="w-10 h-10 rounded-2xl bg-moto-accent flex items-center justify-center text-black shadow-lg shadow-moto-accent/20">
                                    <Navigation className="w-5 h-5 fill-current" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom Fade */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none z-20" />
            </div>
        </div>
    );
};

export const FloatingSearch = ({ onSearch }: any) => {
    return (
        <div className="absolute top-4 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[600px] z-[1000] flex flex-col items-center gap-3 pointer-events-none">
            <div className="w-full bg-[#0a0a0a]/60 backdrop-blur-xl border border-white/10 rounded-[2rem] p-2 pr-3 flex items-center shadow-2xl pointer-events-auto transition-all focus-within:bg-black/80 focus-within:border-moto-accent/50 focus-within:shadow-moto-accent/10">
                <div className="p-3 bg-white/5 rounded-full mr-2">
                    <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search routes, locations, riders..."
                    className="flex-1 bg-transparent border-none outline-none text-white text-sm font-medium placeholder-gray-500 h-full"
                />
                <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl transition-colors text-gray-400 hover:text-white border border-transparent hover:border-white/10">
                    <Layers className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export const MapHUD = ({ coords, userCount, onRecenter }: any) => {
    return (
        <div className="absolute bottom-32 md:bottom-8 right-4 md:right-8 z-[1000] flex flex-col items-end gap-3 pointer-events-none">
            {/* Live Stats */}
            <div className="bg-[#0a0a0a]/80 backdrop-blur-xl border border-white/10 rounded-3xl p-5 flex flex-col gap-3 pointer-events-auto min-w-[220px] shadow-2xl">
                <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-gray-500">
                    <span>COORDS</span>
                    <span className="text-white font-mono">{coords}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black tracking-widest text-gray-500">
                    <span>NEARBY</span>
                    <span className="text-cyan-400 flex items-center gap-1.5 bg-cyan-400/10 px-2 py-0.5 rounded-full border border-cyan-400/20">
                        <Users className="w-3 h-3" /> {userCount}
                    </span>
                </div>
                <div className="mt-1 pt-3 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-moto-accent text-[10px] font-black uppercase tracking-wider">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-moto-accent opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-moto-accent"></span>
                        </span>
                        System Online
                    </div>
                </div>
            </div>

            {/* Recenter FAB */}
            <div className="flex flex-col gap-2 pointer-events-auto">
                <button
                    className="w-14 h-14 bg-black/80 backdrop-blur-md border border-white/10 text-white rounded-[1.2rem] flex items-center justify-center hover:bg-white/10 transition-all active:scale-90"
                >
                    <Compass className="w-6 h-6" />
                </button>
                <button
                    onClick={onRecenter}
                    className="w-14 h-14 bg-moto-accent text-black rounded-[1.2rem] flex items-center justify-center shadow-[0_0_30px_rgba(226,255,59,0.3)] hover:scale-105 active:scale-90 transition-all hover:bg-white hover:text-black"
                >
                    <Navigation className="w-6 h-6 fill-current" />
                </button>
            </div>
        </div>
    );
};

export const RouteCard = ({ route, onClose, onStartNavigation }: any) => {
    if (!route) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="absolute bottom-0 left-0 right-0 z-[1100] md:p-6 pointer-events-none flex justify-center items-end"
            >
                <div className="w-full md:w-[500px] bg-[#09090b] md:rounded-[2.5rem] rounded-t-[2.5rem] border-t md:border border-white/10 shadow-2xl overflow-hidden pointer-events-auto relative ring-1 ring-white/5">
                    {/* Header Image */}
                    <div className="h-64 relative group">
                        <img src={route.image || "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80"} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/40 to-transparent" />
                        <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
                            <span className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-md ${route.difficulty === 'Hard' ? 'bg-red-500 text-black' : 'bg-moto-accent text-black'
                                }`}>
                                {route.difficulty}
                            </span>
                            <button
                                onClick={onClose}
                                className="p-2.5 bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-white/20 transition-colors border border-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 -mt-20 relative z-10">
                        <div className="mb-6">
                            <h2 className="text-4xl font-black text-white italic tracking-tighter uppercase mb-2 leading-[0.9]">{route.title}</h2>
                            <div className="flex items-center gap-2 text-gray-400 text-xs font-mono">
                                <span className="text-moto-accent">●</span>
                                <span>Created by {route.author || 'MotoVibe'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-8">
                            {[
                                { label: 'DIST', val: route.dist, icon: Navigation },
                                { label: 'WX', val: route.weather, icon: Wind },
                                { label: 'RIDERS', val: route.riders, icon: Users }
                            ].map((stat) => (
                                <div key={stat.label} className="bg-white/[0.03] rounded-2xl p-4 border border-white/5 flex flex-col items-center justify-center gap-1 group hover:bg-white/[0.05] transition-colors">
                                    <stat.icon className="w-4 h-4 text-gray-500 group-hover:text-moto-accent transition-colors mb-1" />
                                    <div className="text-lg font-black text-white">{stat.val}</div>
                                    <div className="text-[9px] text-gray-600 uppercase font-black tracking-widest">{stat.label}</div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => {
                                const btn = document.activeElement as HTMLElement;
                                if (btn) {
                                    btn.innerHTML = '<span class="animate-pulse">Connecting...</span>';
                                    setTimeout(() => {
                                        if (onStartNavigation) {
                                            onStartNavigation();
                                        } else {
                                            window.open(`https://www.google.com/maps/dir/?api=1&destination=${route.coordinates[route.coordinates.length - 1][0]},${route.coordinates[route.coordinates.length - 1][1]}&travelmode=driving`, '_blank');
                                            onClose();
                                        }
                                    }, 1000);
                                }
                            }}
                            className="w-full py-5 bg-moto-accent hover:bg-white text-black font-black uppercase tracking-[0.2em] text-sm rounded-2xl transition-all shadow-[0_0_40px_rgba(226,255,59,0.2)] hover:shadow-[0_0_60px_rgba(226,255,59,0.4)] flex items-center justify-center gap-3 active:scale-[0.98]"
                        >
                            <Navigation className="w-5 h-5 fill-current" />
                            Start Route
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
