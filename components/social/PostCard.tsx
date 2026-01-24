import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Zap, MapPin, MoreVertical, Trash2, Edit2, Flag, Bookmark } from 'lucide-react';
import { SocialPost } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { socialService } from '../../services/socialService';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

import { memo } from 'react';

interface PostCardProps {
    post: SocialPost;
    onLike?: (id: string) => void;
    onComment?: (id: string) => void;
    onNavigate?: (view: string, data?: any) => void;
    variant?: 'default' | 'glass';
}

export const PostCard: React.FC<PostCardProps> = memo(({ post, onLike, onComment, onNavigate, variant = 'default' }) => {
    // ... (keep state logic same)
    const { user: currentUser } = useAuthStore();
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likesCount, setLikesCount] = useState(post.likes);
    const [postContent, setPostContent] = useState(post.content);

    const [showHeartOverlay, setShowHeartOverlay] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editPending, setEditPending] = useState(false);

    const handleLike = async () => {
        // ... (keep same)
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
        // ... (same)
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
        // ... (same)
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
        // ... (same)
        await socialService.reportPost(post._id, 'inappropriate');
        setShowOptions(false);
        alert('Gönderi raporlandı.');
    };

    const handleProfileClick = (e: React.MouseEvent) => {
        // ... (same)
        e.stopPropagation();
        if (onNavigate && post.userId) {
            onNavigate('public-profile', { userId: post.userId, username: post.userName });
        }
    };

    const isGlass = variant === 'glass';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 40, damping: 20 }}
            className={`w-full max-w-[600px] mx-auto mb-16 group relative`}
        >
            {/* Main Card Container */}
            {/* Main Card Container */}
            <div className={`relative rounded-[2rem] overflow-hidden transition-all duration-500 
                ${isGlass
                    ? 'bg-transparent shadow-none border-none'
                    : 'bg-white/80 dark:bg-[#0A0A0A] backdrop-blur-xl border border-gray-200 dark:border-white/10 shadow-2xl dark:shadow-[0_0_40px_-10px_rgba(255,255,255,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] dark:hover:shadow-[0_0_60px_-15px_rgba(255,255,255,0.08)]'
                }`}
            >

                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4">
                    <div
                        className="flex items-center gap-4 cursor-pointer"
                        onClick={handleProfileClick}
                    >
                        <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-moto-accent/50 to-transparent">
                            <div className="p-0.5 rounded-full bg-white dark:bg-black">
                                <LazyLoadImage
                                    src={post.userAvatar || 'https://via.placeholder.com/40'}
                                    alt={post.userName}
                                    className="w-11 h-11 rounded-full object-cover"
                                    effect="blur"
                                    wrapperClassName="w-11 h-11 rounded-full"
                                    width={44}
                                    height={44}
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-bold text-gray-900 dark:text-white hover:text-moto-accent transition-colors">
                                {post.userName}
                            </h3>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                {post.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {post.location}
                                    </span>
                                )}
                                <span className="w-0.5 h-0.5 rounded-full bg-gray-300 dark:bg-gray-600" />
                                <span>
                                    {formatDistanceToNow(new Date(post.timestamp || Date.now()), { addSuffix: true, locale: tr })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Options */}
                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 transition-colors"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>

                        <AnimatePresence>
                            {showOptions && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/10 rounded-xl shadow-xl overflow-hidden z-40 py-1"
                                >
                                    {currentUser?._id === post.userId ? (
                                        <>
                                            <button onClick={() => { setIsEditing(true); setShowOptions(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                                <Edit2 className="w-4 h-4" /> Düzenle
                                            </button>
                                            <button onClick={handleDelete} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                                <Trash2 className="w-4 h-4" /> Sil
                                            </button>
                                        </>
                                    ) : (
                                        <button onClick={handleReport} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                            <Flag className="w-4 h-4" /> Bildir
                                        </button>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Media Content */}
                <div
                    className="relative w-full aspect-[16/9] md:aspect-[4/3] bg-gray-100 dark:bg-black/20 overflow-hidden cursor-pointer"
                    onDoubleClick={handleLike}
                >
                    {post.images && post.images.length > 0 ? (
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                            className="w-full h-full"
                        >
                            <LazyLoadImage
                                src={post.images[0]}
                                alt="Post"
                                className="w-full h-full object-cover"
                                effect="blur"
                                wrapperClassName="w-full h-full"
                                width="100%"
                                height="100%"
                            />
                        </motion.div>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Zap className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                        </div>
                    )}

                    {/* Heart Animation */}
                    <AnimatePresence>
                        {showHeartOverlay && (
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="absolute inset-0 flex items-center justify-center pointer-events-none z-40"
                            >
                                <Heart className="w-32 h-32 text-white fill-white drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)]" />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Hover Stats */}
                    <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="px-3 py-1 bg-black/50 backdrop-blur-md rounded-full text-white text-xs font-bold flex items-center gap-2">
                            <Heart className="w-3.5 h-3.5 fill-white" /> {likesCount}
                        </div>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleLike}
                                className={`h-11 px-6 rounded-xl flex items-center gap-2.5 text-sm font-bold transition-all border
                                    ${isLiked
                                        ? 'bg-red-500/10 border-red-500/20 text-red-500 hover:bg-red-500/20'
                                        : 'bg-transparent border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} strokeWidth={isLiked ? 0 : 2} />
                                <span>{likesCount}</span>
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onComment && onComment(post._id)}
                                className="h-11 w-11 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                            >
                                <MessageCircle className="w-5 h-5" />
                            </motion.button>

                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="h-11 w-11 rounded-xl flex items-center justify-center border border-gray-200 dark:border-white/10 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                            >
                                <Share2 className="w-5 h-5" />
                            </motion.button>
                        </div>

                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="h-11 w-11 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            <Bookmark className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Content */}
                    <div className="space-y-4">
                        {isEditing ? (
                            <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                <textarea
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                    className="w-full bg-transparent border-none focus:ring-0 p-0 text-gray-900 dark:text-white text-sm resize-none"
                                    rows={3}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                    <button onClick={() => { setIsEditing(false); setPostContent(post.content); }} className="px-3 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-900">İptal</button>
                                    <button onClick={handleUpdate} className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg text-xs font-bold">Kaydet</button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm leading-7 text-gray-600 dark:text-gray-300">
                                <span className="font-bold text-gray-900 dark:text-white mr-2 text-base">{post.userName}</span>
                                {postContent}
                            </div>
                        )}

                        {post.comments > 0 && (
                            <button className="text-xs font-bold text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                {post.comments} yorumun tümünü gör
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
