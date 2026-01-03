import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Navigation, MapPin, X, Layers, Wind, Zap, Users } from 'lucide-react';
// No leaflet imports here, pure UI.

// --- Overlay Components ---

export const DiscoverySidebar = ({ routes, onSelectRoute }: any) => {
    return (
        <div className="absolute top-4 bottom-24 left-4 lg:left-24 w-80 z-[900] hidden md:flex flex-col gap-4 pointer-events-none">
            {/* Glass Panel */}
            <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden pointer-events-auto flex flex-col">
                <div className="p-6 border-b border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                    <div className="flex items-center gap-2 text-lime-400 mb-1">
                        <Zap className="w-4 h-4 fill-current" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Trending</span>
                    </div>
                    <h2 className="text-2xl font-black text-white italic tracking-tighter">POPULAR ROUTES</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3 no-scrollbar">
                    {routes.map((route: any) => (
                        <div
                            key={route.id}
                            onClick={() => onSelectRoute(route)}
                            className="group relative p-4 bg-black/40 border border-white/10 hover:border-lime-400/50 rounded-2xl cursor-pointer transition-all active:scale-95"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-white group-hover:text-lime-400 transition-colors">{route.title}</h3>
                                <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${route.difficulty === 'Hard' ? 'bg-red-500/20 text-red-500' :
                                    route.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-500'
                                    }`}>
                                    {route.difficulty}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400 font-mono">
                                <span>{route.dist}</span>
                                <span>•</span>
                                <span>{route.time}</span>
                            </div>

                            {/* Hover CTA */}
                            <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="w-8 h-8 rounded-full bg-lime-400 flex items-center justify-center text-black shadow-lg shadow-lime-400/20">
                                    <Navigation className="w-4 h-4" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export const FloatingSearch = ({ onSearch }: any) => {
    const filters = ['Twisty Roads', 'Bikestops', 'Events', 'Offroad'];

    return (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-[90%] md:w-[500px] z-[1000] flex flex-col items-center gap-3 pointer-events-none">
            <div className="w-full bg-[#111]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 flex items-center shadow-2xl pointer-events-auto">
                <Search className="w-5 h-5 text-gray-500 ml-3" />
                <input
                    type="text"
                    placeholder="Search for routes, places, or riders..."
                    className="flex-1 bg-transparent border-none outline-none text-white px-4 py-2 placeholder-gray-600 font-medium"
                />
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
                    <Layers className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto w-full justify-center pointer-events-auto no-scrollbar pb-2">
                {filters.map(filter => (
                    <button
                        key={filter}
                        className="px-4 py-1.5 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-xs font-bold text-gray-300 hover:bg-white/10 hover:border-white/30 transition-all whitespace-nowrap"
                    >
                        {filter}
                    </button>
                ))}
            </div>
        </div>
    );
};

export const MapHUD = ({ coords, userCount, onRecenter }: any) => {
    return (
        <div className="absolute bottom-24 md:bottom-8 right-4 md:right-8 z-[1000] flex flex-col items-end gap-4 pointer-events-none">
            {/* Live Stats */}
            <div className="bg-black/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-col gap-2 pointer-events-auto min-w-[200px]">
                <div className="flex justify-between items-center text-xs font-mono text-gray-500">
                    <span>COORDS</span>
                    <span className="text-white">{coords}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-mono text-gray-500">
                    <span>NEARBY</span>
                    <span className="text-cyan-400 flex items-center gap-1">
                        <Users className="w-3 h-3" /> {userCount}
                    </span>
                </div>
                <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center">
                    <div className="flex items-center gap-1 text-lime-400 text-xs font-bold uppercase">
                        <span className="w-2 h-2 bg-lime-400 rounded-full animate-pulse" />
                        Online
                    </div>
                </div>
            </div>

            {/* Recenter FAB */}
            <button
                onClick={onRecenter}
                className="w-12 h-12 bg-lime-400 text-black rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(226,255,59,0.3)] hover:scale-105 active:scale-95 transition-all pointer-events-auto"
            >
                <Navigation className="w-5 h-5 fill-current" />
            </button>
        </div>
    );
};

export const RouteCard = ({ route, onClose }: any) => {
    if (!route) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: "100%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: "100%", opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="absolute bottom-0 left-0 right-0 z-[1100] md:p-8 pointer-events-none flex justify-center"
            >
                <div className="w-full md:w-[600px] bg-[#09090b] md:rounded-3xl border-t md:border border-white/10 shadow-2xl overflow-hidden pointer-events-auto relative">
                    {/* Header Image */}
                    <div className="h-48 relative">
                        <img src={route.image || "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80"} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent" />
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur rounded-full text-white hover:bg-white/20 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 md:p-8 -mt-12 relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${route.difficulty === 'Hard' ? 'bg-red-500 text-black' : 'bg-lime-400 text-black'
                                        }`}>
                                        {route.difficulty}
                                    </span>
                                    <span className="text-gray-500 text-xs font-medium">by {route.author || 'MotoVibe'}</span>
                                </div>
                                <h2 className="text-3xl font-black text-white italic tracking-tighter uppercase">{route.title}</h2>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-black text-white">{route.rating}</div>
                                <div className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Rating</div>
                            </div>
                        </div>

                        <p className="text-gray-400 text-sm leading-relaxed mb-6">{route.desc}</p>

                        <div className="grid grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <Navigation className="w-5 h-5 text-gray-400 mb-1" />
                                <div className="text-lg font-bold text-white">{route.dist}</div>
                                <div className="text-[10px] text-gray-600 uppercase font-black">Distance</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <Wind className="w-5 h-5 text-gray-400 mb-1" />
                                <div className="text-lg font-bold text-white max-w-full truncate" title={route.weather}>{route.weather}</div>
                                <div className="text-[10px] text-gray-600 uppercase font-black">Weather</div>
                            </div>
                            <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                <Users className="w-5 h-5 text-gray-400 mb-1" />
                                <div className="text-lg font-bold text-white">{route.riders}</div>
                                <div className="text-[10px] text-gray-600 uppercase font-black">Riders</div>
                            </div>
                        </div>

                        <button className="w-full py-4 bg-lime-400 hover:bg-lime-300 text-black font-black uppercase tracking-widest text-sm rounded-xl transition-colors shadow-[0_0_30px_rgba(226,255,59,0.2)] flex items-center justify-center gap-2">
                            <Navigation className="w-5 h-5 fill-current" />
                            Start Navigation
                        </button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};
