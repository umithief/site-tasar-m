import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MapPin, Gauge } from 'lucide-react';
import { SocialPost, ViewState } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { useLikePost } from '../../hooks/usePosts';

interface PostCardProps {
    post: SocialPost;
    currentUserId?: string;
    onNavigate?: (view: ViewState, data?: any) => void;
    onCommentClick?: () => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, currentUserId, onNavigate, onCommentClick }) => {
    const { mutate: likePost } = useLikePost();
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(post.likes);

    const handleLike = () => {
        if (!currentUserId) return;
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        likePost({ postId: post._id, userId: currentUserId });
    };

    const hasRideStats = post.rideStats && (post.rideStats.maxSpeed > 0 || post.rideStats.distance > 0);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full max-w-2xl mx-auto bg-[#0D0D0D] rounded-[24px] border border-white/5 shadow-2xl overflow-hidden mb-8 group"
        >
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 cursor-pointer" onClick={() => onNavigate && onNavigate('public-profile', { _id: post.userId })}>
                    <div className="relative p-0.5 rounded-full border border-[#E2FF3B]">
                        <UserAvatar src={post.userAvatar} name={post.userName} size={40} />
                    </div>
                    <div>
                        <h3 className="text-white font-bold text-sm leading-none">{post.userName}</h3>
                        <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1">
                            <MapPin className="w-3 h-3" />
                            {post.rideStats?.routeSvg ? "İstanbul, TR" : (post.location || "Konum Yok")}
                        </div>
                    </div>
                </div>

                {hasRideStats && (
                    <div className="bg-red-500/10 text-red-500 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
                        Sport Mode
                    </div>
                )}
            </div>

            {/* Media Area with HUD */}
            <div className={`relative w-full ${post.images && post.images.length > 0 ? 'aspect-square' : 'p-4'}`}>
                {post.images && post.images.length > 0 ? (
                    <div className="relative w-full h-full overflow-hidden rounded-2xl mx-auto px-2 pb-2">
                        <img
                            src={post.images[0]}
                            alt="Post content"
                            className="w-full h-full object-cover rounded-2xl shadow-lg"
                        />

                        {/* HUD Overlay */}
                        {hasRideStats && (
                            <div className="absolute bottom-6 right-6 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-3 flex flex-col gap-1 transition-opacity duration-300 opacity-80 group-hover:opacity-100 items-end">
                                <div className="flex items-center gap-2">
                                    <span className="text-[#E2FF3B] font-mono font-bold text-lg">{post.rideStats?.maxSpeed}</span>
                                    <span className="text-xs text-zinc-400 uppercase font-medium">KM/H AVG</span>
                                </div>
                                {post.rideStats?.leanAngle && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-white font-mono font-bold text-sm">{post.rideStats.leanAngle}°</span>
                                        <span className="text-[10px] text-zinc-500 uppercase font-medium">Lean Angle</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : (
                    null
                )}
            </div>

            {/* Content & Interactions */}
            <div className="p-5 pt-2">
                {/* Interactions Bar */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <motion.button
                            onClick={handleLike}
                            whileTap={{ scale: 0.8 }}
                            className="group/like flex items-center gap-1.5"
                        >
                            <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-[#FF3E3E]/10' : 'bg-white/5 group-hover/like:bg-white/10'}`}>
                                <Heart
                                    className={`w-5 h-5 transition-all ${isLiked ? 'fill-[#FF3E3E] text-[#FF3E3E]' : 'text-zinc-500'}`}
                                />
                            </div>
                            <AnimatePresence mode='wait'>
                                <motion.span
                                    key={likeCount}
                                    initial={{ y: 5, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={`text-sm font-bold ${isLiked ? 'text-[#FF3E3E]' : 'text-zinc-500'}`}
                                >
                                    {likeCount}
                                </motion.span>
                            </AnimatePresence>
                        </motion.button>

                        <button
                            onClick={onCommentClick}
                            className="group/comment flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors"
                        >
                            <div className="p-2 rounded-full bg-white/5 group-hover/comment:bg-white/10 transition-colors">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium">{post.comments || 0}</span>
                        </button>
                    </div>

                    <button className="text-zinc-500 hover:text-white transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <p className="text-zinc-300 text-sm leading-relaxed">
                        {post.content}
                    </p>
                    {/* Hashtags Mockup - we can extract from content or just append */}
                    <div className="flex gap-2 text-[#E2FF3B] text-xs font-medium cursor-pointer">
                        <span className="hover:text-white transition-colors hover:shadow-[0_0_10px_rgba(226,255,59,0.3)]">#motolife</span>
                        <span className="hover:text-white transition-colors hover:shadow-[0_0_10px_rgba(226,255,59,0.3)]">#nightride</span>
                    </div>

                    <div className="text-[10px] text-zinc-600 font-medium uppercase tracking-widest pt-2">
                        {post.timestamp || "Az Önce"}
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
