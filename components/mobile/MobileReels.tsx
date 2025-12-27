import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, MoreHorizontal, Music } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';

interface MobileReelsProps {
    reels: any[];
    onBack?: () => void;
    currentUser?: any;
}

export const MobileReels: React.FC<MobileReelsProps> = ({ reels, onBack, currentUser }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [likedReels, setLikedReels] = useState<Record<string, boolean>>({});
    const [showMuteIcon, setShowMuteIcon] = useState(false);

    const containerRef = useRef<HTMLDivElement>(null);
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;

            const index = Math.round(containerRef.current.scrollTop / window.innerHeight);
            if (index !== activeIndex && index >= 0 && index < reels.length) {
                setActiveIndex(index);
            }
        };

        const container = containerRef.current;
        container?.addEventListener('scroll', handleScroll);
        return () => container?.removeEventListener('scroll', handleScroll);
    }, [activeIndex, reels.length]);

    useEffect(() => {
        videoRefs.current.forEach((video, index) => {
            if (video) {
                if (index === activeIndex) {
                    video.currentTime = 0;
                    video.play().catch(() => { });
                } else {
                    video.pause();
                }
            }
        });
    }, [activeIndex]);

    const toggleMute = () => {
        setIsMuted(!isMuted);
        setShowMuteIcon(true);
        setTimeout(() => setShowMuteIcon(false), 1500);
    };

    const toggleLike = (id: string) => {
        setLikedReels(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    return (
        <div
            ref={containerRef}
            className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-black no-scrollbar"
        >
            {reels.map((reel, index) => (
                <div key={reel._id || index} className="relative h-[100dvh] w-full snap-start flex items-center justify-center bg-zinc-900">

                    {/* Video Player */}
                    <div className="absolute inset-0" onClick={toggleMute}>
                        <video
                            ref={el => videoRefs.current[index] = el}
                            src={reel.videoUrl}
                            className="h-full w-full object-cover"
                            loop
                            muted={isMuted}
                            playsInline
                        />

                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80 pointer-events-none" />
                    </div>

                    {/* Mute Animation */}
                    <AnimatePresence>
                        {showMuteIcon && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.5 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
                            >
                                <div className="p-4 bg-black/60 rounded-full backdrop-blur-md">
                                    {isMuted ? <VolumeX className="w-8 h-8 text-white" /> : <Volume2 className="w-8 h-8 text-white" />}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Right Sidebar Actions */}
                    <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-20">
                        {/* Like */}
                        <div className="flex flex-col items-center gap-1">
                            <motion.button
                                whileTap={{ scale: 0.8 }}
                                onClick={() => toggleLike(reel._id)}
                                className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center"
                            >
                                <Heart className={`w-6 h-6 ${likedReels[reel._id] ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                            </motion.button>
                            <span className="text-xs font-bold text-white">{reel.likes || 0}</span>
                        </div>

                        {/* Comment */}
                        <div className="flex flex-col items-center gap-1">
                            <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </button>
                            <span className="text-xs font-bold text-white">{reel.comments?.length || 0}</span>
                        </div>

                        {/* Share */}
                        <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                            <Share2 className="w-6 h-6 text-white" />
                        </button>

                        {/* More */}
                        <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                            <MoreHorizontal className="w-6 h-6 text-white" />
                        </button>

                        {/* Music Disc Animation */}
                        <div className="mt-4 relative">
                            <div className="w-10 h-10 rounded-full bg-zinc-800 border-[3px] border-zinc-900 flex items-center justify-center animate-spin-slow">
                                <UserAvatar src={reel.userAvatar} name={reel.userName} size={28} />
                            </div>
                            <div className="absolute -top-4 -right-2 text-white/50 animate-pulse">
                                <Music className="w-4 h-4" />
                            </div>
                        </div>
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-20 left-0 right-16 px-4 z-20">
                        <div className="flex items-center gap-3 mb-3">
                            <UserAvatar src={reel.userAvatar} name={reel.userName} size={36} className="border-2 border-white" />
                            <div>
                                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                                    {reel.userName}
                                    <button className="px-2 py-0.5 rounded border border-white/30 text-xs font-bold text-white backdrop-blur-sm">Takip Et</button>
                                </h3>
                            </div>
                        </div>

                        <p className="text-white text-sm line-clamp-2 leading-relaxed">
                            {reel.caption}
                            <span className="text-gray-400 font-bold ml-1">#motovibe</span>
                        </p>

                        <div className="flex items-center gap-2 mt-2 bg-white/10 w-fit px-3 py-1 rounded-full backdrop-blur-md">
                            <Music className="w-3 h-3 text-white" />
                            <div className="text-xs text-white max-w-[150px] truncate overflow-hidden whitespace-nowrap">
                                <div className="animate-marquee inline-block">
                                    Seslendirme • {reel.userName} • Original Audio
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            ))}
        </div>
    );
};
