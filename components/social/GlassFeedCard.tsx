import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Navigation } from 'lucide-react';
import { SocialPost } from '../../types';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface GlassFeedCardProps {
    post: SocialPost;
    onLike?: (id: string) => void;
    onComment?: (id: string) => void;
    onShare?: (id: string) => void;
    onUserProfileClick?: (userId: string) => void;
}

export const GlassFeedCard: React.FC<GlassFeedCardProps> = ({
    post,
    onLike,
    onComment,
    onShare,
    onUserProfileClick
}) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(post.likes);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
        onLike?.(post._id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="group relative w-full bg-[#0F1012]/60 backdrop-blur-2xl border border-white/5 rounded-[32px] shadow-xl shadow-black/40 hover:border-[#E2FF3B]/30 transition-colors duration-300 overflow-hidden"
        >
            {/* 2. CARD HEADER */}
            <div className="px-6 pt-6 pb-4 flex items-center justify-between">
                <div
                    className="flex items-center gap-4 cursor-pointer"
                    onClick={() => onUserProfileClick?.(post.userId)}
                >
                    {/* Avatar with Rank Ring */}
                    <div className="relative">
                        <div className={`absolute -inset-1 rounded-full opacity-60 blur-sm ${post.userRank === 'Yol Kaptanı' ? 'bg-amber-400' : 'bg-gray-400'}`} />
                        <img
                            src={post.userAvatar || `https://boring-avatars-api.vercel.app/api/avatar?size=40&variant=beam&name=${post.userName}`}
                            alt={post.userName}
                            className="relative w-12 h-12 rounded-full border-2 border-black object-cover"
                        />
                    </div>

                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold font-display tracking-tight text-lg">
                                {post.userName}
                            </span>
                            {/* Pro Badge */}
                            {(post.userRank === 'Yol Kaptanı' || post.userRank === 'Pro') && (
                                <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/5 text-[10px] font-bold text-white/80 font-mono">
                                    PRO SÜRÜCÜ
                                </span>
                            )}
                        </div>
                        <span className="text-gray-400 text-xs font-medium">
                            {/* Time - using date-fns or fallback */}
                            {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: tr }) : '2s önce'}
                        </span>
                    </div>
                </div>

                <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* 3. MEDIA CONTENT (FLOATING LAYER) */}
            <div className="px-4 pb-2 relative">
                <div className="relative rounded-2xl overflow-hidden bg-black/50 shadow-inner group-hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-shadow duration-500">
                    {/* Aspect Ratio Container */}
                    <div className="aspect-[4/3] w-full relative">
                        <img
                            src={post.image}
                            alt="Post content"
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                    </div>

                    {/* TELEMETRY HUD (Overlay) */}
                    {(post.rideStats && (String(post.rideStats.maxSpeed) !== "0")) && (
                        <div className="absolute bottom-4 left-4 flex gap-2">
                            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2">
                                <span className="text-lg">🚀</span>
                                <span className="text-xs font-bold text-white font-mono tracking-wider">
                                    {post.rideStats?.maxSpeed || 124} KM/S
                                </span>
                            </div>
                            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-lg px-3 py-1.5 flex items-center gap-2">
                                <span className="text-lg">📍</span>
                                <span className="text-xs font-bold text-white font-mono tracking-wider">
                                    {post.rideStats?.leanAngle || 42}° EĞİM
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* CAPTION (Optional) */}
            {post.content && (
                <div className="px-6 py-2">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        {post.content} <span className="text-[#E2FF3B]/80 font-medium">#MotoVibe</span>
                    </p>
                </div>
            )}

            {/* 4. ACTION BAR (FOOTER) */}
            <div className="px-6 pb-6 pt-2 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Like Button */}
                    <button
                        onClick={handleLike}
                        className="group/btn flex items-center gap-2 focus:outline-none"
                    >
                        <motion.div
                            whileTap={{ scale: 0.8 }}
                            animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
                        >
                            <Heart
                                className={`w-6 h-6 transition-colors duration-300 ${isLiked
                                    ? 'fill-[#E2FF3B] text-[#E2FF3B]'
                                    : 'text-gray-400 group-hover/btn:text-white'
                                    }`}
                                strokeWidth={isLiked ? 0 : 2}
                            />
                        </motion.div>
                        <span className={`text-sm font-bold font-mono transition-colors ${isLiked ? 'text-[#E2FF3B]' : 'text-gray-500'
                            }`}>
                            {likeCount}
                        </span>
                    </button>

                    {/* Comment Button */}
                    <button
                        onClick={() => onComment?.(post._id)}
                        className="group/btn flex items-center gap-2"
                    >
                        <MessageCircle className="w-6 h-6 text-gray-400 group-hover/btn:text-white transition-colors" />
                        <span className="text-sm font-bold text-gray-500 font-mono">
                            {post.comments}
                        </span>
                    </button>

                    {/* Share Button */}
                    <button onClick={() => onShare?.(post._id)} className="group/btn">
                        <Share2 className="w-6 h-6 text-gray-400 group-hover/btn:text-white transition-colors" />
                    </button>

                </div>

                {/* Save/Bookmark */}
                <button className="text-gray-400 hover:text-white transition-colors">
                    <Bookmark className="w-6 h-6" />
                </button>
            </div>
        </motion.div>
    );
};
