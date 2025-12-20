import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal, Check, ChevronRight, UserPlus } from 'lucide-react';
import { SocialPost } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';

interface PostCardProps {
    post: SocialPost;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isFollowing, setIsFollowing] = useState(false);
    const [showComments, setShowComments] = useState(false);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    const handleFollow = () => {
        setIsFollowing(!isFollowing);
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
                    <motion.button
                        onClick={handleFollow}
                        className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border ${isFollowing ? 'bg-transparent border-green-500 text-green-500' : 'bg-white/10 border-transparent text-white hover:bg-white/20'}`}
                        whileTap={{ scale: 0.95 }}
                        layout
                    >
                        {isFollowing ? (
                            <> <Check className="w-3 h-3" /> Following </>
                        ) : (
                            <> <UserPlus className="w-3 h-3" /> Follow </>
                        )}
                    </motion.button>
                    <button className="text-gray-500 hover:text-white transition-colors">
                        <MoreHorizontal className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="relative group cursor-pointer overflow-hidden bg-black/50">
                {post.images.length > 0 && (
                    <motion.div
                        className="w-full h-auto max-h-[600px] object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                    >
                        <img src={post.images[0]} alt="Post content" className="w-full h-full object-cover" />
                    </motion.div>
                )}
                {/* Image Progress Bar (Placeholder for multiple images) */}
                {post.images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {post.images.map((_, idx) => (
                            <div key={idx} className={`h-1 rounded-full transition-all ${idx === 0 ? 'w-6 bg-white' : 'w-1.5 bg-white/50'}`} />
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
                            <div className="relative">
                                <Heart className={`w-7 h-7 transition-colors ${isLiked ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover:text-white'}`} />
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
                            <MessageCircle className="w-7 h-7 text-gray-400 group-hover:text-moto-accent transition-colors" />
                            <span className="font-mono text-sm font-bold text-gray-400 group-hover:text-white">{post.comments}</span>
                        </button>

                        <button className="flex items-center gap-2 group">
                            <Share2 className="w-7 h-7 text-gray-400 group-hover:text-green-500 transition-colors" />
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
                        <div className="space-y-3">
                            {post.commentList?.slice(0, 2).map((comment) => (
                                <div key={comment._id} className="flex gap-3">
                                    <UserAvatar name={comment.authorName} size={24} className="mt-1" />
                                    <div>
                                        <p className="text-xs text-gray-400">
                                            <span className="text-white font-bold mr-2">{comment.authorName}</span>
                                            {comment.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full text-left text-xs text-gray-500 mt-3 hover:text-moto-accent transition-colors bg-transparent border-none p-0 flex items-center gap-1">
                            View all comments <ChevronRight className="w-3 h-3" />
                        </button>

                        <div className="mt-4 flex gap-3">
                            <input
                                type="text"
                                placeholder="Add a comment..."
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-600 focus:border-moto-accent focus:ring-0 outline-none transition-colors"
                            />
                            <button className="text-moto-accent font-bold text-sm uppercase px-2 hover:text-white transition-colors">Post</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};
