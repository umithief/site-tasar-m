import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Zap, MapPin, MoreVertical, Trash2, Edit2, Flag, Bookmark } from 'lucide-react';
import { SocialPost } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { socialService } from '../../services/socialService';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface PostCardProps {
    post: SocialPost;
    onLike?: (id: string) => void;
    onComment?: (id: string) => void;
    onNavigate?: (view: string, data?: any) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment, onNavigate }) => {
    const { user: currentUser } = useAuthStore();
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [postContent, setPostContent] = useState(post.content);

    const [showHeartOverlay, setShowHeartOverlay] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editPending, setEditPending] = useState(false);

    const handleLike = async () => {
        if (!currentUser) return;

        // Optimistic UI
        const newStatus = !isLiked;
        setIsLiked(newStatus);
        setLikesCount(prev => newStatus ? prev + 1 : prev - 1);

        if (newStatus) {
            setShowHeartOverlay(true);
            setTimeout(() => setShowHeartOverlay(false), 2000);
        }

        // Call API
        if (onLike) onLike(post._id);
        else {
            try {
                await socialService.likePost(post._id, currentUser._id);
            } catch (error) {
                // Revert if failed
                setIsLiked(!newStatus);
                setLikesCount(prev => !newStatus ? prev + 1 : prev - 1);
            }
        }
    };

    const handleDelete = async () => {
        if (confirm('Bu gönderiyi silmek istediğine emin misin?')) {
            try {
                await socialService.deletePost(post._id);
                setShowOptions(false);
                window.location.reload();
            } catch (error) {
                alert('Silme işlemi başarısız.');
            }
        }
    };

    const handleUpdate = async () => {
        if (!postContent.trim()) return;
        setEditPending(true);
        try {
            await socialService.updatePost(post._id, postContent);
            setIsEditing(false);
            setShowOptions(false);
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

    const handleProfileClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onNavigate && post.userId) {
            onNavigate('public-profile', { userId: post.userId, username: post.userName });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ type: "spring", stiffness: 40, damping: 20 }}
            className="w-full max-w-[550px] mx-auto mb-12 group relative perspective-1000"
        >
            {/* Main Card Container - Ultra Minimal */}
            <div className="relative bg-white dark:bg-[#0A0A0A] rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-gray-100 dark:border-white/5">

                {/* 1. Cinematic Header (Floating) */}
                <div className="absolute top-0 left-0 right-0 p-6 z-30 bg-gradient-to-b from-white/90 dark:from-black/80 via-white/50 dark:via-black/40 to-transparent pointer-events-none">
                    <div className="flex items-center justify-between pointer-events-auto">
                        <div
                            className="flex items-center gap-4 cursor-pointer"
                            onClick={handleProfileClick}
                        >
                            {/* Avatar with Glow Ring */}
                            <div className="relative group/avatar">
                                <div className="absolute -inset-2 bg-moto-accent/20 rounded-full blur-md opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-500" />
                                <div className="relative p-[2px] rounded-full bg-gradient-to-br from-moto-accent to-gray-200 dark:to-white/10">
                                    <div className="p-[2px] bg-white dark:bg-black rounded-full">
                                        <img
                                            src={post.userAvatar || 'https://via.placeholder.com/40'}
                                            alt={post.userName}
                                            className="w-10 h-10 rounded-full object-cover"
                                        />
                                    </div>
                                </div>
                                {post.userRank && (
                                    <div className="absolute -bottom-1 -right-1 bg-black text-moto-accent text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border border-moto-accent">
                                        PRO
                                    </div>
                                )}
                            </div>

                            {/* User Info */}
                            <div>
                                <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-wide font-display drop-shadow-md hover:underline decoration-moto-accent underline-offset-2">
                                    {post.userName}
                                </h3>
                                <div className="flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-300 font-medium tracking-wide opacity-90">
                                    {post.location && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-2.5 h-2.5 text-moto-accent" />
                                            {post.location}
                                        </span>
                                    )}
                                    <span className="w-0.5 h-0.5 rounded-full bg-gray-400 dark:bg-gray-500" />
                                    <span>
                                        {formatDistanceToNow(new Date(post.timestamp || Date.now()), { addSuffix: true, locale: tr })}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Options Menu */}
                        <div className="relative">
                            <button
                                onClick={() => setShowOptions(!showOptions)}
                                className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-900 dark:text-white hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                            >
                                <MoreVertical className="w-4 h-4" />
                            </button>
                            <AnimatePresence>
                                {showOptions && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#111] border border-gray-100 dark:border-white/10 rounded-2xl shadow-xl overflow-hidden z-40"
                                    >
                                        <div className="p-1">
                                            {currentUser?._id === post.userId ? (
                                                <>
                                                    <button onClick={() => { setIsEditing(true); setShowOptions(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors">
                                                        <Edit2 className="w-3.5 h-3.5" /> Düzenle
                                                    </button>
                                                    <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors">
                                                        <Trash2 className="w-3.5 h-3.5" /> Sil
                                                    </button>
                                                </>
                                            ) : (
                                                <button onClick={handleReport} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                                    <Flag className="w-3.5 h-3.5" /> Bildir
                                                </button>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* 2. Immersive Media Content */}
                <div
                    className="relative w-full bg-gray-50 dark:bg-neutral-900 cursor-pointer overflow-hidden"
                    onDoubleClick={handleLike}
                >
                    {post.images && post.images.length > 0 ? (
                        <motion.img
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            src={post.images[0]}
                            alt="Post"
                            className="w-full h-auto object-cover max-h-[600px]"
                        />
                    ) : (
                        <div className="w-full aspect-square flex flex-col items-center justify-center gap-4 bg-gray-100 dark:bg-zinc-900/50">
                            <div className="w-20 h-20 rounded-full bg-white dark:bg-white/5 border border-gray-200 dark:border-white/5 flex items-center justify-center">
                                <Zap className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                            </div>
                        </div>
                    )}

                    {/* Bottom Gradient for Text Legibility */}
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-white dark:from-black via-white/80 dark:via-black/80 to-transparent pointer-events-none opacity-0 dark:opacity-100" />

                    {/* Heart Animation */}
                    <AnimatePresence>
                        {showHeartOverlay && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
                            >
                                <Heart className="w-32 h-32 text-moto-accent fill-moto-accent drop-shadow-[0_0_50px_rgba(242,166,25,0.8)]" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Media Stats Overlay */}
                    <div className="absolute bottom-6 right-6 flex items-center gap-3 z-30">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold text-white">
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'text-moto-accent fill-moto-accent' : 'text-white'}`} />
                            {likesCount}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold text-white">
                            <MessageCircle className="w-3.5 h-3.5 text-white" />
                            {post.comments}
                        </div>
                    </div>
                </div>

                {/* 3. Action & Info Area */}
                <div className="relative p-6 bg-white dark:bg-black z-20 transition-colors duration-300">
                    {/* Action Bar */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={handleLike}
                                className={`h-12 px-6 rounded-2xl flex items-center gap-2 text-sm font-bold transition-all border ${isLiked ? 'bg-moto-accent/10 border-moto-accent/50 text-moto-accent shadow-[0_0_20px_rgba(226,255,59,0.2)]' : 'bg-gray-100 dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10'}`}
                            >
                                <Heart className={`w-4 h-4 ${isLiked ? 'fill-current drop-shadow-md' : ''}`} />
                                <span className="hidden sm:inline">{isLiked ? 'Beğenildi' : 'Beğen'}</span>
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => onComment && onComment(post._id)}
                                className="h-12 w-12 sm:w-auto sm:px-6 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center gap-2 transition-all"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span className="hidden sm:inline">Yorum Yap</span>
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                className="h-12 w-12 rounded-2xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/5 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 flex items-center justify-center transition-all"
                            >
                                <Share2 className="w-4 h-4" />
                            </motion.button>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="h-12 w-12 rounded-2xl bg-transparent border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:border-gray-400 dark:hover:border-white/30 flex items-center justify-center transition-all"
                        >
                            <Bookmark className="w-4 h-4" />
                        </motion.button>
                    </div>

                    {/* Content Text */}
                    <div className="space-y-3">
                        {isEditing ? (
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-gray-200 dark:border-white/10">
                                <textarea
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                    className="w-full bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 rounded-xl p-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-moto-accent resize-none placeholder-gray-400 active:bg-white dark:active:bg-black mb-3"
                                    rows={3}
                                />
                                <div className="flex justify-end gap-2">
                                    <button onClick={() => { setIsEditing(false); setPostContent(post.content); }} className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white px-4 py-2">
                                        İptal
                                    </button>
                                    <button onClick={handleUpdate} className="text-xs bg-moto-accent text-black font-black uppercase tracking-wider px-6 py-2 rounded-xl">
                                        Kaydet
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                                <span className="font-bold text-gray-900 dark:text-white font-display mr-2 text-base">{post.userName}</span>
                                {postContent}
                            </div>
                        )}

                        {/* View all comments */}
                        {post.comments > 0 && (
                            <button className="text-xs text-gray-500 font-bold hover:text-gray-900 dark:hover:text-white transition-colors">
                                {post.comments} yorumun tümünü gör
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
