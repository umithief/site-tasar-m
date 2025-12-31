import React from 'react';
import { Route } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Film, Sparkles, Navigation, Share2 } from 'lucide-react';

interface RouteDetailModalProps {
    route: Route | null;
    isOpen: boolean;
    onClose: () => void;
    onStartRide: (route: Route) => void;
}

const getYouTubeID = (url: string) => {
    if (!url) return false;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7] && match[7].length === 11) ? match[7] : false;
};

export const RouteDetailModal: React.FC<RouteDetailModalProps> = ({ route, isOpen, onClose, onStartRide }) => {
    if (!isOpen || !route) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#1A1A1C] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-white/10 overflow-hidden flex flex-col md:flex-row relative shadow-2xl"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 z-50 p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-colors"
                    >
                        <X size={20} />
                    </button>

                    {/* Left: Media & Header (Mobile) */}
                    <div className="w-full md:w-2/5 h-64 md:h-auto relative bg-[#121212]">
                        {route.videoUrl ? (
                            getYouTubeID(route.videoUrl) ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${getYouTubeID(route.videoUrl)}`}
                                    className="w-full h-full object-cover"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            ) : (
                                <video src={route.videoUrl} className="w-full h-full object-cover" controls />
                            )
                        ) : (
                            <img src={route.image || 'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=800'} alt={route.title} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#1A1A1C] to-transparent md:hidden" />
                    </div>

                    {/* Right: Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
                        <div className="mb-6">
                            <span className="px-3 py-1 bg-[#F2A619] text-black text-xs font-bold rounded-full uppercase tracking-wider mb-3 inline-block">
                                {route.difficulty}
                            </span>
                            <h2 className="text-3xl font-bold text-white leading-tight mb-2">{route.title}</h2>
                            <div className="flex items-center gap-2 text-gray-400 text-sm">
                                <MapPin size={16} />
                                {route.location}
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-8">
                            <div className="p-4 bg-[#242426] rounded-xl border border-white/5 text-center">
                                <div className="text-xs text-gray-500 font-bold uppercase mb-1">Mesafe</div>
                                <div className="text-xl font-bold text-white font-mono">{route.distance}</div>
                            </div>
                            <div className="p-4 bg-[#242426] rounded-xl border border-white/5 text-center">
                                <div className="text-xs text-gray-500 font-bold uppercase mb-1">Süre</div>
                                <div className="text-xl font-bold text-white font-mono">
                                    {(route as any).duration ? (route as any).duration : route.estimatedTime || '--'}
                                </div>
                            </div>
                            <div className="p-4 bg-[#242426] rounded-xl border border-white/5 text-center">
                                <div className="text-xs text-gray-500 font-bold uppercase mb-1">Sezon</div>
                                <div className="text-xl font-bold text-white">{route.bestSeason ? route.bestSeason.split(' ')[0] : 'Genel'}</div>
                            </div>
                        </div>

                        <div className="space-y-6 mb-8">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-2">Rota Açıklaması</h3>
                                <p className="text-gray-400 leading-relaxed whitespace-pre-wrap">
                                    {route.description || "Bu rota için henüz açıklama girilmemiş."}
                                </p>
                            </div>

                            {/* AI Analysis Mockup */}
                            <div className="p-4 bg-gradient-to-br from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-500/20">
                                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm mb-2">
                                    <Sparkles size={16} />
                                    AI Rota Analizi
                                </div>
                                <p className="text-gray-300 text-sm italic">
                                    "Bu rota özellikle viraj severler için harika bir seçenek. Asfalt kalitesi genel olarak Yüksek. Hafta sonları trafik yoğun olabilir, erken saatleri tercih edin."
                                </p>
                            </div>
                        </div>

                        <div className="sticky bottom-0 bg-[#1A1A1C] pt-4 border-t border-white/10 flex gap-4">
                            <button
                                onClick={() => onStartRide(route)}
                                className="flex-1 py-3.5 bg-[#F2A619] text-black font-bold rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
                            >
                                <Navigation size={20} />
                                Rotayı Başlat
                            </button>
                            <button className="p-3.5 bg-[#242426] text-white rounded-xl hover:bg-white/10 transition-colors border border-white/10">
                                <Share2 size={20} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
