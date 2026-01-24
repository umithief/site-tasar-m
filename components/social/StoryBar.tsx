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
        <div className="w-full overflow-x-auto py-1 px-0 no-scrollbar border-none bg-transparent relative z-20">
            <div className="flex items-center gap-5 min-w-max pl-4">

                {/* MY STORY (ADD) */}
                <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-1 cursor-pointer group relative"
                    onClick={onAddStory}
                >
                    <div className="relative w-[70px] h-[70px]">
                        <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300 dark:border-white/20 group-hover:border-[#E2FF3B] transition-colors" />
                        <div className="absolute inset-[4px] rounded-full overflow-hidden bg-gray-200 dark:bg-zinc-900 flex items-center justify-center">
                            <UserAvatar
                                src={user?.profileImage || user?.avatar}
                                name={user?.name || 'Sen'}
                                size={62}
                                className="w-full h-full rounded-full"
                            />
                        </div>

                        <div className="absolute bottom-0 right-0 w-6 h-6 bg-[#E2FF3B] rounded-full border-2 border-white dark:border-black flex items-center justify-center shadow-lg">
                            <Plus size={14} className="text-black stroke-[3px]" />
                        </div>
                    </div>
                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400">Senin Hikayen</span>
                </motion.div>

                {/* OTHER STORIES */}
                {storyGroups.map((group, index) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        whileTap={{ scale: 0.95 }}
                        key={group.user._id}
                        className="flex flex-col items-center gap-1 cursor-pointer group"
                        onClick={() => onStorySelect(group)}
                    >
                        <div className="relative w-[74px] h-[74px] flex items-center justify-center">
                            {/* Tachometer Ring */}
                            {!group.allSeen ? (
                                <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_180deg,#E2FF3B,#00F0FF,#E2FF3B)] animate-spin-slow p-[2px]">
                                    <div className="w-full h-full bg-white dark:bg-black rounded-full" />
                                </div>
                            ) : (
                                <div className="absolute inset-0 rounded-full border border-gray-200 dark:border-white/10" />
                            )}

                            {/* Image Container */}
                            <div className="absolute inset-[4px] rounded-full overflow-hidden border-2 border-white dark:border-black">
                                <img
                                    src={group.user.avatar || `https://ui-avatars.com/api/?name=${group.user.name}&background=random`}
                                    className="w-full h-full object-cover"
                                    alt={group.user.name}
                                />
                            </div>
                        </div>
                        <span className="text-[10px] font-medium text-gray-900 dark:text-white truncate max-w-[70px] text-center">
                            {group.user.name.split(' ')[0]}
                        </span>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
