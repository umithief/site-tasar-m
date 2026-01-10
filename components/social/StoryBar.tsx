import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { storyService, StoryGroup } from '../../services/storyService';
import { UserAvatar } from '../ui/UserAvatar';
import { useAuthStore } from '../../store/authStore';


interface StoryBarProps {
    storyGroups: StoryGroup[];
    onStorySelect: (group: StoryGroup) => void;
    onAddStory: () => void;
}

export const StoryBar: React.FC<StoryBarProps> = ({ storyGroups, onStorySelect, onAddStory }) => {
    const { user } = useAuthStore();

    if (!storyGroups) return <div className="h-24 bg-gray-100 dark:bg-zinc-900 animate-pulse" />;


    return (
        <div className="w-full overflow-x-auto py-4 px-4 no-scrollbar border-b border-gray-100 dark:border-white/5 bg-white dark:bg-black relative z-20">
            <div className="flex items-center gap-5 min-w-max">

                {/* MY STORY (ADD) */}
                <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-1.5 cursor-pointer group"
                    onClick={onAddStory}
                >
                    <div className="relative">
                        <div className="w-[72px] h-[72px] rounded-full p-[3px] border-2 border-dashed border-gray-300 dark:border-zinc-800 group-hover:border-moto-accent transition-colors flex items-center justify-center">
                            <UserAvatar name={user?.name || 'Sen'} size={60} className="w-full h-full border-2 border-white dark:border-black" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-moto-accent rounded-full border-2 border-white dark:border-black flex items-center justify-center shadow-md">
                            <Plus size={14} className="text-black stroke-[3px]" />
                        </div>
                    </div>
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 group-hover:text-black dark:group-hover:text-white transition-colors">Hikayen</span>
                </motion.div>

                {/* OTHER STORIES */}
                {storyGroups.map((group, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        key={group.user._id}
                        className="flex flex-col items-center gap-1.5 cursor-pointer group"
                        onClick={() => onStorySelect(group)}
                    >
                        <div className="relative w-[72px] h-[72px]">
                            {/* Gradient Ring for Unseen */}
                            {!group.allSeen && (
                                <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-moto-accent via-[#FF0080] to-[#7928CA] animate-spin-slow p-[3px]" />
                            )}

                            {/* Container */}
                            <div className={`absolute inset-[3px] rounded-full bg-white dark:bg-black p-[3px] ${group.allSeen ? 'border-2 border-gray-200 dark:border-zinc-800' : ''}`}>
                                <img
                                    src={group.user.avatar || `https://ui-avatars.com/api/?name=${group.user.name}&background=random`}
                                    className="w-full h-full rounded-full object-cover"
                                    alt={group.user.name}
                                />
                            </div>
                        </div>

                        <span className={`text-[11px] max-w-[70px] truncate text-center transition-colors ${!group.allSeen ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-500 dark:text-gray-400 group-hover:text-gray-300'}`}>
                            {group.user.name.split(' ')[0]}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
