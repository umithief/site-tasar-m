import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Zap, Gauge, Navigation, MapPin, MoreVertical, Trash2, Edit2, Flag, ShieldAlert, Bookmark, Save } from 'lucide-react';
import { SocialPost } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { socialService } from '../../services/socialService';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface PostCardProps {
    post: SocialPost;
    onLike?: (id: string) => void;
    onComment?: (id: string) => void;
}



export const PostCard: React.FC<PostCardProps> = ({ post, onLike, onComment }) => {
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
        else await socialService.likePost(post._id, currentUser._id);
    };

    const handleDelete = async () => {
        if (confirm('Bu gönderiyi silmek istediğine emin misin?')) {
            await socialService.deletePost(post._id);
            setShowOptions(false);
            // Ideally trigger refresh, but for now we rely on parent or reload
            window.location.reload();
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

    const handleShareToAdmin = async () => {
        await socialService.shareToAdmin(post._id);
        setShowOptions(false);
        alert('Gönderi admine iletildi.');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 40, damping: 15 }}
            className="w-full max-w-[500px] mx-auto bg-black border border-white/10 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden group relative mb-6"
        >
            {/* Header - Cinematic Gradient & Glass */}
            <div className="absolute top-0 left-0 right-0 p-5 z-20 bg-gradient-to-b from-black/90 via-black/50 to-transparent pointer-events-none">
                <div className="flex items-center justify-between pointer-events-auto">
                    <div className="flex items-center gap-3.5">
                        <div className="relative cursor-pointer group/avatar">
                            <div className="absolute -inset-0.5 bg-gradient-to-tr from-moto-accent to-yellow-200 rounded-full opacity-75 blur-[2px] group-hover/avatar:opacity-100 transition-opacity" />
                            <div className="relative p-[2px] rounded-full bg-black">
                                <img
                                    src={post.userAvatar || 'https://via.placeholder.com/40'}
                                    alt={post.userName}
                                    className="w-10 h-10 rounded-full object-cover border border-white/10"
                                />
                            </div>
                            {/* Pro Badge */}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-moto-accent rounded-full border-[3px] border-black flex items-center justify-center">
                                <Zap className="w-2 h-2 text-black fill-current" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="text-sm font-bold text-white tracking-wide shadow-black drop-shadow-md">{post.userName || 'Anonim'}</h3>
                                {post.userRank && (
                                    <div className="px-1.5 py-[1px] bg-white/10 backdrop-blur-md rounded text-[9px] font-black text-moto-accent tracking-wider border border-white/5 shadow-sm">
                                        {post.userRank}
                                    </div>
                                )}
                            </div>
                            <p className="text-[10px] text-gray-300 font-medium flex items-center gap-1.5 drop-shadow-md">
                                {post.location && (
                                    <>
                                        <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-moto-accent" /> {post.location}</span>
                                        <span className="w-0.5 h-0.5 rounded-full bg-gray-400" />
                                    </>
                                )}
                                <span className="opacity-80">{formatDistanceToNow(new Date(post.timestamp || Date.now()), { addSuffix: true, locale: tr })}</span>
                            </p>
                        </div>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowOptions(!showOptions)}
                            className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center text-white hover:bg-white/10 hover:border-white/20 transition-all"
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                            {showOptions && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                    className="absolute right-0 mt-2 w-52 bg-[#151515] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-30"
                                >
                                    <div className="p-1 space-y-0.5">
                                        {currentUser?._id === post.userId && (
                                            <button
                                                onClick={() => {
                                                    if (isEditing) {
                                                        setIsEditing(false);
                                                        setPostContent(post.content);
                                                    } else {
                                                        setIsEditing(true);
                                                        setShowOptions(false);
                                                    }
                                                }}
                                                className="w-full text-left px-3 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-xl flex items-center gap-3 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                                {isEditing ? 'İptal Et' : 'Düzenle'}
                                            </button>
                                        )}

                                        {(currentUser?._id === post.userId || currentUser?.isAdmin) && (
                                            <button
                                                onClick={() => handleDelete()}
                                                className="w-full text-left px-3 py-2.5 text-xs font-medium text-red-500 hover:bg-red-500/10 rounded-xl flex items-center gap-3 transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Sil
                                            </button>
                                        )}
                                        {currentUser?._id !== post.userId && (
                                            <>
                                                <button onClick={() => setShowOptions(false)} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white rounded-xl transition-colors">
                                                    <Bookmark className="w-4 h-4" />
                                                    Kaydet
                                                </button>
                                                <button onClick={handleShareToAdmin} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-moto-accent hover:bg-moto-accent/10 rounded-xl transition-colors">
                                                    <ShieldAlert className="w-4 h-4" />
                                                    Admine İlet
                                                </button>
                                                <button onClick={handleReport} className="w-full flex items-center gap-3 px-3 py-2.5 text-xs font-medium text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
                                                    <Flag className="w-4 h-4" />
                                                    Şikayet Et
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Content / Media with Parallax-like feel */}
            <div
                className="relative aspect-[4/5] w-full bg-[#050505] overflow-hidden cursor-pointer group/image"
                onDoubleClick={handleLike}
            >
                {post.images && post.images.length > 0 ? (
                    <img
                        src={post.images[0]}
                        alt="Post"
                        className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover/image:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 gap-4 bg-zinc-900/50">
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
                            <Zap className="w-6 h-6 text-gray-600" />
                        </div>
                        <span className="font-display font-bold text-sm tracking-widest uppercase opacity-50">Görsel Yok</span>
                    </div>
                )}

                {/* Heart Animation Overlay */}
                <AnimatePresence>
                    {showHeartOverlay && (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0, rotate: -20 }}
                            animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none z-30"
                        >
                            <Heart className="w-28 h-28 text-moto-accent fill-moto-accent drop-shadow-[0_0_30px_rgba(242,166,25,0.6)]" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Image Gradient Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80" />
            </div>

            {/* Micro-Interaction Bar */}
            <div className="px-5 pt-3 pb-6 bg-black relative z-20 -mt-4 rounded-t-3xl border-t border-white/5">
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-5">
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handleLike}
                            className={`group flex items-center gap-2 outline-none`}
                        >
                            <div className={`p-2 rounded-full transition-all duration-300 ${isLiked ? 'bg-moto-accent/10' : 'bg-transparent group-hover:bg-white/5'}`}>
                                <Heart
                                    className={`w-6 h-6 transition-all duration-300 ${isLiked ? 'text-moto-accent fill-moto-accent scale-110 drop-shadow-[0_0_10px_rgba(242,166,25,0.5)]' : 'text-white group-hover:text-gray-200'}`}
                                    strokeWidth={isLiked ? 0 : 2}
                                />
                            </div>
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onComment && onComment(post._id)}
                            className="group outline-none"
                        >
                            <div className="p-2 rounded-full bg-transparent group-hover:bg-white/5 transition-all">
                                <MessageCircle className="w-6 h-6 text-white group-hover:text-moto-accent transition-colors" strokeWidth={2} />
                            </div>
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="group outline-none"
                        >
                            <div className="p-2 rounded-full bg-transparent group-hover:bg-white/5 transition-all">
                                <Share2 className="w-6 h-6 text-white group-hover:text-moto-accent transition-colors" strokeWidth={2} />
                            </div>
                        </motion.button>
                    </div>

                    <motion.button whileTap={{ scale: 0.9 }} className="group outline-none">
                        <div className="p-2 rounded-full bg-transparent group-hover:bg-white/5 transition-all">
                            <Bookmark className="w-6 h-6 text-white group-hover:text-moto-accent transition-colors" strokeWidth={2} />
                        </div>
                    </motion.button>
                </div>

                {/* Info Text */}
                <div className="space-y-3">
                    {/* Likes */}
                    <div className="flex items-center gap-2.5 pl-1">
                        {likesCount > 0 && (
                            <div className="flex -space-x-2">
                                {[1, 2, 3].slice(0, Math.min(3, likesCount)).map(i => (
                                    <div key={i} className="w-5 h-5 rounded-full bg-zinc-800 border border-black ring-1 ring-white/10 flex items-center justify-center">
                                        <Zap className="w-2.5 h-2.5 text-gray-500" />
                                    </div>
                                ))}
                            </div>
                        )}
                        <p className="text-sm font-medium text-white">
                            <span className="font-bold font-display">{likesCount.toLocaleString()}</span> beğenme
                        </p>
                    </div>

                    {/* Caption */}
                    {isEditing ? (
                        <div className="flex flex-col gap-3 mt-2 bg-white/5 p-3 rounded-xl border border-white/10">
                            <textarea
                                value={postContent}
                                onChange={(e) => setPostContent(e.target.value)}
                                className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-moto-accent resize-none placeholder-gray-600"
                                rows={3}
                                placeholder="Açıklama yaz..."
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    onClick={() => { setIsEditing(false); setPostContent(post.content); }}
                                    className="text-xs font-bold text-gray-400 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-colors"
                                >
                                    Vazgeç
                                </button>
                                <button
                                    onClick={handleUpdate}
                                    disabled={editPending}
                                    className="text-xs bg-moto-accent text-black font-black uppercase tracking-wider px-4 py-2 rounded-lg hover:brightness-110 transition-all flex items-center gap-2"
                                >
                                    {editPending ? <span className="animate-spin">⌛</span> : <Save className="w-3 h-3" />}
                                    Kaydet
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm leading-relaxed pl-1 text-gray-300">
                            <span className="font-bold text-white mr-2 font-display">{post.userName}</span>
                            {postContent}
                        </div>
                    )}

                    {post.comments && post.comments > 0 ? (
                        <button className="text-xs text-gray-500 font-medium hover:text-moto-accent transition-colors pl-1">
                            {post.comments} yorumu gör
                        </button>
                    ) : null}
                </div>
            </div>
        </motion.div>
    );
};
