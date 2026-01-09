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

// Telemetry Number Component with Count-up Effect
const TelemetryValue = ({ value, unit, label }: { value: number | string; unit: string; label: string }) => {
    return (
        <div className="flex flex-col items-center justify-center p-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl min-w-[80px]">
            <span className="text-[10px] text-gray-400 font-bold tracking-wider mb-1">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className="text-xl font-display font-bold text-white tabular-nums">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </span>
                <span className="text-[10px] text-[#E2FF3B] font-bold">{unit}</span>
            </div>
        </div>
    );
};

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
            className="w-full max-w-[500px] mx-auto bg-[#0A0A0A] border border-white/5 shadow-2xl rounded-2xl overflow-hidden group relative"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-3 relative z-10 bg-gradient-to-b from-black/80 to-transparent">
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <img
                            src={post.userAvatar || 'https://via.placeholder.com/40'}
                            alt={post.userName}
                            className="w-10 h-10 rounded-full object-cover border-2 border-white/10"
                        />
                        {/* Online/Badge Indicator */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#E2FF3B] rounded-full border-2 border-black flex items-center justify-center">
                            <Zap className="w-2 h-2 text-black fill-current" />
                        </div>
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold text-white">{post.userName || 'Anonim Sürücü'}</h3>
                            {/* Badge */}
                            <div className="px-1.5 py-0.5 bg-[#E2FF3B]/10 border border-[#E2FF3B]/20 rounded text-[10px] font-bold text-[#E2FF3B] flex items-center gap-1">
                                <Zap className="w-2 h-2" />
                                SPORT MODE
                            </div>
                        </div>
                        <p className="text-xs text-gray-500">
                            {post.timestamp || 'Az önce'}
                            {' • '}
                            <span>{post.location || 'İstanbul'}</span>
                        </p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-white transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            {/* Content / Media */}
            <div className="relative aspect-[4/3] w-full bg-black/50 overflow-hidden">
                {post.images && post.images.length > 0 ? (
                    <img src={post.images[0]} alt="Post content" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#111] text-gray-600">
                        Görsel Yok
                    </div>
                )}

                {/* Telemetry HUD Overlay */}
                {post.rideStats && (
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-2 z-20">
                        {/* Glassmorphic Stats Container */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex-1 flex items-center justify-between gap-2"
                        >
                            <TelemetryValue value={post.rideStats.maxSpeed || 0} unit="KM/S" label="HIZ" />
                            <TelemetryValue value={post.rideStats.distance || 0} unit="KM" label="MESAFE" />
                            <TelemetryValue value={post.rideStats.leanAngle || 0} unit="°" label="EĞİM" />
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-[#0A0A0A]">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.8 }}
                            onClick={handleLike}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${isLiked ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/5 text-white border border-white/10 hover:bg-white/10'}`}
                        >
                            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
                            {isLiked ? 'BEĞENDİN' : 'BEĞEN'}
                        </motion.button>

                        <button
                            onClick={() => onComment && onComment(post._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all"
                        >
                            <MessageCircle className="w-3.5 h-3.5" />
                            YORUM YAP
                        </button>

                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all">
                            <Share2 className="w-3.5 h-3.5" />
                            PAYLAŞ
                        </button>
                    </div>
                </div>

                {/* Engagement Text */}
                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-5 h-5 rounded-full bg-gray-700 border border-[#0A0A0A]"></div>
                        ))}
                    </div>
                    <span><span className="text-white font-bold">{likesCount} sürücü</span> bunu beğendi</span>
                </div>

                {/* Caption */}
                {post.content && (
                    <div className="mt-3 text-sm text-gray-300">
                        <span className="font-bold text-white mr-2">{post.userName}</span>
                        {post.content}
                    </div>
                )}
            </div>
        </motion.div>
    );
};
