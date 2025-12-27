import React, { useState } from 'react';
import { UserAvatar } from '../ui/UserAvatar';
import { Heart, Send } from 'lucide-react';

interface Comment {
    _id: string;
    authorName: string;
    authorAvatar?: string;
    content: string;
    timestamp?: string;
    likes?: number;
    isLiked?: boolean;
}

interface MobileCommentsProps {
    postId: string;
    comments: Comment[];
    currentUserAvatar?: string;
    onAddComment: (text: string) => void;
    onLikeComment?: (commentId: string) => void;
}

export const MobileComments: React.FC<MobileCommentsProps> = ({
    postId,
    comments,
    currentUserAvatar,
    onAddComment,
    onLikeComment
}) => {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        if (!text.trim()) return;
        onAddComment(text);
        setText('');
    };

    return (
        <div className="flex flex-col h-full">
            {/* Scrollable List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
                {comments.length === 0 ? (
                    <div className="text-center py-10 text-white/50 text-sm">
                        Henüz yorum yok. İlk yorumu sen yap!
                    </div>
                ) : (
                    comments.map((comment) => (
                        <div key={comment._id} className="flex gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                            <UserAvatar name={comment.authorName} src={comment.authorAvatar} size={32} className="mt-1 shrink-0" />
                            <div className="flex-1">
                                <div className="flex items-start justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-white/90">{comment.authorName}</span>
                                        <span className="text-sm text-white/80 leading-snug mt-0.5">{comment.content}</span>
                                        <div className="flex items-center gap-3 mt-2">
                                            <button className="text-[10px] font-medium text-gray-500 hover:text-gray-400">Yanıtla</button>
                                            {comment.likes && comment.likes > 0 && (
                                                <span className="text-[10px] text-gray-500">{comment.likes} beğenme</span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onLikeComment && onLikeComment(comment._id)}
                                        className="p-1 text-gray-500 hover:text-red-500 transition-colors"
                                    >
                                        <Heart className={`w-4 h-4 ${comment.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Sticky Input Area */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-white/5 p-4 z-50">
                <div className="flex items-center gap-3">
                    <UserAvatar name="Sen" src={currentUserAvatar} size={36} className="shrink-0 ring-2 ring-white/10" />
                    <div className="flex-1 relative group">
                        <input
                            type="text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Yorum ekle..."
                            className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-2.5 text-sm text-white placeholder-white/30 focus:bg-white/10 focus:border-white/20 outline-none transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                        />
                        <button
                            onClick={handleSubmit}
                            disabled={!text.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-moto-accent text-white disabled:opacity-0 disabled:scale-75 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-orange-500/20"
                        >
                            <Send className="w-3.5 h-3.5" strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
