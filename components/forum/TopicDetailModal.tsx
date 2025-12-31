import React, { useState } from 'react';
import { ForumTopic, User } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquare, Heart, Share2, Send, User as UserIcon } from 'lucide-react';
import { forumService } from '../../services/forumService';
import { useLanguage } from '../../contexts/LanguageProvider';

interface TopicDetailModalProps {
    topic: ForumTopic | null;
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export const TopicDetailModal: React.FC<TopicDetailModalProps> = ({ topic, isOpen, onClose, user }) => {
    const { t } = useLanguage();
    const [commentText, setCommentText] = useState('');
    const [localComments, setLocalComments] = useState(topic?.comments || []);

    // Update local comments when topic changes
    React.useEffect(() => {
        if (topic) {
            setLocalComments(topic.comments || []);
        }
    }, [topic]);

    const handleSendComment = async () => {
        if (!topic || !user || !commentText.trim()) return;

        try {
            const newComment = await forumService.addComment(topic._id, user, commentText);
            setLocalComments([...localComments, newComment]);
            setCommentText('');
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    if (!isOpen || !topic) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-[#121214] w-full max-w-2xl h-[80vh] flex flex-col rounded-2xl border border-white/10 overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-[#1A1A1C]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                                <UserIcon size={20} className="text-gray-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-sm">{topic.authorName}</h3>
                                <span className="text-xs text-gray-500">{topic.date}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {/* Content (Scrollable) */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                        {/* Topic Body */}
                        <div className="mb-8">
                            <h2 className="text-xl font-bold text-white mb-4">{topic.title}</h2>
                            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                                {topic.content}
                            </p>

                            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-white/5">
                                <button className="flex items-center gap-2 text-gray-400 hover:text-red-500 transition-colors">
                                    <Heart size={18} />
                                    <span className="text-sm">{topic.likes} Beğeni</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                                    <MessageSquare size={18} />
                                    <span className="text-sm">{localComments.length} Yorum</span>
                                </button>
                                <button className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors ml-auto">
                                    <Share2 size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Comments Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Yorumlar</h4>

                            {localComments.length === 0 ? (
                                <div className="text-center py-10 text-gray-500">
                                    Henüz yorum yok. İlk yorumu sen yap!
                                </div>
                            ) : (
                                localComments.map((comment, idx) => (
                                    <div key={idx} className="flex gap-3 p-4 bg-[#1A1A1C] rounded-xl border border-white/5">
                                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-gray-400">
                                                {comment.authorName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-sm font-bold text-white">{comment.authorName}</span>
                                                <span className="text-xs text-gray-500">{comment.date}</span>
                                            </div>
                                            <p className="text-sm text-gray-300">{comment.content}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Comment Input */}
                    <div className="p-4 bg-[#1A1A1C] border-t border-white/5">
                        <div className="flex items-center gap-3">
                            <input
                                type="text"
                                placeholder={user ? "Yorum yaz..." : "Yorum yazmak için giriş yapın"}
                                value={commentText}
                                onChange={(e) => setCommentText(e.target.value)}
                                disabled={!user}
                                className="flex-1 bg-[#09090b] border border-white/10 rounded-full px-4 py-2.5 text-white focus:border-moto-accent focus:outline-none disabled:opacity-50"
                                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                            />
                            <button
                                onClick={handleSendComment}
                                disabled={!user || !commentText.trim()}
                                className="p-2.5 bg-moto-accent rounded-full text-black hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
