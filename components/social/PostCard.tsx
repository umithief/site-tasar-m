import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Zap, Gauge, Navigation, MapPin, MoreVertical } from 'lucide-react';
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

    const handleLike = async () => {
        if (!currentUser) return;

        // Optimistic UI
        const newStatus = !isLiked;
        setIsLiked(newStatus);
        setLikesCount(prev => newStatus ? prev + 1 : prev - 1);

        // Call API
        if (onLike) onLike(post._id);
        else await socialService.likePost(post._id, currentUser._id);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ type: "spring", stiffness: 50, damping: 20 }}
            className="w-full max-w-[500px] mx-auto bg-[#0A0A0A] border border-white/5 shadow-2xl rounded-3xl overflow-hidden group relative"
        >
            {/* Header - Floating Glass */}
            <div className="absolute top-0 left-0 right-0 p-4 z-20 bg-gradient-to-b from-black/90 via-black/40 to-transparent">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative cursor-pointer">
                            <div className="p-[2px] rounded-full bg-gradient-to-tr from-moto-accent to-transparent">
                                <img
                                    src={post.userAvatar || 'https://via.placeholder.com/40'}
                                    alt={post.userName}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-black"
                                />
                            </div>
                            {/* Pro Badge */}
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-moto-accent rounded-full border-2 border-black flex items-center justify-center">
                                <Zap className="w-2.5 h-2.5 text-black fill-current" />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-bold text-white tracking-wide">{post.userName || 'Anonim'}</h3>
                                <div className="px-1.5 py-[2px] bg-white/10 backdrop-blur-md rounded text-[9px] font-black text-moto-accent tracking-wider flex items-center gap-1 border border-white/5">
                                    PRO
                                </div>
                            </div>
                            <p className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                <span>{post.location || 'Konum Yok'}</span>
                                <span className="w-0.5 h-0.5 rounded-full bg-gray-500" />
                                <span>{formatDistanceToNow(new Date(post.timestamp || Date.now()), { addSuffix: true, locale: tr })}</span>
                            </p>
                        </div>
                    </div>
                    <button className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/10 transition-colors">
                        <MoreVertical className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content / Media */}
            <div
                className="relative aspect-[4/5] w-full bg-[#111] overflow-hidden cursor-pointer"
                onDoubleClick={handleLike}
            >
                {post.images && post.images.length > 0 ? (
                    <img src={post.images[0]} alt="Post" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600 font-display">
                        Görsel Yok
                    </div>
                )}

                {/* Heart Animation Overlay */}
                <AnimatePresence>
                    {isLiked && (
                        <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1.5, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <Heart className="w-24 h-24 text-white fill-white drop-shadow-2xl opacity-80" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Premium Footer */}
            <div className="p-4 bg-[#0A0A0A] relative z-20">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handleLike}
                            className={`group flex items-center gap-2 transition-colors`}
                        >
                            <Heart
                                className={`w-7 h-7 transition-all ${isLiked ? 'text-red-500 fill-red-500' : 'text-white group-hover:text-gray-300'}`}
                                strokeWidth={1.5}
                            />
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => onComment && onComment(post._id)}
                            className="group"
                        >
                            <MessageCircle className="w-7 h-7 text-white group-hover:text-gray-300 transition-colors" strokeWidth={1.5} />
                        </motion.button>

                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            className="group"
                        >
                            <Share2 className="w-7 h-7 text-white group-hover:text-gray-300 transition-colors" strokeWidth={1.5} />
                        </motion.button>
                    </div>

                    {/* Save/Bookmark */}
                    <motion.button whileTap={{ scale: 0.9 }}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="w-7 h-7 text-white hover:text-gray-300 transition-colors"
                        >
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                    </motion.button>
                </div>

                {/* Likes & Caption */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="w-5 h-5 rounded-full bg-gray-800 border-[1.5px] border-[#0A0A0A]"></div>
                            ))}
                        </div>
                        <p className="text-sm font-medium text-white">
                            <span className="font-bold">{likesCount.toLocaleString()}</span> beğeni
                        </p>
                    </div>

                    <div className="text-sm leading-relaxed">
                        <span className="font-bold text-white mr-2">{post.userName}</span>
                        <span className="text-gray-300">{post.content}</span>
                    </div>

                    <button className="text-xs text-gray-500 font-medium hover:text-gray-300 transition-colors">
                        Tüm {post.comments || 0} yorumu gör
                    </button>

                    <p className="text-[10px] text-gray-600 uppercase tracking-wider font-medium">
                        {formatDistanceToNow(new Date(post.timestamp || Date.now()), { addSuffix: true, locale: tr })}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};
