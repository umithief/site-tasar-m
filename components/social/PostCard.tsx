import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { MoreHorizontal, ChevronRight } from 'lucide-react';
import { SocialPost } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';
import { FollowButton } from './FollowButton';
import { PostActionsBar } from './PostActionsBar';

interface PostCardProps {
    post: SocialPost;
    currentUserId?: string;
    onCommentClick?: () => void;
}

export const PostCard: React.FC<PostCardProps> = memo(({ post, currentUserId, onCommentClick }) => {
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);

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
            <PostActionsBar post={post} onCommentClick={() => onCommentClick && onCommentClick()} />

            <div className="px-5 pb-5 pt-2">
                <div className="mt-2">
                    <p className="text-gray-300 text-sm leading-relaxed">
                        <span className="font-bold text-white mr-2">{post.userName}</span>
                        {post.content}
                    </p>
                </div>

                <div className="mt-2 text-xs text-gray-600 uppercase font-bold tracking-wider">
                    {post.timestamp ? new Date(post.timestamp).toLocaleString() : ''}
                </div>
            </div>
        </motion.div>
    );
});
