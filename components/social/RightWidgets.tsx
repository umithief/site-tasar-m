import React from 'react';
import { motion } from 'framer-motion';
import { Map, Plus, ChevronRight, Hash, User, Navigation } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';

interface RightWidgetsProps {
    suggestedRiders?: any[];
    onNavigate?: (view: any, data?: any) => void;
}

export const RightWidgets: React.FC<RightWidgetsProps> = ({ suggestedRiders = [], onNavigate }) => {

    // Glassmorphism Recipe
    const glassStyle = "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-gray-200 dark:border-white/10 shadow-xl rounded-[2rem] overflow-hidden relative";

    return (
        <div className="flex flex-col gap-6 w-full lg:w-80 xl:w-96 sticky top-24">

            {/* 1. WIDGET: ROUTE OF THE DAY */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className={`${glassStyle} group cursor-pointer`}
            >
                {/* Background Map Image */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1569336415962-a4bd9f69cd83?q=80&w=1000&auto=format&fit=crop"
                        className="w-full h-full object-cover opacity-40 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                        alt="Route Map"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0F1012] via-[#0F1012]/50 to-transparent" />
                </div>

                {/* Content */}
                <div className="relative z-10 p-6 flex flex-col h-64 justify-between">
                    <div className="flex items-center justify-between">
                        <span className="px-3 py-1 rounded-full bg-black/10 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                            Günün Rotası
                        </span>
                        <div className="w-8 h-8 rounded-full bg-black/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-[#E2FF3B] group-hover:text-black transition-colors text-white">
                            <Navigation className="w-4 h-4" />
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-black text-white italic tracking-tighter mb-2 leading-none drop-shadow-xl">
                            SAHİL YOLU<br />VİRAJLARI
                        </h3>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center gap-1.5">
                                <span className="text-lg">📍</span>
                                <span className="text-xs font-bold text-white/90 font-mono">45 KM</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-lg">🔥</span>
                                <span className="text-xs font-bold text-white/90 font-mono">ORTA ZORLUK</span>
                            </div>
                        </div>

                        <button className="w-full py-3 rounded-xl border border-white/20 hover:border-[#E2FF3B] text-xs font-bold text-white hover:text-[#E2FF3B] uppercase tracking-widest transition-all bg-black/20 backdrop-blur-md">
                            Rotayı İncele
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* 2. WIDGET: WHO TO FOLLOW */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className={`${glassStyle} p-6`}
            >
                <div className="flex items-center justify-between mb-6">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white">Önerilen Sürücüler</h4>
                    <button className="text-[10px] font-bold text-moto-accent hover:text-black dark:hover:text-white transition-colors">TÜMÜ</button>
                </div>

                <div className="space-y-4">
                    {suggestedRiders.length > 0 ? (
                        suggestedRiders.slice(0, 3).map((rider, i) => (
                            <div key={i} className="flex items-center justify-between group/user">
                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate?.('public-profile', { _id: rider._id })}>
                                    <UserAvatar
                                        src={rider.avatar}
                                        name={rider.name}
                                        size={40}
                                        className="ring-2 ring-gray-100 dark:ring-white/10 group-hover/user:ring-moto-accent/50 transition-all"
                                    />
                                    <div>
                                        <h5 className="font-bold text-sm text-gray-900 dark:text-white group-hover/user:text-moto-accent transition-colors">
                                            {rider.name}
                                        </h5>
                                        <p className="text-[10px] font-medium text-gray-500 dark:text-gray-400 font-mono">
                                            {rider.bike}
                                        </p>
                                    </div>
                                </div>

                                <button className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-400 hover:bg-[#E2FF3B] hover:text-black hover:scale-105 transition-all">
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        ))
                    ) : (
                        /* Loading Skeletons */
                        [1, 2, 3].map((_, i) => (
                            <div key={i} className="flex items-center justify-between animate-pulse">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800" />
                                    <div className="space-y-2">
                                        <div className="h-3 w-24 bg-gray-200 dark:bg-zinc-800 rounded" />
                                        <div className="h-2 w-16 bg-gray-200 dark:bg-zinc-800 rounded" />
                                    </div>
                                </div>
                                <div className="w-9 h-9 rounded-xl bg-gray-200 dark:bg-zinc-800" />
                            </div>
                        ))
                    )}
                </div>
            </motion.div>

            {/* 3. WIDGET: TRENDING TAGS */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className={`${glassStyle} p-6`}
            >
                <div className="flex items-center gap-2 mb-6 text-gray-900 dark:text-white">
                    <Hash className="w-4 h-4 text-moto-accent" />
                    <h4 className="text-sm font-bold">Gündem</h4>
                </div>

                <div className="flex flex-wrap gap-2">
                    {['#GeceSürüşü', '#TekTeker', '#MotoVibeGaraj', '#PistGünü', '#YamahaR25', '#Kartepe'].map((tag, i) => (
                        <span
                            key={i}
                            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[10px] font-bold text-gray-600 dark:text-gray-300 cursor-pointer hover:bg-moto-accent hover:text-black hover:border-moto-accent hover:scale-105 transition-all duration-300"
                        >
                            {tag}
                        </span>
                    ))}
                </div>
            </motion.div>

            {/* Footer Links (Mini) */}
            <div className="flex flex-wrap gap-x-4 gap-y-2 px-4 text-[10px] font-medium text-gray-600 dark:text-gray-400">
                <a href="#" className="hover:text-gray-400 dark:hover:text-gray-200 transition-colors">Gizlilik</a>
                <a href="#" className="hover:text-gray-400 dark:hover:text-gray-200 transition-colors">Kurallar</a>
                <a href="#" className="hover:text-gray-400 dark:hover:text-gray-200 transition-colors">Reklam</a>
                <span>© 2025 MotoVibe</span>
            </div>

        </div>
    );
};
