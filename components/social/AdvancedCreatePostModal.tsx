import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Image as ImageIcon, MapPin, Gauge, Navigation, Activity, ChevronRight, Loader2, Maximize2, AlertCircle } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { MediaUploader } from '../ui/MediaUploader';
import { Button } from '../ui/Button';
import { socialService } from '../../services/socialService';

interface AdvancedCreatePostModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUser: any;
    onPostCreate: (content: string, mediaUrl: string | null, rideStats?: any, location?: string) => Promise<void>;
}

export const AdvancedCreatePostModal: React.FC<AdvancedCreatePostModalProps> = ({
    isOpen,
    onClose,
    currentUser,
    onPostCreate
}) => {
    // State
    const [content, setContent] = useState('');
    const [mediaUrl, setMediaUrl] = useState<string | null>(null);
    const [location, setLocation] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'media' | 'telemetry'>('media');

    // Stats Toggles
    const [includeSpeed, setIncludeSpeed] = useState(true);
    const [includeLean, setIncludeLean] = useState(true);
    const [includeRoute, setIncludeRoute] = useState(false);

    // Refs
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Initial Focus & Reset
    useEffect(() => {
        if (isOpen) {
            setContent('');
            setMediaUrl(null);
            setLocation(null);
            setStats(null);
        }
    }, [isOpen]);

    // Handle Location
    const toggleLocation = () => {
        if (location) {
            setLocation(null);
        } else {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(async (position) => {
                    try {
                        // Mock reverse geocode or simple coords for now to match strict requirements
                        // Ideally utilize a geocoding service here
                        const { latitude, longitude } = position.coords;
                        setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
                        // Optional: Real reverse geocoding fetch could go here
                    } catch (error) {
                        console.error("Location error", error);
                    }
                });
            }
        }
    };

    // Handle Telemetry Fetch
    const fetchTelemetry = async () => {
        try {
            const data = await socialService.getLatestRideActivity();
            if (data && data.user) { // Check if valid data returned
                setStats(data);
                if (data.route) setIncludeRoute(true);
            } else {
                alert("Son sürüş verisi bulunamadı. Lütfen önce bir sürüş kaydedin.");
            }
        } catch (error) {
            console.error("Telemetry fetch error", error);
            alert("Veri alınırken hata oluştu.");
        }
    };

    // Submit Handler
    const handleSubmit = async () => {
        if (!content.trim() && !mediaUrl) return;

        setIsSubmitting(true);
        try {
            // Filter stats based on user selection
            const finalStats = stats ? {
                ...stats,
                maxSpeed: includeSpeed ? stats.maxSpeed : undefined,
                leanAngle: includeLean ? stats.leanAngle : undefined,
                route: includeRoute ? "Map Data" : undefined // Mock map data attachment
            } : undefined;

            await onPostCreate(content, mediaUrl, finalStats, location || undefined);
            onClose();
        } catch (error) {
            console.error("Failed to create post", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal Window - VisionOS Glass Design */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 m-auto w-[900px] h-[600px] bg-white/10 dark:bg-[#1A1A1A]/90 backdrop-blur-2xl border border-white/20 dark:border-white/10 rounded-[2.5rem] shadow-2xl shadow-black/50 z-[101] overflow-hidden flex flex-col md:flex-row"
                    >
                        {/* LEFT: Media Preview & HUD */}
                        <div className="w-full md:w-[60%] h-[200px] md:h-full relative bg-black/50 overflow-hidden group">
                            {mediaUrl ? (
                                <div className="absolute inset-0">
                                    <img src={mediaUrl} alt="Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => setMediaUrl(null)}
                                        className="absolute top-4 left-4 p-2 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20 hover:text-red-500"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>

                                    {/* HUD Overlay */}
                                    {stats && (
                                        <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
                                            {includeSpeed && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-moto-accent/20 flex items-center justify-center text-moto-accent">
                                                        <Gauge className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Hız</p>
                                                        <p className="text-xl font-bold font-mono text-white">{stats.maxSpeed} <span className="text-xs text-gray-400">km/h</span></p>
                                                    </div>
                                                </div>
                                            )}
                                            {includeLean && (
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                        <Activity className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest">Yatış</p>
                                                        <p className="text-xl font-bold font-mono text-white">{stats.leanAngle}°</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-500 border-r border-white/5">
                                    <MediaUploader
                                        onUploadComplete={setMediaUrl}
                                        onUploadError={(e) => alert(e)}
                                        showPreview={false}
                                        trigger={
                                            <div className="group cursor-pointer flex flex-col items-center">
                                                <div className="w-20 h-20 rounded-[2rem] bg-white/5 flex items-center justify-center border border-white/10 group-hover:scale-110 group-hover:border-moto-accent/50 group-hover:bg-moto-accent/10 transition-all duration-300">
                                                    <ImageIcon className="w-8 h-8 text-gray-400 group-hover:text-moto-accent transition-colors" />
                                                </div>
                                                <p className="mt-4 font-medium text-sm tracking-wide text-gray-400 group-hover:text-moto-accent transition-colors">MEDYA EKLE</p>
                                                <p className="text-xs text-gray-500 mt-2">Sürükle bırak veya seç</p>
                                            </div>
                                        }
                                    />
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Controls & Data */}
                        <div className="w-full md:w-[40%] h-full bg-zinc-900/50 flex flex-col border-l border-white/5">
                            {/* Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <div className="flex items-center gap-3">
                                    <UserAvatar src={currentUser?.avatar} name={currentUser?.name} size={40} className="ring-2 ring-white/10" />
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{currentUser?.name}</h3>
                                        <p className="text-xs text-moto-accent font-medium">@{currentUser?.username || 'user'}</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Content Input */}
                            <div className="p-6 flex-1 overflow-y-auto custom-scrollbar">
                                <textarea
                                    ref={textareaRef}
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    placeholder="Yolculuğun nasıldı? Hikayeni anlat..."
                                    className="w-full h-[150px] bg-transparent text-lg text-white placeholder-gray-500 outline-none resize-none leading-relaxed"
                                />

                                {/* Tags Pill Area */}
                                {(location || stats) && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {location && (
                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E2FF3B]/10 border border-[#E2FF3B]/20 text-[#E2FF3B] text-xs font-medium">
                                                <MapPin className="w-3 h-3" />
                                                {location}
                                                <button onClick={() => setLocation(null)} className="ml-1 hover:text-white"><X className="w-3 h-3" /></button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Telemetry Control Section */}
                                <div className="mt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                            <Activity className="w-3 h-3" /> Telemetri
                                        </h4>
                                        <button
                                            onClick={fetchTelemetry}
                                            className="text-[10px] text-moto-accent hover:underline"
                                        >
                                            Son Sürüşü Getir
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        {stats ? (
                                            <>
                                                <div
                                                    onClick={() => setIncludeSpeed(!includeSpeed)}
                                                    className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${includeSpeed ? 'bg-white/5 border-moto-accent/30' : 'bg-transparent border-white/5 opacity-50'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${includeSpeed ? 'bg-moto-accent text-black' : 'bg-white/10 text-gray-400'}`}>
                                                            <Gauge className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-sm font-medium text-white">Hız Limiti</span>
                                                    </div>
                                                    <span className="text-sm font-mono text-gray-300">{stats.maxSpeed} km/h</span>
                                                </div>

                                                <div
                                                    onClick={() => setIncludeLean(!includeLean)}
                                                    className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${includeLean ? 'bg-white/5 border-blue-500/30' : 'bg-transparent border-white/5 opacity-50'}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${includeLean ? 'bg-blue-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                                                            <Activity className="w-4 h-4" />
                                                        </div>
                                                        <span className="text-sm font-medium text-white">Yatış Açısı</span>
                                                    </div>
                                                    <span className="text-sm font-mono text-gray-300">{stats.leanAngle}°</span>
                                                </div>

                                                <div
                                                    onClick={() => stats.route && setIncludeRoute(!includeRoute)}
                                                    className={`cursor-pointer p-3 rounded-xl border transition-all flex items-center justify-between ${includeRoute ? 'bg-white/5 border-green-500/30' : 'bg-transparent border-white/5 opacity-50'} ${!stats.route ? 'opacity-30 cursor-not-allowed' : ''}`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-2 rounded-lg ${includeRoute ? 'bg-green-500 text-white' : 'bg-white/10 text-gray-400'}`}>
                                                            <Navigation className="w-4 h-4" />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-medium text-white">Rota</span>
                                                            {stats.route && (
                                                                <span className="text-[10px] text-gray-400 max-w-[150px] truncate">
                                                                    {stats.route.title || 'İsimsiz Rota'}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <span className="text-xs text-gray-400">
                                                        {stats.route ? (includeRoute ? 'Eklendi' : 'Kapalı') : 'Yok'}
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="p-4 rounded-xl border border-dashed border-white/10 text-center text-gray-500 text-xs">
                                                Telemetri verisi eklemek için "Son Sürüşü Getir"e tıkla.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-6 border-t border-white/5 bg-black/20">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex gap-2">
                                        <button
                                            onClick={toggleLocation}
                                            className={`p-2 rounded-lg transition-colors ${location ? 'text-[#E2FF3B] bg-[#E2FF3B]/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                            title="Konum"
                                        >
                                            <MapPin className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('telemetry')}
                                            className={`p-2 rounded-lg transition-colors ${stats ? 'text-[#E2FF3B] bg-[#E2FF3B]/10' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                                            title="Telemetri"
                                        >
                                            <Activity className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        {content.length}/280
                                    </span>
                                </div>
                                <Button
                                    onClick={handleSubmit}
                                    disabled={(!content && !mediaUrl) || isSubmitting}
                                    className="w-full bg-[#E2FF3B] hover:bg-[#D0EB33] text-black font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                                    PAYLAŞ
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
