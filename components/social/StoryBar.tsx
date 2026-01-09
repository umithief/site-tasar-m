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
            <div className="flex items-center gap-4 min-w-max">

                {/* MY STORY (ADD) */}
                <div className="flex flex-col items-center gap-1 cursor-pointer group" onClick={onAddStory}>
                    <div className="relative">
                        <div className="w-16 h-16 rounded-full p-[2px] bg-gray-200 dark:bg-zinc-800 border-2 border-transparent group-hover:border-gray-300 dark:group-hover:border-zinc-700 transition-colors">
                            <UserAvatar name={user?.name || 'Sen'} size={60} className="w-full h-full border-2 border-white dark:border-black" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-moto-accent rounded-full border-2 border-white dark:border-black flex items-center justify-center">
                            <Plus size={12} className="text-black stroke-[3px]" />
                        </div>
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400">Hikayen</span>
                </div>

                {/* OTHER STORIES */}
                {storyGroups.map((group) => (
                    <div
                        key={group.user._id}
                        className="flex flex-col items-center gap-1 cursor-pointer group"
                        onClick={() => onStorySelect(group)}
                    >
                        <div className={`relative w-16 h-16 rounded-full p-[2px] ${group.allSeen ? 'bg-gray-300 dark:bg-zinc-700' : 'bg-gradient-to-tr from-[#E2FF3B] to-orange-500 animate-pulse-slow p-[3px]'}`}>
                            <div className="w-full h-full rounded-full bg-white dark:bg-black p-[2px]">
                                <img
                                    src={group.user.avatar || `https://ui-avatars.com/api/?name=${group.user.name}&background=random`}
                                    className="w-full h-full rounded-full object-cover border border-white/10"
                                    alt={group.user.name}
                                />
                            </div>
                        </div>
                        <span className={`text-[10px] max-w-[70px] truncate text-center ${!group.allSeen ? 'font-bold text-gray-900 dark:text-white' : 'font-medium text-gray-500 dark:text-gray-400'}`}>
                            {group.user.name.split(' ')[0]}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};
