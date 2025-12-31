import React from 'react';
import { ForumTopic } from '../../types';
import { MessageSquare, Heart, Eye, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface TopicCardProps {
    topic: ForumTopic;
    onClick: (topic: ForumTopic) => void;
}

export const TopicCard: React.FC<TopicCardProps> = ({ topic, onClick }) => {
    return (
        <motion.div
            layoutId={`topic-${topic._id}`}
            onClick={() => onClick(topic)}
            className="bg-[#121214] p-5 rounded-xl border border-white/5 hover:border-moto-accent/30 cursor-pointer group transition-all"
            whileHover={{ y: -2 }}
        >
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white/5 rounded text-xs text-moto-accent font-medium">
                        {topic.category}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={12} />
                        {topic.date}
                    </span>
                </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-moto-accent transition-colors">
                {topic.title}
            </h3>

            <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                {topic.content}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
                        <User size={14} className="text-gray-400" />
                    </div>
                    <span className="text-xs text-gray-300">
                        {topic.authorName}
                    </span>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                        <Eye size={14} />
                        {topic.views}
                    </span>
                    <span className="flex items-center gap-1">
                        <MessageSquare size={14} />
                        {topic.comments?.length || 0}
                    </span>
                    <span className="flex items-center gap-1 text-red-500/80">
                        <Heart size={14} />
                        {topic.likes}
                    </span>
                </div>
            </div>
        </motion.div>
    );
};
