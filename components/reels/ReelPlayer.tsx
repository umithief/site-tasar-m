import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Heart, MessageCircle, Share2, Volume2, VolumeX, ChevronDown, ChevronUp } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { api } from '../../services/api';

interface Reel {
    _id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    videoUrl: string;
    caption: string;
    likes: number;
    views: number;
    bikeModel?: string;
    likedBy?: string[];
}

interface ReelPlayerProps {
    reels: Reel[];
    initialIndex: number;
    onClose: () => void;
    currentUser: any;
}

export const ReelPlayer: React.FC<ReelPlayerProps> = ({ reels, initialIndex, onClose, currentUser }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [isMuted, setIsMuted] = useState(false);
    const [currentReels, setCurrentReels] = useState(reels);
    const [liked, setLiked] = useState(false);

    // Video Refs
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'auto'; };
    }, []);

    useEffect(() => {
        // Handle play/pause logic based on current index
        videoRefs.current.forEach((video, index) => {
            if (video) {
                if (index === currentIndex) {
                    const currentId = currentReels[currentIndex]?._id;
                    if (!currentId) return;

                    video.currentTime = 0;
                    video.play().catch(e => console.log('Autoplay prevented:', e));
                    // Record view
                    api.post(`/reels/${currentId}/interact`, { type: 'view' });
                } else {
                    video.pause();
                }
            }
        });

        // Initial like state
        const currentReel = currentReels[currentIndex];
        if (currentReel && currentUser && currentReel.likedBy?.includes(currentUser._id)) {
            setLiked(true);
        } else {
            setLiked(false);
        }

    }, [currentIndex, currentReels]);

    const handleNext = () => {
        if (currentIndex < currentReels.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleLike = async () => {
        if (!currentUser) return; // Add login prompt logic here?

        const reel = currentReels[currentIndex];
        const newLikeState = !liked;
        setLiked(newLikeState);

        // Optimistic update
        const updatedReels = [...currentReels];
        updatedReels[currentIndex] = {
            ...reel,
            likes: newLikeState ? reel.likes + 1 : reel.likes - 1,
            likedBy: newLikeState
                ? [...(reel.likedBy || []), currentUser._id]
                : (reel.likedBy || []).filter(id => id !== currentUser._id)
        };
        setCurrentReels(updatedReels);

        try {
            await api.post(`/reels/${reel._id}/interact`, { type: 'like', userId: currentUser._id });
        } catch (error) {
            console.error('Like failed', error);
            // Revert on error
            setLiked(!newLikeState);
        }
    };

    const currentReel = currentReels[currentIndex];

    // Safe guard: If no reel is available, render nothing (or a fallback)
    if (!currentReel) return null;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-0 md:p-8 backdrop-blur-3xl"
        >
            <div className="relative w-full h-full max-w-[450px] md:h-[85vh] bg-black md:rounded-3xl overflow-hidden shadow-2xl border border-white/10">
                {/* Header / Close */}
                <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start bg-gradient-to-b from-black/60 to-transparent">
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/5 text-[10px] font-black tracking-widest text-white uppercase">
                            Velocity Reels
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-black/40 backdrop-blur-xl rounded-full text-white hover:bg-white/20 transition-colors border border-white/10">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Main Video Slider (Vertical) */}
                <div className="w-full h-full relative bg-gray-900">
                    <AnimatePresence initial={false} mode="wait">
                        <motion.div
                            key={currentIndex}
                            className="w-full h-full relative"
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -50, opacity: 0 }}
                            transition={{ type: "spring", bounce: 0, duration: 0.3 }}
                        >
                            <video
                                ref={el => videoRefs.current[currentIndex] = el}
                                src={currentReel.videoUrl}
                                className="w-full h-full object-cover"
                                loop
                                muted={isMuted}
                                playsInline
                                onClick={() => setIsMuted(!isMuted)}
                            />

                            {/* Sound Indicator */}
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-4 bg-black/40 backdrop-blur-xl rounded-full text-white/80 opacity-0 hover:opacity-100 transition-opacity"
                            >
                                {isMuted ? <VolumeX className="w-8 h-8" /> : <Volume2 className="w-8 h-8" />}
                            </button>

                            {/* Overlay Info */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/50 to-transparent pt-32">
                                <div className="flex items-end justify-between">
                                    <div className="flex-1 mr-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <UserAvatar name={currentReel.userName} src={currentReel.userAvatar} size={40} className="border-2 border-orange-500" />
                                            <div>
                                                <div className="font-bold text-white text-sm flex items-center gap-2">
                                                    {currentReel.userName}
                                                    {currentReel.bikeModel && (
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-orange-500 text-black font-black rounded uppercase">
                                                            {currentReel.bikeModel}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-white/60 font-mono">Original Audio</div>
                                            </div>
                                        </div>
                                        <p className="text-white text-sm leading-relaxed line-clamp-2">
                                            {currentReel.caption}
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col items-center gap-4">
                                        <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
                                            <div className={`p-3 rounded-full backdrop-blur-md transition-all ${liked ? 'bg-red-500/20 text-red-500' : 'bg-white/10 text-white group-hover:bg-white/20'}`}>
                                                <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
                                            </div>
                                            <span className="text-xs font-bold text-white">{currentReel.likes}</span>
                                        </button>

                                        <button className="flex flex-col items-center gap-1 group">
                                            <div className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white group-hover:bg-white/20 transition-all">
                                                <MessageCircle className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-bold text-white">0</span>
                                        </button>

                                        <button className="flex flex-col items-center gap-1 group">
                                            <div className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white group-hover:bg-white/20 transition-all">
                                                <Share2 className="w-6 h-6" />
                                            </div>
                                            <span className="text-xs font-bold text-white">Share</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Arrows */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-10">
                        <button onClick={handlePrev} disabled={currentIndex === 0} className="p-3 rounded-full bg-black/40 hover:bg-white/20 text-white disabled:opacity-30 backdrop-blur-md transition-all border border-white/10">
                            <ChevronUp className="w-6 h-6" />
                        </button>
                        <button onClick={handleNext} disabled={currentIndex === currentReels.length - 1} className="p-3 rounded-full bg-black/40 hover:bg-white/20 text-white disabled:opacity-30 backdrop-blur-md transition-all border border-white/10">
                            <ChevronDown className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
