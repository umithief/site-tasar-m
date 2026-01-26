import React, { useState, memo, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Bookmark, Trash2, Edit2, Flag, ShieldAlert, UserPlus, UserMinus, UserX, Copy } from 'lucide-react';
import { SocialPost } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { socialService } from '../../services/socialService';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

import { MobileBottomSheet } from './MobileBottomSheet';
import { MobileComments } from './MobileComments'; // Import Added
import { useAuthStore } from '../../store/authStore';
import { useFollow } from '../../hooks/useFollow';
import { PostActionsBar } from '../social/PostActionsBar';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface MobilePostCardProps {
    post: SocialPost;
    currentUserId?: string;
    onNavigate?: (view: any, data?: any) => void;
    onCommentClick?: () => void;
    priority?: boolean;
}

export const MobilePostCard: React.FC<MobilePostCardProps> = memo(({ post, currentUserId, onNavigate, onCommentClick, priority = false }) => {
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
    const [isSaved, setIsSaved] = useState(post.isSaved || false);

    const [lastTap, setLastTap] = useState(0);
    const [showHeartOverlay, setShowHeartOverlay] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showOptions, setShowOptions] = useState(false);

    // Comment Handling
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState<any[]>([]);
    const [loadingComments, setLoadingComments] = useState(false);

    // Live Follow Logic
    const { mutate: toggleFollow, isPending } = useFollow();
    const { user: currentUser } = useAuthStore();

    // Determine follow status from store (single source of truth)
    const isFollowing = useMemo(() => {
        if (!currentUser || !currentUser.following) return false;
        if (currentUser._id === post.userId) return true; // Can't follow self, but treat as "following" to hide button

        const followingList = Array.isArray(currentUser.following)
            ? currentUser.following
            : [];

        return followingList.some(f => {
            const fId = (typeof f === 'object' && f !== null) ? (f._id || f.id) : f;
            if (!fId || !post.userId) return false;
            return fId.toString() === post.userId.toString();
        });
    }, [currentUser?.following, post.userId, currentUser?._id]);

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

    const handleSave = async () => {
        const newState = !isSaved;
        setIsSaved(newState);
        try {
            await socialService.savePost(post._id);
        } catch (error) {
            setIsSaved(!newState);
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

    const handleToggleFollow = () => {
        if (!post.userId) return;
        toggleFollow({ targetUserId: post.userId, isCurrentlyFollowing: isFollowing });
        setShowOptions(false); // Close menu if triggered from there
    };

    const handleShowComments = async () => {
        setShowComments(true);
        if (comments.length === 0) {
            setLoadingComments(true);
            try {
                const fetchedComments = await socialService.getComments(post._id);
                setComments(fetchedComments);
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingComments(false);
            }
        }
    };

    const handleAddComment = async (text: string) => {
        // Optimistic update
        const newComment = {
            _id: Math.random().toString(),
            content: text,
            authorName: currentUser?.name || 'Ben',
            authorAvatar: currentUser?.avatar || currentUser?.profileImage,
            createdAt: new Date().toISOString()
        };
        setComments(prev => [...prev, newComment]);

        try {
            await socialService.commentPost(post._id, text);
            // Refresh logic could go here
        } catch (err) {
            console.error('Comment failed', err);
        }
    };

    return (
        <div className="mx-3 mb-8 bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] border border-gray-100 dark:border-white/10 shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] dark:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* Header - Minimal & Floating-like */}
            <div className="px-5 py-4 flex items-center justify-between">
                <div
                    className="flex items-center gap-3 cursor-pointer"
                    onClick={() => onNavigate && post.userId && onNavigate('public-profile', { userId: post.userId, username: post.userName })}
                >
                    <UserAvatar name={post.userName} src={post.userAvatar} size={40} className="ring-2 ring-gray-50 dark:ring-black" />
                    <div className="flex flex-col">
                        <span className="text-[15px] font-bold text-gray-900 dark:text-white leading-none">{post.userName}</span>
                        {post.location && <span className="text-[11px] text-gray-500 font-medium mt-1">{post.location}</span>}
                    </div>
                </div>

                <div className="flex items-center gap-1">
                    {!isFollowing && currentUserId !== post.userId && (
                        <button
                            onClick={(e) => { e.stopPropagation(); handleToggleFollow(); }}
                            className="bg-moto-accent text-black text-[10px] font-bold px-3 py-1.5 rounded-full mr-2 hover:bg-moto-accent/90 transition-colors"
                        >
                            Takip Et
                        </button>
                    )}
                    <button onClick={() => setShowOptions(true)} className="p-2 -mr-2 text-gray-400 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Media - Dynamic Aspect Ratio */}
            <div
                className="relative w-full bg-gray-50 dark:bg-black overflow-hidden"
                onClick={handleDoubleTap}
            >
                {priority ? (
                    <img
                        src={post.images?.[0] || (post as any).image}
                        alt="Post"
                        className="w-full h-auto max-h-[135vw] object-cover" // Limit max height to avoid super tall images
                        loading="eager"
                    />
                ) : (
                    <LazyLoadImage
                        src={post.images?.[0] || (post as any).image}
                        alt="Post"
                        className="w-full h-auto max-h-[135vw] object-cover"
                        effect="blur"
                        wrapperClassName="w-full h-auto"
                        width="100%"
                    />
                )}

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
                            onClick={handleShowComments}
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

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleSave}
                    >
                        <Bookmark className={`w-7 h-7 ${isSaved ? 'text-moto-accent fill-moto-accent' : 'text-gray-900 dark:text-white'}`} strokeWidth={1.5} />
                    </motion.button>
                </div>

                {/* Likes & Caption - Clean Text */}
                <div className="px-3 pb-4 space-y-2">
                    {likeCount > 0 && (
                        <div className="text-sm font-bold text-gray-900 dark:text-white">
                            {likeCount.toLocaleString()} beğenme
                        </div>
                    )}

                    <div className="text-[15px] leading-relaxed text-gray-800 dark:text-gray-200">
                        <span className="font-bold mr-2 text-gray-900 dark:text-white">{post.userName}</span>
                        {isExpanded || !postContent || postContent.length < 90 ? (
                            <span className="font-normal">{postContent}</span>
                        ) : (
                            <span className="font-normal">
                                {postContent.slice(0, 90)}...
                                <button onClick={() => setIsExpanded(true)} className="text-gray-500 dark:text-gray-400 ml-1 font-medium">devamı</button>
                            </span>
                        )}
                    </div>

                    {post.comments > 0 && (
                        <button
                            onClick={handleShowComments}
                            className="text-gray-500 dark:text-gray-400 text-sm font-medium mt-1 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            {post.comments} yorumun tümünü gör
                        </button>
                    )}

                    <div className="text-[12px] text-gray-400 font-medium tracking-wide pt-1">
                        {formatDistanceToNow(new Date((post as any).createdAt || (post as any).timestamp || Date.now()), { addSuffix: true, locale: tr })}
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
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Bağlantı kopyalandı');
                                    setShowOptions(false);
                                }}
                                className="w-full p-4 flex items-center gap-3 text-gray-900 dark:text-white font-bold bg-gray-50 dark:bg-white/5 rounded-xl"
                            >
                                <Copy className="w-5 h-5" /> Linki Kopyala
                            </button>
                        </>
                    ) : (
                        <>
                            {!isFollowing && (
                                <button onClick={handleToggleFollow} className="w-full p-4 flex items-center gap-3 text-blue-500 font-bold bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                                    <UserPlus className="w-5 h-5" /> Takip Et
                                </button>
                            )}
                            {isFollowing && (
                                <button onClick={handleToggleFollow} className="w-full p-4 flex items-center gap-3 text-gray-700 dark:text-gray-300 font-bold bg-gray-50 dark:bg-white/5 rounded-xl">
                                    <UserMinus className="w-5 h-5" /> Takipten Çık
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Bağlantı kopyalandı');
                                    setShowOptions(false);
                                }}
                                className="w-full p-4 flex items-center gap-3 text-gray-900 dark:text-white font-bold bg-gray-50 dark:bg-white/5 rounded-xl"
                            >
                                <Copy className="w-5 h-5" /> Linki Kopyala
                            </button>
                            <button onClick={handleReport} className="w-full p-4 flex items-center gap-3 text-red-500 font-bold bg-red-50 dark:bg-red-500/10 rounded-xl">
                                <Flag className="w-5 h-5" /> Şikayet Et
                            </button>
                            <button onClick={() => { alert('Kullanıcı engellendi.'); setShowOptions(false); }} className="w-full p-4 flex items-center gap-3 text-red-500 font-bold bg-red-50 dark:bg-red-500/10 rounded-xl">
                                <UserX className="w-5 h-5" /> Engelle
                            </button>
                        </>
                    )}
                </div>
            </MobileBottomSheet>

            {/* Comments Sheet */}
            <MobileBottomSheet
                isOpen={showComments}
                onClose={() => setShowComments(false)}
                title={`Yorumlar (${post.comments})`}
            >
                <div className="h-[70vh]">
                    {loadingComments ? (
                        <div className="flex items-center justify-center h-full text-gray-500">Yorumlar yükleniyor...</div>
                    ) : (
                        <MobileComments
                            postId={post._id}
                            comments={comments}
                            currentUserAvatar={currentUser?.avatar}
                            onAddComment={handleAddComment}
                            onLikeComment={() => { }}
                        />
                    )}
                </div>
            </MobileBottomSheet>
        </div>
    );
});
