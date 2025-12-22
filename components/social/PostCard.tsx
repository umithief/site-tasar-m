
import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { SocialPost } from '../../types';
import { socialService } from '../../services/socialService';

interface PostCardProps {
    post: SocialPost;
    currentUserId?: string;
}

export const PostCard: React.FC<PostCardProps> = memo(({ post, currentUserId }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(typeof post.likes === 'number' ? post.likes : 0);

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!currentUserId) return;
        const newState = !isLiked;
        setIsLiked(newState);
        setLikeCount(prev => newState ? prev + 1 : prev - 1);
        try { await socialService.likePost(post._id, currentUserId); } catch { setIsLiked(!newState); setLikeCount(prev => !newState ? prev + 1 : prev - 1); }
    };

    return (
        <motion.div
            className="group relative w-full bg-[#0A0A0A] overflow-hidden cursor-none" // cursor-none if using custom cursor, otherwise cursor-default
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* 1. VISUALS (FULL BLEED) */}
            <div className="relative w-full aspect-[4/5] md:aspect-[16/10] overflow-hidden">
                {post.images && post.images.length > 0 ? (
                    <motion.img
                        src={post.images[0]}
                        alt="Visual"
                        className="w-full h-full object-cover filter brightness-[0.85] group-hover:brightness-100 grayscale-[20%] group-hover:grayscale-0 transition-all duration-700 ease-[0.16,1,0.3,1]"
                        whileHover={{ scale: 1.05 }}
                    />
                ) : (
                    <div className="w-full h-full bg-[#111] flex items-center justify-center">
                        <p className="text-gray-700 font-mono text-xs">NO_SIGNAL</p>
                    </div>
                )}

                {/* Lazy Parallax / Scanline Effect (Optional) */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
            </div>

            {/* 2. INFO OVERLAY (HOVER REVEAL) */}
            <motion.div
                className="absolute inset-x-0 bottom-0 p-8 z-20 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/50 to-transparent backdrop-blur-[2px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : 20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {/* Meta Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-[#FF4500] rounded-full animate-pulse" />
                        <span className="text-xs font-bold tracking-[0.2em] text-white uppercase">{post.userName}</span>
                    </div>
                    <span className="font-mono text-[10px] text-gray-500">{post.timestamp}</span>
                </div>

                {/* Title / Content */}
                <h2 className="text-2xl md:text-3xl font-light text-white tracking-wide uppercase leading-tight mb-2 font-display">
                    {post.content.length > 60 ? post.content.substring(0, 60) + "..." : post.content}
                </h2>
                {post.bikeModel && (
                    <p className="text-[10px] font-mono text-gray-500 mb-6 uppercase tracking-widest">
                        Model: {post.bikeModel}
                    </p>
                )}

                {/* Micro Interactions */}
                <div className="flex items-center gap-8">
                    <button onClick={handleLike} className="flex items-center gap-2 group/btn hover:text-[#FF4500] transition-colors">
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-[#FF4500] text-[#FF4500]' : 'text-white'}`} strokeWidth={1.5} />
                        <span className="font-mono text-xs text-gray-400 group-hover/btn:text-white">{likeCount}</span>
                    </button>

                    <button className="flex items-center gap-2 group/btn hover:text-white transition-colors">
                        <MessageCircle className="w-5 h-5 text-gray-500 group-hover/btn:text-white" strokeWidth={1.5} />
                    </button>

                    <button className="ml-auto text-[10px] font-bold text-gray-600 hover:text-white uppercase tracking-[0.2em] transition-colors">
                        READ_FULL_LOG
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
});
