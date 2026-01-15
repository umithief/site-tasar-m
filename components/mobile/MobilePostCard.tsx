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
        <div className="mx-2 mb-6 bg-white dark:bg-[#121212] rounded-[40px] overflow-hidden border border-gray-100 dark:border-white/5 shadow-xl dark:shadow-2xl snap-center relative transition-colors duration-300">
            {/* Header */}
            <div className="px-5 py-4 flex items-center justify-between bg-gradient-to-b from-white/90 dark:from-black/50 to-transparent absolute top-0 left-0 right-0 z-10 pointer-events-none">
                <div
                    className="flex items-center gap-3 pointer-events-auto"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Direct navigation to profile
                        if (onNavigate && post.userId) {
                            const target = (post as any).username || post.userId;
                            onNavigate('public-profile', { userId: post.userId, username: target });
                        }
                    }}
                >
                    <div className="p-0.5 bg-black/5 dark:bg-white/20 backdrop-blur-md rounded-full">
                        <UserAvatar name={post.userName} src={post.userAvatar} size={36} />
                    </div>
                    <div className="flex flex-col drop-shadow-md">
                        <span className="text-gray-900 dark:text-white font-bold text-sm leading-none tracking-wide">{post.userName}</span>
                        {post.bikeModel && (
                            <span className="text-gray-600 dark:text-white/80 text-[10px] font-medium">{post.bikeModel}</span>
                        )}
                    </div>
                </div>
                <button
                    className="w-8 h-8 rounded-full bg-black/5 dark:bg-black/20 backdrop-blur-md flex items-center justify-center text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 pointer-events-auto active:scale-90 transition-transform"
                    onClick={() => setShowOptions(true)}
                >
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            <MobileBottomSheet
                isOpen={showOptions}
                onClose={() => setShowOptions(false)}
                title="Gönderi Seçenekleri"
            >
                <div className="space-y-2 p-4">
                    {currentUserId === post.userId || (currentUser?.isAdmin) ? (
                        <>
                            {currentUserId === post.userId && (
                                <button
                                    onClick={() => { setIsEditing(true); setShowOptions(false); }}
                                    className="w-full flex items-center gap-3 p-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                                >
                                    <div className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center"><Edit2 className="w-4 h-4 text-blue-500" /></div>
                                    Düzenle
                                </button>
                            )}
                            <button
                                onClick={handleDelete}
                                className="w-full flex items-center gap-3 p-4 bg-red-500/10 text-red-500 rounded-2xl font-bold hover:bg-red-500/20 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><Trash2 className="w-4 h-4" /></div>
                                Gönderiyi Sil
                            </button>
                        </>
                    ) : (
                        <>
                            <button className="w-full flex items-center gap-3 p-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                                <Bookmark className="w-5 h-5" /> Kaydet
                            </button>

                            <button
                                onClick={handleShareToAdmin}
                                className="w-full flex items-center gap-3 p-4 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white rounded-2xl font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-moto-accent/10 dark:bg-moto-accent/20 flex items-center justify-center"><ShieldAlert className="w-4 h-4 text-moto-accent" /></div>
                                Admine İlet
                            </button>

                            <button
                                onClick={handleReport}
                                className="w-full flex items-center gap-3 p-4 bg-red-500/10 text-red-500 rounded-2xl font-bold hover:bg-red-500/20 transition-colors"
                            >
                                <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center"><Flag className="w-4 h-4" /></div>
                                Şikayet Et
                            </button>
                        </>
                    )}
                </div>
            </MobileBottomSheet>

            {/* Media */}
            <div
                className="relative w-full aspect-[4/5] bg-gray-100 dark:bg-gray-900 overflow-hidden"
                onClick={handleDoubleTap}
            >
                <img
                    src={post.images?.[0] || (post as any).image}
                    alt={post.userName}
                    loading="lazy"
                    className="w-full h-full object-cover"
                />

                {/* HUD Overlay (Mock or Real) */}
                <div className="absolute bottom-4 left-4 flex items-center gap-2">
                    <div className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-[#E2FF3B] rounded-full animate-pulse" />
                        <span className="text-gray-900 dark:text-white text-[10px] font-bold tracking-wider font-mono">124 KM/S</span>
                    </div>
                    <div className="bg-white/60 dark:bg-black/60 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
                        <span className="text-gray-900 dark:text-white text-[10px] font-bold tracking-wider font-mono">42° EĞİM</span>
                    </div>
                </div>

                {/* Heart Overlay Animation */}
                <AnimatePresence>
                    {showHeartOverlay && (
                        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                            <motion.div
                                initial={{ scale: 0, opacity: 0, rotate: -45 }}
                                animate={{ scale: 1.5, opacity: 1, rotate: 0 }}
                                exit={{ scale: 0, opacity: 0, rotate: 45 }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                                <Heart className="w-32 h-32 text-[#E2FF3B] fill-[#E2FF3B] drop-shadow-[0_0_20px_rgba(226,255,59,0.6)]" />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            {/* Footer Content */}
            <div className="p-5 pt-4">
                {/* Tactile Action Buttons */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handleLike}
                            className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all duration-300 ${isLiked
                                ? 'bg-[#E2FF3B] border-[#E2FF3B] shadow-[0_0_15px_rgba(226,255,59,0.4)]'
                                : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:bg-gray-200 dark:hover:bg-white/10'
                                }`}
                        >
                            <Heart className={`w-6 h-6 ${isLiked ? 'text-black fill-black' : 'text-gray-900 dark:text-white'}`} />
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={() => onCommentClick && onCommentClick()}
                            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        >
                            <MessageCircle className="w-6 h-6 text-gray-900 dark:text-white" />
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                        >
                            <Share2 className="w-6 h-6 text-gray-900 dark:text-white" />
                        </motion.button>
                    </div>

                    {/* Bookmark (Right) */}
                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        className="w-10 h-10 rounded-full bg-transparent flex items-center justify-center text-gray-400 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors"
                    >
                        <Bookmark className="w-6 h-6" />
                    </motion.button>
                </div>

                {/* Likes Count */}
                {likeCount > 0 && (
                    <div className="mb-2 flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="w-5 h-5 rounded-full bg-gray-200 dark:bg-zinc-800 border border-white dark:border-[#121212]" />
                            ))}
                        </div>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {likeCount} beğenme
                        </span>
                    </div>
                )}

                {/* Caption */}
                <div className="">
                    {isEditing ? (
                        <div className="flex flex-col gap-2 mb-2">
                            <textarea
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-moto-accent resize-none min-h-[80px]"
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => { setIsEditing(false); setPostContent(post.content); }}
                                    className="px-4 py-2 bg-gray-100 dark:bg-white/5 rounded-lg text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={editPending}
                                    className="px-4 py-2 bg-moto-accent rounded-lg text-xs font-bold text-black"
                                >
                                    {editPending ? '...' : 'Kaydet'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                            <span className="font-bold text-gray-900 dark:text-white mr-2 text-[15px]">{post.userName}</span>
                            {isExpanded ? postContent : (
                                <>
                                    <span className="line-clamp-2 inline">{postContent}</span>
                                    {postContent && postContent.length > 80 && (
                                        <button
                                            onClick={() => setIsExpanded(true)}
                                            className="text-gray-500 text-xs ml-1 font-bold"
                                        >
                                            devamını oku
                                        </button>
                                    )}
                                </>
                            )}
                        </p>
                    )}
                </div>

                {/* Time */}
                <div className="mt-2">
                    <span className="text-[10px] text-gray-400 dark:text-gray-600 uppercase tracking-widest font-bold">
                        {new Date((post as any).createdAt || (post as any).timestamp || Date.now()).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
                    </span>
                </div>
            </div>
        </div>
    );
});
