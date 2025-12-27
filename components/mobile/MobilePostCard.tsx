import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark } from 'lucide-react';
import { SocialPost } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { socialService } from '../../services/socialService';

import { MobileBottomSheet } from './MobileBottomSheet';

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

    // Comment States
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(post.commentList || []);
    const [commentCount, setCommentCount] = useState(typeof post.comments === 'number' ? post.comments : (Array.isArray(post.comments) ? post.comments.length : 0));

    const handlePostComment = async () => {
        if (!commentText.trim()) return; // Silent fail if no text/no user

        // Optimistic
        const newComment = {
            _id: Date.now().toString(),
            authorName: 'Sen', // You might want to grab real user name if available
            content: commentText,
            timestamp: new Date().toISOString()
        };

        setComments(prev => [...prev, newComment]);
        setCommentCount(prev => prev + 1);
        setCommentText('');

        try {
            const response: any = await socialService.commentPost(post._id, {
                authorId: currentUserId || 'guest',
                authorName: 'User', // Needs real data
                content: newComment.content
            });
            if (response && response.data && response.data.comments) {
                setComments(response.data.comments);
            }
        } catch (error) {
            console.error('Comment failed', error);
        }
    };

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
                        onClick={() => setShowComments(true)}
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

            {/* Comments Sheet */}
            <MobileBottomSheet
                isOpen={showComments}
                onClose={() => setShowComments(false)}
                title="Yorumlar"
            >
                <div className="space-y-4">
                    {comments.map((comment) => (
                        <div key={comment._id || Math.random().toString()} className="flex gap-3">
                            <UserAvatar name={typeof comment.authorName === 'string' ? comment.authorName : 'User'} size={32} className="mt-1" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-300">
                                    <span className="text-white font-bold mr-2">{typeof comment.authorName === 'string' ? comment.authorName : 'User'}</span>
                                    {typeof comment.content === 'string' ? comment.content : ''}
                                </p>
                            </div>
                        </div>
                    ))}
                    {comments.length === 0 && (
                        <p className="text-gray-500 text-center py-8">Henüz yorum yok.</p>
                    )}
                </div>

                {/* Comment Input */}
                <div className="sticky bottom-0 bg-zinc-900 pt-4 mt-4 border-t border-white/5 flex gap-3">
                    <UserAvatar name="Sen" size={32} />
                    <div className="flex-1 relative">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Yorum ekle..."
                            className="w-full bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-moto-accent focus:ring-0 outline-none"
                            onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                        />
                        <button
                            onClick={handlePostComment}
                            disabled={!commentText.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-moto-accent font-bold text-xs disabled:opacity-50"
                        >
                            GÖNDER
                        </button>
                    </div>
                </div>
            </MobileBottomSheet>
        </div>
    );
});
