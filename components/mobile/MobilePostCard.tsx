import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import { SocialPost } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { socialService } from '../../services/socialService';

interface MobilePostCardProps {
    post: SocialPost;
    currentUserId?: string;
    onNavigate?: (view: any, data?: any) => void;
}

export const MobilePostCard: React.FC<MobilePostCardProps> = memo(({ post, currentUserId, onNavigate }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(typeof post.likes === 'number' ? post.likes : (Array.isArray(post.likes) ? post.likes.length : 0));
    const [lastTap, setLastTap] = useState(0);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleLike = async () => {
        if (!currentUserId) return; // Silent fail or trigger auth elsewhere

        const newState = !isLiked;
        setIsLiked(newState);
        setLikeCount(prev => newState ? prev + 1 : prev - 1);

        try {
            await socialService.likePost(post._id, currentUserId);
        } catch (error) {
            setIsLiked(!newState);
            setLikeCount(prev => !newState ? prev + 1 : prev - 1);
        }
    };

    const handleDoubleTap = (e: React.MouseEvent) => {
        const now = Date.now();
        const DOUBLE_TAP_DELAY = 300;

        if (now - lastTap < DOUBLE_TAP_DELAY) {
            // Double tap detected
            if (!isLiked) handleLike();
            setShowHeartOverlay(true);
            setTimeout(() => setShowHeartOverlay(false), 1000);
        }
        setLastTap(now);
    };

    return (
        <div className="mb-4 bg-black border-b border-white/10 pb-4">
            {/* Header */}
            <div className="px-3 py-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <UserAvatar name={post.userName} src={post.userAvatar} size={32} />
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-bold text-sm leading-none">{post.userName}</span>
                            <span className="text-gray-500 text-[10px]">•</span>
                            <button className="text-moto-accent text-xs font-bold">Takip Et</button>
                        </div>
                        {post.bikeModel && (
                            <span className="text-gray-500 text-[10px] leading-tight">{post.bikeModel}</span>
                        )}
                    </div>
                </div>
                <button className="p-1 text-gray-400">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Media (Zero Margin) */}
            <div
                className="relative w-full aspect-square bg-gray-900 overflow-hidden"
                onClick={handleDoubleTap}
            >
                <img
                    src={post.images?.[0] || post.image}
                    alt="Post"
                    className="w-full h-full object-cover"
                />

                {/* Heart Overlay Animation */}
                <AnimatePresence>
                    {showHeartOverlay && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1.5, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Heart className="w-24 h-24 text-white fill-white drop-shadow-xl" />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Action Bar */}
            <div className="px-3 py-3 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={handleLike}
                        className="p-1 -ml-1"
                    >
                        <Heart
                            className={`w-7 h-7 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`}
                            strokeWidth={isLiked ? 0 : 2}
                        />
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        className="p-1"
                        onClick={() => onNavigate && onNavigate('post-detail', post)}
                    >
                        <MessageCircle className="w-7 h-7 text-white" strokeWidth={2} />
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        className="p-1"
                    >
                        <Share2 className="w-7 h-7 text-white" strokeWidth={2} />
                    </motion.button>
                </div>

                <motion.button whileTap={{ scale: 0.8 }} className="p-1 -mr-1">
                    <Bookmark className="w-7 h-7 text-white" strokeWidth={2} />
                </motion.button>
            </div>

            {/* Likes */}
            <div className="px-3 text-sm font-bold text-white mb-1">
                {likeCount} beğenme
            </div>

            {/* Caption */}
            <div className="px-3">
                <p className="text-sm text-gray-200">
                    <span className="font-bold text-white mr-2">{post.userName}</span>
                    {isExpanded ? post.content : (
                        <>
                            <span className="line-clamp-2 inline">{post.content}</span>
                            {post.content && post.content.length > 80 && (
                                <button
                                    onClick={() => setIsExpanded(true)}
                                    className="text-gray-500 text-xs ml-1"
                                >
                                    ...daha fazla
                                </button>
                            )}
                        </>
                    )}
                </p>
            </div>

            {/* Timestamp */}
            <div className="px-3 mt-1">
                <span className="text-[10px] text-gray-500 uppercase">{post.timestamp}</span>
            </div>
        </div>
    );
});
