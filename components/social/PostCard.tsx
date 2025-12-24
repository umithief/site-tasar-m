import React, { useState, memo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Check, ChevronRight, UserPlus } from 'lucide-react';
import { SocialPost } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { socialService } from '../../services/socialService';
import { FollowButton } from './FollowButton';

interface PostCardProps {
    post: SocialPost;
    currentUserId?: string;
}

export const PostCard: React.FC<PostCardProps> = memo(({ post, currentUserId }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    // Safety check: ensure likeCount is a number
    const [likeCount, setLikeCount] = useState(typeof post.likes === 'number' ? post.likes : (Array.isArray(post.likes) ? post.likes.length : 0));
    const [showComments, setShowComments] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [comments, setComments] = useState(post.commentList || []);
    // Safety check: ensure commentCount is a number, handling cases where it might be the comments array
    const [commentCount, setCommentCount] = useState(typeof post.comments === 'number' ? post.comments : (Array.isArray(post.comments) ? post.comments.length : 0));
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const handleLike = async () => {
        if (!currentUserId) return alert('Beğenmek için lütfen giriş yapın');

        // Optimistic update
        const newState = !isLiked;
        setIsLiked(newState);
        setLikeCount(prev => newState ? prev + 1 : prev - 1);

        try {
            await socialService.likePost(post._id, currentUserId);
        } catch (error) {
            // Revert on failure
            setIsLiked(!newState);
            setLikeCount(prev => !newState ? prev + 1 : prev - 1);
        }
    };

    const handlePostComment = async () => {
        if (!commentText.trim() || !currentUserId) return;

        try {
            const userStr = localStorage.getItem('user');
            const currentUser = userStr ? JSON.parse(userStr) : null;

            const response: any = await socialService.commentPost(post._id, {
                authorId: currentUserId,
                authorName: currentUser?.name || 'Kullanıcı',
                content: commentText
            });

            if (response && response.data && response.data.comments) {
                const newComments = response.data.comments;
                setComments(newComments);
                setCommentCount(newComments.length);
                setCommentText('');
            }
        } catch (error) {
            console.error('Comment failed');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden mb-8"
        >
            {/* Header */}
            <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="p-0.5 rounded-full bg-gradient-to-r from-moto-accent to-orange-600">
                            <div className="p-0.5 bg-black rounded-full">
                                <UserAvatar name={post.userName} src={post.userAvatar} size={48} />
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-white font-display font-bold text-lg leading-none flex items-center gap-2">
                            {post.userName}
                            {post.userRank && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-moto-accent font-normal tracking-wide uppercase">{post.userRank}</span>
                            )}
                        </h3>
                        {post.bikeModel && (
                            <p className="text-gray-400 font-mono text-xs mt-1">{post.bikeModel}</p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <FollowButton targetUserId={post.userId} />
                    <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <MoreHorizontal className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="relative group cursor-pointer overflow-hidden bg-black/50">
                {post.images && post.images.length > 0 && (
                    <div className="relative w-full h-auto max-h-[600px] aspect-[4/3] md:aspect-auto">
                        <img
                            src={post.images[currentImageIndex] || post.images[0]}
                            alt="Post content"
                            className="w-full h-full object-cover"
                        />

                        {/* Navigation Buttons */}
                        {post.images.length > 1 && (
                            <>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => prev === 0 ? post.images.length - 1 : prev - 1); }}
                                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                >
                                    <ChevronRight className="w-5 h-5 rotate-180" />
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(prev => (prev + 1) % post.images.length); }}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </>
                        )}
                    </div>
                )}

                {/* Image Progress Bar */}
                {post.images && post.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/20 p-1.5 rounded-full backdrop-blur-sm">
                        {post.images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                                className={`h-1.5 rounded-full transition-all ${idx === currentImageIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-5 pt-4 pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <motion.button
                            onClick={handleLike}
                            className="flex items-center gap-2 group"
                            whileTap={{ scale: 0.8 }}
                        >
                            <div className="relative p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                <Heart className={`w-6 h-6 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover:text-white'}`} />
                                {isLiked && (
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 2, opacity: 0 }}
                                        transition={{ duration: 0.5 }}
                                        className="absolute inset-0 bg-red-500 rounded-full blur-xl"
                                    />
                                )}
                            </div>
                            <span className="font-mono text-sm font-bold text-gray-400 group-hover:text-white">{likeCount}</span>
                        </motion.button>

                        <button
                            onClick={() => setShowComments(!showComments)}
                            className="flex items-center gap-2 group"
                        >
                            <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                <MessageCircle className="w-6 h-6 text-gray-400 group-hover:text-moto-accent transition-colors" />
                            </div>
                            <span className="font-mono text-sm font-bold text-gray-400 group-hover:text-white">{commentCount}</span>
                        </button>

                        <button className="flex items-center gap-2 group">
                            <div className="p-2 rounded-full bg-white/5 group-hover:bg-white/10 transition-colors">
                                <Share2 className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors" />
                            </div>
                        </button>
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        <span className="font-bold text-white mr-2">{post.userName}</span>
                        {post.content}
                    </p>
                </div>

                <div className="mt-2 text-xs text-gray-600 uppercase font-bold tracking-wider">
                    {post.timestamp}
                </div>
            </div>

            {/* Comments Preview */}
            <AnimatePresence>
                {showComments && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="px-5 pb-5 pt-2 border-t border-white/5 mt-4"
                    >
                        <div className="space-y-3 mb-4">
                            {comments.map((comment) => (
                                <div key={comment._id || Math.random().toString()} className="flex gap-3">
                                    <UserAvatar name={typeof comment.authorName === 'string' ? comment.authorName : 'User'} size={24} className="mt-1" />
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            <span className="text-white font-bold mr-2">{typeof comment.authorName === 'string' ? comment.authorName : 'User'}</span>
                                            {typeof comment.content === 'string' ? comment.content : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 flex gap-3">
                            <input
                                type="text"
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                placeholder="Yorum ekle..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:border-moto-accent focus:ring-0 outline-none transition-colors"
                                onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
                            />
                            <button
                                onClick={handlePostComment}
                                className="text-moto-accent font-bold text-sm uppercase px-2 hover:text-white transition-colors"
                            >
                                Paylaş
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
});
