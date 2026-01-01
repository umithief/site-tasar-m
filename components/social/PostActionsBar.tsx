import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { SocialPost } from '../../types';
import { socialService } from '../../services/socialService';

interface PostActionsBarProps {
    post: SocialPost;
    onCommentClick: () => void;
}

export const PostActionsBar: React.FC<PostActionsBarProps> = ({ post, onCommentClick }) => {
    // Local optimistic state
    const [isLiked, setIsLiked] = useState(post.isLiked);
    const [likeCount, setLikeCount] = useState(post.likes);
    const [isBookmarked, setIsBookmarked] = useState(false); // Placeholder logic

    const handleLike = async (e: React.MouseEvent) => {
        e.stopPropagation();

        // Optimistic Update
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount(prev => newIsLiked ? prev + 1 : Math.max(0, prev - 1));

        // API Call
        try {
            // Assuming user ID is handled by backend token, we pass empty string or just rely on endpoint
            await socialService.likePost(post._id, '');
        } catch (error) {
            // Revert on error
            setIsLiked(!newIsLiked);
            setLikeCount(prev => !newIsLiked ? prev + 1 : Math.max(0, prev - 1));
        }
    };

    return (
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
            <div className="flex items-center gap-6">
                {/* LIKE BUTTON */}
                <button
                    onClick={handleLike}
                    className="group flex items-center gap-2 outline-none"
                    aria-label="Like"
                >
                    <div className="relative">
                        <motion.div
                            whileTap={{ scale: 0.8 }}
                            animate={isLiked ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                            transition={{ duration: 0.2 }} // Snappy spring pop
                        >
                            <Heart
                                className={cn(
                                    "w-6 h-6 transition-colors duration-300",
                                    isLiked ? "fill-[#FF4500] text-[#FF4500]" : "text-white group-hover:text-[#FF4500]"
                                )}
                                strokeWidth={isLiked ? 0 : 1.5}
                            />
                        </motion.div>
                    </div>
                    <span className={cn(
                        "text-sm font-medium tabular-nums transition-colors",
                        isLiked ? "text-[#FF4500]" : "text-zinc-400 group-hover:text-white"
                    )}>
                        {likeCount}
                    </span>
                </button>

                {/* COMMENT BUTTON */}
                <button
                    onClick={onCommentClick}
                    className="group flex items-center gap-2 outline-none hover:text-blue-400 transition-colors"
                    aria-label="Comment"
                >
                    <MessageCircle className="w-6 h-6 text-white group-hover:text-blue-400 transition-colors" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-zinc-400 group-hover:text-blue-400 tabular-nums">
                        {post.comments}
                    </span>
                </button>

                {/* SHARE BUTTON */}
                <button className="group flex items-center gap-2 outline-none hover:text-green-400 transition-colors">
                    <Share2 className="w-5 h-5 text-white group-hover:text-green-400 transition-colors" strokeWidth={1.5} />
                </button>
            </div>

            {/* BOOKMARK */}
            <button
                onClick={() => setIsBookmarked(!isBookmarked)}
                className="text-zinc-400 hover:text-yellow-400 transition-colors"
            >
                <Bookmark className={cn(
                    "w-5 h-5 transition-all",
                    isBookmarked ? "fill-yellow-400 text-yellow-400" : ""
                )} strokeWidth={1.5} />
            </button>
        </div>
    );
};
