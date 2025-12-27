import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { Heart, MessageCircle, Share2, Volume2, VolumeX, MoreHorizontal, Music, Play, Pause, Loader2, Sparkles } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { SocialPost } from '../../types'; // Assuming types align or casting
// import { useAuthStore } from '../../store/authStore'; // If needed for actions

// --- Reel Item Component ---
interface ReelItemProps {
    data: any; // Using any to be flexible with Reel/SocialPost structures
    isActive: boolean;
    isMuted: boolean;
    toggleMute: () => void;
    onToggleLike?: (id: string) => void;
    currentUser?: any;
}

const ReelItem: React.FC<ReelItemProps> = ({ data, isActive, isMuted, toggleMute, onToggleLike }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);
    const [showPlayIcon, setShowPlayIcon] = useState(false);
    const [isLiked, setIsLiked] = useState(data.isLiked || false);
    const [likesCount, setLikesCount] = useState(data.likes || 0);

    // Playback Logic
    useEffect(() => {
        if (isActive) {
            // Delay play slightly to ensure snap is done? 
            // Better to rely on isActive being accurate.
            const playVideo = async () => {
                if (videoRef.current) {
                    try {
                        videoRef.current.currentTime = 0;
                        await videoRef.current.play();
                        setIsPlaying(true);
                    } catch (err) {
                        console.log('Autoplay prevented or failed', err);
                        setIsPlaying(false);
                    }
                }
            };
            playVideo();
        } else {
            if (videoRef.current) {
                videoRef.current.pause();
                setIsPlaying(false);
            }
        }
    }, [isActive]);

    // Handle Time Update for Progress Bar
    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const current = videoRef.current.currentTime;
            const total = videoRef.current.duration;
            const percent = (current / total) * 100;
            setProgress(percent);
        }
    };

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => {
        setIsLoading(false);
        setIsPlaying(true);
    };

    // Interaction Logic
    const togglePlay = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent potentially other clicks
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
                setIsPlaying(false);
                setShowPlayIcon(true);
            } else {
                videoRef.current.play();
                setIsPlaying(true);
                setShowPlayIcon(true);
            }
            setTimeout(() => setShowPlayIcon(false), 1000);
        }
    };

    const handleLike = () => {
        const newState = !isLiked;
        setIsLiked(newState);
        setLikesCount((prev: number) => newState ? prev + 1 : prev - 1);
        if (onToggleLike) onToggleLike(data._id);
    };

    // Double Tap Like Logic (reused slightly modified)
    const [lastTap, setLastTap] = useState(0);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);

    const handleContainerClick = (e: React.MouseEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap < DOUBLE_TAP_DELAY) {
            // Double Tap
            if (!isLiked) handleLike();
            setShowHeartOverlay(true);
            setTimeout(() => setShowHeartOverlay(false), 1000);
        } else {
            // Single Tap (Toggle Play/Pause)
            // We need a slight delay to distinguish single vs double, 
            // but for a reel, instant play toggle is preferred. 
            // Usually, double tap also pauses if we bind click to pause.
            // A common pattern: Single tap toggles play/mute, Double tap likes.
            // Requirement says: "Tapping: Toggle Play/Pause". 
            // Double tap isn't explicitly requested to NOT toggle play, but usually it does not.
            // For simplicity/performance, we allow the togglePlay to fire on the single click of the double tap potentially, 
            // or we debounce. TikTok usually pauses on single tap, double tap sends like (and doesn't toggle pause if quick enough).
            // Let's implement simple togglePlay for single tap here.
            togglePlay(e);
        }
        setLastTap(now);
    };

    return (
        <div className="relative h-[100dvh] w-full snap-start flex items-center justify-center bg-black overflow-hidden select-none">
            {/* Video Container */}
            <div className="absolute inset-0" onClick={handleContainerClick}>
                <video
                    ref={videoRef}
                    src={data.videoUrl}
                    className="h-full w-full object-cover"
                    loop
                    muted={isMuted}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onWaiting={handleWaiting}
                    onPlaying={handlePlaying}
                />

                {/* Dark Gradient Overlay (Bottom) */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/90 pointer-events-none" />
            </div>

            {/* Admin/Featured Badge */}
            {data.isFeatured && (
                <div className="absolute top-16 left-4 z-30">
                    <div className="flex items-center gap-1 bg-moto-accent/90 backdrop-blur-md px-3 py-1 rounded-full shadow-[0_0_15px_rgba(255,102,0,0.5)]">
                        <Sparkles className="w-3 h-3 text-white fill-white" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Featured</span>
                    </div>
                </div>
            )}

            {/* Loading Indicator */}
            {isLoading && isActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <Loader2 className="w-10 h-10 text-moto-accent animate-spin" />
                </div>
            )}

            {/* Play/Pause Icon Animation */}
            <AnimatePresence>
                {showPlayIcon && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                    >
                        <div className="p-4 bg-black/40 rounded-full backdrop-blur-sm">
                            {isPlaying ? (
                                <Play className="w-12 h-12 text-white fill-white" />
                            ) : (
                                <Pause className="w-12 h-12 text-white fill-white" />
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Heart Overlay Animation (Double Tap) */}
            <AnimatePresence>
                {showHeartOverlay && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0, y: -100 }}
                        transition={{ duration: 0.5 }}
                        className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none"
                    >
                        <Heart className="w-32 h-32 text-red-500 fill-red-500 drop-shadow-2xl" />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Right Action Stack */}
            <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-30">
                {/* Like */}
                <div className="flex flex-col items-center gap-1">
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => { e.stopPropagation(); handleLike(); }}
                        className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <Heart className={`w-7 h-7 ${isLiked ? 'fill-red-500 text-red-500' : 'text-white'}`} strokeWidth={isLiked ? 0 : 2} />
                    </motion.button>
                    <span className="text-xs font-bold text-white drop-shadow-md">{likesCount}</span>
                </div>

                {/* Comment */}
                <div className="flex flex-col items-center gap-1">
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={(e) => { e.stopPropagation(); /* Open comments */ }}
                        className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center"
                    >
                        <MessageCircle className="w-7 h-7 text-white" strokeWidth={2} />
                    </motion.button>
                    <span className="text-xs font-bold text-white drop-shadow-md">{data.commentCount || 0}</span>
                </div>

                {/* Share */}
                <div className="flex flex-col items-center gap-1">
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center"
                    >
                        <Share2 className="w-7 h-7 text-white" strokeWidth={2} />
                    </motion.button>
                    <span className="text-xs font-bold text-white drop-shadow-md">Paylaş</span>
                </div>

                {/* Mute Toggle (Action Bar version) */}
                <motion.button
                    whileTap={{ scale: 0.8 }}
                    onClick={(e) => { e.stopPropagation(); toggleMute(); }}
                    className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center mt-2"
                >
                    {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                </motion.button>

                {/* Rotating Disc */}
                <div className="mt-4 relative animate-spin-slow">
                    <div className="w-10 h-10 rounded-full bg-zinc-900 border-[3px] border-zinc-800 flex items-center justify-center overflow-hidden">
                        <UserAvatar name={data.userName} src={data.userAvatar} size={32} />
                    </div>
                </div>
            </div>

            {/* Bottom Info */}
            <div className="absolute bottom-6 left-0 right-[80px] px-4 z-30 pointer-events-none">
                <div className="flex items-center gap-3 mb-3 pointer-events-auto">
                    <UserAvatar name={data.userName} src={data.userAvatar} size={40} className="border-2 border-white cursor-pointer" />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-base shadow-black drop-shadow-md cursor-pointer">{data.userName}</span>
                            <button className="px-2 py-0.5 bg-transparent border border-white/50 rounded-lg text-white text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm">
                                Takip Et
                            </button>
                        </div>
                        {data.location && <span className="text-xs text-gray-300 drop-shadow-md">{data.location}</span>}
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-white text-sm leading-relaxed line-clamp-2 drop-shadow-md pointer-events-auto">
                        {data.content || data.caption} <span className="font-bold text-gray-300 ml-1">#motovibe #reels</span>
                    </p>
                </div>

                <div className="flex items-center gap-2 mb-2 pointer-events-auto">
                    <div className="flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full">
                        <Music className="w-3 h-3 text-white" />
                        <div className="w-32 overflow-hidden">
                            <p className="text-xs text-white whitespace-nowrap animate-marquee">
                                Original Audio • {data.userName} • Motovibe Remix
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-white/20 z-40">
                <div
                    className="h-full bg-moto-accent transition-all duration-100 ease-linear shadow-[0_0_10px_#FFA500]"
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

// --- Main Container ---
interface MobileReelsProps {
    reels: any[]; // Or specific type
    onBack?: () => void;
}

export const MobileReels: React.FC<MobileReelsProps> = ({ reels = [], onBack }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isMuted, setIsMuted] = useState(false); // Global mute state

    // Track active slide
    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const index = Math.round(container.scrollTop / window.innerHeight);
            if (index !== activeIndex) {
                setActiveIndex(index);
            }
        };

        // Debounce could be added here for performance, but raw scroll is usually fine for this simple math
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [activeIndex]);

    if (!reels || !Array.isArray(reels) || reels.length === 0) {
        return <div className="h-[100dvh] bg-black flex items-center justify-center text-white">Reel bulunamadı</div>;
    }

    return (
        <div
            ref={containerRef}
            className="h-[100dvh] w-full overflow-y-scroll snap-y snap-mandatory scroll-smooth bg-black no-scrollbar"
        >
            {reels.map((reel, index) => (
                <ReelItem
                    key={reel._id || index}
                    data={reel}
                    isActive={index === activeIndex}
                    isMuted={isMuted}
                    toggleMute={() => setIsMuted(!isMuted)}
                />
            ))}
        </div>
    );
};
