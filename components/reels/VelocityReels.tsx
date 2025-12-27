import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Plus, Zap } from 'lucide-react';
import { api } from '../../services/api';
import { ReelPlayer } from './ReelPlayer';
import { ReelUploadModal } from './ReelUploadModal';
import { useAuthStore } from '../../store/authStore';

export const VelocityReels: React.FC = () => {
    const [reels, setReels] = useState<any[]>([]);
    const [selectedReelIndex, setSelectedReelIndex] = useState<number | null>(null);
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const { user } = useAuthStore();

    // Video hover preview refs
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        fetchReels();
    }, []);

    const fetchReels = async () => {
        try {
            const res = await api.get('/reels');
            setReels(res.data);
        } catch (error) {
            console.error('Failed to fetch reels:', error);
        }
    };

    const handleMouseEnter = (index: number) => {
        const video = videoRefs.current[index];
        if (video) {
            video.currentTime = 0;
            video.play().catch(() => { });
            video.muted = false; // Un-mute on hover? Or keep muted? User requested: "un-mutes and plays"
        }
    };

    const handleMouseLeave = (index: number) => {
        const video = videoRefs.current[index];
        if (video) {
            video.pause();
            video.currentTime = 0;
            video.muted = true;
        }
    };

    return (
        <section className="relative py-12 overflow-hidden">
            {/* Background Ambience */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/0 pointer-events-none" />

            <div className="container mx-auto px-4 md:px-8 mb-8 flex items-end justify-between">
                <div>
                    <h2 className="text-3xl md:text-5xl font-display font-black text-gray-900 tracking-tighter mb-2 flex items-center gap-3">
                        VELOCITY <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">REELS</span>
                        <Zap className="w-8 h-8 text-orange-500 fill-current animate-pulse" />
                    </h2>
                    <p className="text-gray-500 font-medium max-w-md">
                        En iyi anlarını paylaş, topluluğun ritmini yakala.
                    </p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsUploadOpen(true)}
                    className="hidden md:flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full font-bold uppercase tracking-wider shadow-xl hover:shadow-orange-500/20 hover:bg-orange-600 transition-all"
                >
                    <Plus className="w-5 h-5" />
                    Reel Yükle
                </motion.button>
            </div>

            {/* Horizontal Slider */}
            <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 px-4 md:px-8 pb-8 no-scrollbar touch-pan-x">
                {/* Upload Card (Mobile Only or Start of List) */}
                <motion.div
                    onClick={() => setIsUploadOpen(true)}
                    whileHover={{ scale: 0.98 }}
                    className="flex-shrink-0 w-[200px] md:w-[240px] aspect-[9/16] snap-center bg-gray-100 rounded-3xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors group"
                >
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform mb-4">
                        <Plus className="w-8 h-8" />
                    </div>
                    <span className="font-bold text-gray-400 group-hover:text-orange-600 uppercase tracking-widest text-xs">Yeni Paylaşım</span>
                </motion.div>

                {reels.filter(r => r && r.videoUrl).map((reel, index) => (
                    <motion.div
                        key={reel._id}
                        layoutId={`reel-${reel._id}`}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1 }}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={() => handleMouseLeave(index)}
                        onClick={() => setSelectedReelIndex(index)}
                        className="flex-shrink-0 w-[200px] md:w-[240px] aspect-[9/16] snap-center relative rounded-3xl overflow-hidden cursor-pointer group bg-black"
                    >
                        {/* Video Preview */}
                        <video
                            ref={el => videoRefs.current[index] = el}
                            src={reel.videoUrl}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                            muted
                            playsInline
                            loop
                        />

                        {/* Featured Badge */}
                        {reel.isFeatured && (
                            <div className="absolute top-3 left-3 bg-orange-500 text-white text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-wider shadow-lg flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-white" />
                                MOTOVIBE CHOICE
                            </div>
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                        <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                                    <img src={reel.userAvatar || `https://source.boringavatars.com/beam/40/${reel.userName}`} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-white text-xs font-bold truncate shadow-black drop-shadow-md">{reel.userName}</span>
                            </div>
                            <p className="text-white/80 text-[10px] line-clamp-2 font-medium leading-relaxed drop-shadow-md">
                                {reel.caption}
                            </p>
                        </div>

                        {/* Play Icon */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Player Modal */}
            <AnimatePresence>
                {selectedReelIndex !== null && (
                    <ReelPlayer
                        reels={reels}
                        initialIndex={selectedReelIndex}
                        onClose={() => setSelectedReelIndex(null)}
                        currentUser={user}
                    />
                )}
            </AnimatePresence>

            {/* Upload Modal */}
            <AnimatePresence>
                {isUploadOpen && (
                    <ReelUploadModal
                        isOpen={isUploadOpen}
                        onClose={() => setIsUploadOpen(false)}
                        onUploadComplete={fetchReels}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};
