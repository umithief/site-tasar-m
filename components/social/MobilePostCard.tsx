import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreVertical, Bookmark } from 'lucide-react';
import { SocialPost } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';

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
        <div className="w-full bg-black mb-6 relative">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                    <UserAvatar name={post.userName} src={post.userAvatar} size={36} />
                    <div>
                        <h3 className="text-white text-sm font-bold">{post.userName}</h3>
                        {post.bikeModel && (
                            <p className="text-xs text-gray-500">{post.bikeModel}</p>
                        )}
                    </div>
                </div>
                <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Media (Full Width) */}
            <div
                className="relative w-full aspect-[4/5] bg-gray-900 overflow-hidden"
                onDoubleClick={handleDoubleTap}
            >
                {post.images && post.images.length > 0 ? (
                    <img
                        src={post.images[0]}
                        alt="Post"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">
                        No Image
                    </div>
                )}

                {/* Double Tap Heart Animation */}
                <AnimatePresence>
                    {showHeartOverlay && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions Bar */}
            <div className="px-4 py-3 pb-1">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-6">
                        <button onClick={handleLike} className="group">
                            <Heart className={`w-7 h-7 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-white group-active:scale-90'}`} />
                        </button>
                        <button onClick={() => onComment && onComment(post._id)}>
                            <MessageCircle className="w-7 h-7 text-white" />
                        </button>
                        <button>
                            <Share2 className="w-7 h-7 text-white" />
                        </button>
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors active:scale-95">
                        <Bookmark className="w-6 h-6 text-white" />
                    </button>
                </div>

                {/* Likes & Content */}
                <div className="space-y-1">
                    <p className="text-sm font-bold text-white">{likeCount} likes</p>
                    <div className="text-sm text-white">
                        <span className="font-bold mr-2">{post.userName}</span>
                        <span className="text-gray-200">{post.content}</span>
                    </div>
                    <button className="text-xs text-gray-500 mt-1 uppercase tracking-wide">
                        {post.timestamp || 'Just now'}
                    </button>
                </div>
            </div>
        </div>
    );
};
