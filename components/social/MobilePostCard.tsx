import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreVertical, Bookmark, MapPin, Zap, Gauge, Navigation } from 'lucide-react';
import { SocialPost } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface MobilePostCardProps {
    post: SocialPost;
    currentUserId?: string;
    onLike?: (postId: string) => void;
    onComment?: (postId: string) => void;
}

export const MobilePostCard: React.FC<MobilePostCardProps> = ({ post, currentUserId, onLike, onComment }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(typeof post.likes === 'number' ? post.likes : 0);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);

    const handleDoubleTap = () => {
        if (!isLiked) {
            handleLike();
        }
        setShowHeartOverlay(true);
        setTimeout(() => setShowHeartOverlay(false), 800);
    };

    const handleLike = () => {
        const newState = !isLiked;
        setIsLiked(newState);
        setLikeCount(prev => newState ? prev + 1 : prev - 1);
        if (onLike) onLike(post._id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className="w-full bg-[#050505] mb-4 relative border-b border-white/5 pb-6"
        >
            {/* Cinematic Header (Floating over image) */}
            <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-none">
                <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-moto-accent to-transparent">
                                <img
                                    src={post.userAvatar || 'https://via.placeholder.com/40'}
                                    alt={post.userName}
                                    className="w-full h-full rounded-full object-cover border border-black"
                                />
                            </div>
                            {post.userRank && (
                                <div className="absolute -bottom-1 -right-1 bg-black text-moto-accent text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-moto-accent">
                                    PRO
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-white text-sm font-bold font-display drop-shadow-md">{post.userName}</h3>
                            <div className="flex items-center gap-2 text-[10px] text-gray-300/90 font-medium">
                                {post.location && (
                                    <span className="flex items-center gap-0.5">
                                        <MapPin className="w-2.5 h-2.5 text-moto-accent" />
                                        {post.location}
                                    </span>
                                )}
                                <span className="w-0.5 h-0.5 rounded-full bg-gray-400" />
                                <span>{formatDistanceToNow(new Date(post.timestamp || Date.now()), { addSuffix: true, locale: tr })}</span>
                            </div>
                        </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white active:bg-white/10">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Immersive Media */}
            <div
                className="relative w-full aspect-[4/5] bg-[#0A0A0A] overflow-hidden"
                onDoubleClick={handleDoubleTap}
            >
                {post.images && post.images.length > 0 ? (
                    <img
                        src={post.images[0]}
                        alt="Post"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-zinc-900/50">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                            <Zap className="w-5 h-5 text-gray-600" />
                        </div>
                    </div>
                )}

                {/* Bottom Gradient */}
                <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-transparent pointer-events-none" />

                {/* Double Tap Heart */}
                <AnimatePresence>
                    {showHeartOverlay && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0, rotate: -15 }}
                                animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                            >
                                <Heart className="w-24 h-24 text-moto-accent fill-moto-accent drop-shadow-[0_0_30px_rgba(226,255,59,0.5)]" />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Ride Stats Overlay - Floating near bottom */}
                {post.rideStats && (
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="bg-black/60 backdrop-blur-md rounded-xl p-2 flex flex-col items-center justify-center border border-white/10">
                                <Gauge className="w-3 h-3 text-moto-accent mb-1" />
                                <span className="text-lg font-mono font-bold text-white leading-none">{post.rideStats.maxSpeed}</span>
                                <span className="text-[8px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">KM/H</span>
                            </div>
                            <div className="bg-black/60 backdrop-blur-md rounded-xl p-2 flex flex-col items-center justify-center border border-white/10">
                                <Navigation className="w-3 h-3 text-moto-accent mb-1" />
                                <span className="text-lg font-mono font-bold text-white leading-none">{post.rideStats.distance}</span>
                                <span className="text-[8px] text-gray-400 uppercase font-bold tracking-wider mt-0.5">KM</span>
                            </div>
                            <div className="bg-black/60 backdrop-blur-md rounded-xl p-2 flex flex-col items-center justify-center border border-white/10 relative overflow-hidden">
                                <span className="text-[8px] text-gray-400 uppercase font-bold tracking-wider relative z-10">ROTA</span>
                                <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full opacity-40 stroke-moto-accent" fill="none" strokeWidth="2">
                                    <path d="M10,40 C30,40 30,10 50,10 C70,10 70,40 90,40" />
                                </svg>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Actions & Content */}
            <div className="px-5 relative z-20">
                <div className="flex items-center justify-between mb-4 -mt-2">
                    <div className="flex items-center gap-4">
                        <button onClick={handleLike} className="group outline-none">
                            <div className={`p-2.5 rounded-full transition-all duration-300 border ${isLiked ? 'bg-moto-accent/10 border-moto-accent/50' : 'bg-transparent border-transparent'}`}>
                                <Heart className={`w-6 h-6 transition-all ${isLiked ? 'text-moto-accent fill-moto-accent scale-110 drop-shadow-[0_0_10px_rgba(226,255,59,0.4)]' : 'text-white'}`} strokeWidth={isLiked ? 0 : 2} />
                            </div>
                        </button>
                        <button onClick={() => onComment && onComment(post._id)} className="p-2.5 rounded-full outline-none active:scale-90 transition-transform">
                            <MessageCircle className="w-6 h-6 text-white" strokeWidth={2} />
                        </button>
                        <button className="p-2.5 rounded-full outline-none active:scale-90 transition-transform">
                            <Share2 className="w-6 h-6 text-white" strokeWidth={2} />
                        </button>
                    </div>
                    <button className="p-2.5 outline-none active:scale-90 transition-transform">
                        <Bookmark className="w-6 h-6 text-white" strokeWidth={2} />
                    </button>
                </div>

                {/* Info */}
                <div className="space-y-1.5 px-1">
                    <p className="text-sm font-bold text-white flex items-center gap-2">
                        {likeCount > 0 && <span className="w-1.5 h-1.5 rounded-full bg-moto-accent box-shadow-glow" />}
                        {likeCount.toLocaleString()} beğenme
                    </p>
                    <div className="text-sm text-gray-300 leading-relaxed">
                        <span className="font-bold text-white mr-2 font-display">{post.userName}</span>
                        {post.content}
                    </div>
                    {post.comments && post.comments > 0 && (
                        <button className="text-xs text-gray-500 font-medium py-1">
                            {post.comments} yorumun tümünü gör
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
