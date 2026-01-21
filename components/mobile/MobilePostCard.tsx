import React, { useState, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Trash2, Edit2, Flag, ShieldAlert } from 'lucide-react';
import { SocialPost } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { socialService } from '../../services/socialService';

import { MobileBottomSheet } from './MobileBottomSheet';
import { MobileComments } from './MobileComments'; // Import Added
import { useAuthStore } from '../../store/authStore';
import { useFollow } from '../../hooks/useFollow';
import { PostActionsBar } from '../social/PostActionsBar';

interface MobilePostCardProps {
    post: SocialPost;
    currentUserId?: string;
    onNavigate?: (view: any, data?: any) => void;
    onCommentClick?: () => void;
}

export const MobilePostCard: React.FC<MobilePostCardProps> = memo(({ post, currentUserId, onNavigate, onCommentClick }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    // Safe access for likes count with fallback
    const [likeCount, setLikeCount] = useState(
        typeof (post.likes as any) === 'number'
            ? (post.likes as number)
            : (Array.isArray(post.likes) ? (post.likes as any[]).length : 0)
    );
    const [postContent, setPostContent] = useState(post.content);
    const [isEditing, setIsEditing] = useState(false);
    const [editPending, setEditPending] = useState(false);

    const [lastTap, setLastTap] = useState(0);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [imageOrientation, setImageOrientation] = useState<'portrait' | 'landscape'>('portrait');

    const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>) => {
        const { naturalWidth, naturalHeight } = event.currentTarget;
        if (naturalWidth > naturalHeight) {
            setImageOrientation('landscape');
        } else {
            setImageOrientation('portrait');
        }
    };

    // Live Follow Logic
    const { mutate: toggleFollow, isPending } = useFollow();
    const { user: currentUser } = useAuthStore();

    // Determine follow status from store (single source of truth)
    const isFollowing = useMemo(() => {
        if (!currentUser || !currentUser.following) return false;

        const followingList = Array.isArray(currentUser.following)
            ? currentUser.following
            : [];

        return followingList.some(f => {
            const fId = (typeof f === 'object' && f !== null) ? (f._id || f.id) : f;
            if (!fId || !post.userId) return false;
            return fId.toString() === post.userId.toString();
        });
    }, [currentUser?.following, post.userId]);

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
            setTimeout(() => setShowHeartOverlay(false), 2000);
        }
        setLastTap(now);
    };

    const handleDelete = async () => {
        if (confirm('Bu gönderiyi silmek istediğine emin misin?')) {
            await socialService.deletePost(post._id);
            // In a real app, we'd invalidate queries here
            setShowOptions(false);
            window.location.reload();
        }
    };

    const handleUpdate = async () => {
        if (!postContent.trim()) return;
        setEditPending(true);
        try {
            await socialService.updatePost(post._id, postContent);
            setIsEditing(false);
        } catch (error) {
            alert('Güncelleme başarısız.');
        } finally {
            setEditPending(false);
        }
    };

    const handleReport = async () => {
        await socialService.reportPost(post._id, 'inappropriate');
        setShowOptions(false);
        alert('Gönderi raporlandı.');
    };

    const handleShareToAdmin = async () => {
        await socialService.shareToAdmin(post._id);
        setShowOptions(false);
        alert('Gönderi admine iletildi.');
    };

    return (
        <div className="w-full mb-8 bg-transparent">
            {/* Header - Minimal & Floating-like */}
            <div className="px-4 py-3 flex items-center justify-between">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onNavigate && post.userId && onNavigate('public-profile', { userId: post.userId, username: post.userName })}
                >
                    <UserAvatar name={post.userName} src={post.userAvatar} size={32} className="ring-2 ring-white dark:ring-black" />
                    <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900 dark:text-white leading-none">{post.userName}</span>
                        {post.location && <span className="text-[10px] text-gray-500 font-medium mt-0.5">{post.location}</span>}
                    </div>
                </div>
                <button onClick={() => setShowOptions(true)} className="p-2 -mr-2 text-gray-500">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Media - Immersive Full Width */}
            <div
                className={`relative w-full ${imageOrientation === 'landscape' ? 'aspect-video' : 'aspect-[4/5]'} bg-gray-100 dark:bg-zinc-900 overflow-hidden rounded-[2rem] transition-all duration-500 ease-in-out`}
                onClick={handleDoubleTap}
            >
                <img
                    src={post.images?.[0] || (post as any).image}
                    alt="Post"
                    className="w-full h-full object-cover"
                    loading="eager"
                    onLoad={handleImageLoad}
                />

                {/* Heart Animation Overlay */}
                <AnimatePresence>
                    {showHeartOverlay && (
                        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
                            <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1.2, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Heart className="w-24 h-24 text-white fill-white drop-shadow-xl" />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions & Content */}
            <div className="px-2 pt-3">
                <div className="flex items-center justify-between mb-3 px-2">
                    <div className="flex items-center gap-5">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={handleLike}
                            className="flex items-center gap-1.5"
                        >
                            <Heart className={`w-7 h-7 ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-900 dark:text-white'}`} strokeWidth={1.5} />
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onCommentClick && onCommentClick()}
                            className="flex items-center gap-1.5"
                        >
                            <MessageCircle className="w-7 h-7 text-gray-900 dark:text-white" strokeWidth={1.5} />
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="flex items-center gap-1.5"
                        >
                            <Share2 className="w-7 h-7 text-gray-900 dark:text-white" strokeWidth={1.5} />
                        </motion.button>
                    </div>

                    <motion.button whileTap={{ scale: 0.9 }}>
                        <Bookmark className="w-7 h-7 text-gray-900 dark:text-white" strokeWidth={1.5} />
                    </motion.button>
                </div>

                {/* Likes & Caption - Clean Text */}
                <div className="px-2 space-y-1.5">
                    {likeCount > 0 && (
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {likeCount.toLocaleString()} beğenme
                        </div>
                    )}

                    <div className="text-sm leading-relaxed text-gray-800 dark:text-gray-200">
                        <span className="font-bold mr-2 text-gray-900 dark:text-white">{post.userName}</span>
                        {isExpanded || !postContent || postContent.length < 90 ? (
                            postContent
                        ) : (
                            <>
                                {postContent.slice(0, 90)}...
                                <button onClick={() => setIsExpanded(true)} className="text-gray-500 ml-1">devamı</button>
                            </>
                        )}
                    </div>

                    {post.comments > 0 && (
                        <button
                            onClick={() => onCommentClick && onCommentClick()}
                            className="text-gray-500 text-sm mt-1"
                        >
                            {post.comments} yorumun tümünü gör
                        </button>
                    )}

                    <div className="text-[10px] text-gray-400 uppercase tracking-wide pt-1">
                        {new Date((post as any).createdAt || (post as any).timestamp || Date.now()).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                    </div>
                </div>
            </div>

            {/* Options Sheet */}
            <MobileBottomSheet
                isOpen={showOptions}
                onClose={() => setShowOptions(false)}
                title="Seçenekler"
            >
                <div className="p-4 space-y-2">
                    {currentUserId === post.userId ? (
                        <>
                            <button onClick={handleDelete} className="w-full p-4 flex items-center gap-3 text-red-500 font-bold bg-red-50 dark:bg-red-500/10 rounded-xl">
                                <Trash2 className="w-5 h-5" /> Sil
                            </button>
                            <button onClick={() => { setIsEditing(true); setShowOptions(false); }} className="w-full p-4 flex items-center gap-3 text-gray-900 dark:text-white font-bold bg-gray-50 dark:bg-white/5 rounded-xl">
                                <Edit2 className="w-5 h-5" /> Düzenle
                            </button>
                        </>
                    ) : (
                        <button onClick={handleReport} className="w-full p-4 flex items-center gap-3 text-red-500 font-bold bg-red-50 dark:bg-red-500/10 rounded-xl">
                            <Flag className="w-5 h-5" /> Şikayet Et
                        </button>
                    )}
                </div>
            </MobileBottomSheet>
        </div>
    );
});
