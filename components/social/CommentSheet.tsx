import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2 } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';
import { Button } from '../ui/Button';
import { socialService } from '../../services/socialService';
import { cn } from '../../lib/utils';

interface CommentSheetProps {
    isOpen: boolean;
    onClose: () => void;
    postId: string;
    currentUser: any;
}

export const CommentSheet: React.FC<CommentSheetProps> = ({ isOpen, onClose, postId, currentUser }) => {
    const [comments, setComments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Fetch comments when opened
    useEffect(() => {
        if (isOpen && postId) {
            fetchComments();
            // Focus input slightly after open logic if desired, but mobile keyboard might be jarring
        }
    }, [isOpen, postId]);

    const fetchComments = async () => {
        setIsLoading(true);
        const fetched = await socialService.getComments(postId);
        setComments(fetched);
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        const result = await socialService.commentPost(postId, newComment);
        setIsSubmitting(false);

        if (result && result.data && result.data.comment) {
            setComments([result.data.comment, ...comments]);
            setNewComment('');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
                    />

                    {/* Sheet */}
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                        drag="y"
                        dragConstraints={{ top: 0 }}
                        dragElastic={0.2}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 100) onClose();
                        }}
                        className="fixed bottom-0 left-0 right-0 h-[85vh] md:h-[600px] md:w-[500px] md:left-1/2 md:-translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 bg-white border-t md:border border-gray-100 rounded-t-[2rem] md:rounded-2xl z-[201] flex flex-col shadow-2xl overflow-hidden"
                    >
                        {/* Drag Handle (Mobile only) */}
                        <div className="md:hidden w-full flex justify-center pt-3 pb-1">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-display font-bold text-lg text-gray-900">Yorumlar ({comments.length})</h3>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Comments List */}
                        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">
                            {isLoading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-10 text-gray-400 font-medium">
                                    <p>Henüz yorum yok. İlk yorumu sen yap!</p>
                                </div>
                            ) : (
                                comments.map((comment) => (
                                    <div key={comment._id} className="flex gap-3">
                                        <UserAvatar src={comment.author?.avatar} name={comment.author?.name || 'User'} size={32} className="mt-1" />
                                        <div className="flex-1">
                                            <div className="bg-gray-50 p-3 rounded-2xl rounded-tl-none border border-gray-100">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="font-bold text-sm text-gray-900">{comment.author?.name || 'Kullanıcı'}</span>
                                                    <span className="text-[10px] text-gray-400 font-medium">
                                                        {new Date(comment.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-100 bg-white">
                            <div className="flex items-center gap-3">
                                <UserAvatar src={currentUser?.avatar} name={currentUser?.name} size={36} />
                                <div className="flex-1 relative">
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        placeholder="Yorum yaz..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-full pl-4 pr-12 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                                    />
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || isSubmitting}
                                        className={cn(
                                            "absolute right-1 top-1 bottom-1 w-8 h-8 rounded-full flex items-center justify-center transition-all",
                                            newComment.trim() ? "bg-black text-white" : "bg-transparent text-gray-400"
                                        )}
                                    >
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 pl-0.5" />}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
