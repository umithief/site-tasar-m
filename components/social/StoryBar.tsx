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
        <div className="w-full overflow-x-auto py-5 px-4 no-scrollbar border-b border-gray-100 dark:border-white/5 bg-white dark:bg-black relative z-20">
            <div className="flex items-center gap-4 min-w-max pl-2">

                {/* MY STORY (ADD) */}
                <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center gap-2 cursor-pointer group relative"
                    onClick={onAddStory}
                >
                    <div className="relative w-[72px] h-[72px]">
                        <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-gray-300 dark:border-white/20 group-hover:border-moto-accent transition-colors" />
                        <div className="absolute inset-[4px] rounded-xl overflow-hidden bg-gray-100 dark:bg-zinc-900 flex items-center justify-center">
                            <UserAvatar name={user?.name || 'Sen'} size={50} className="w-full h-full rounded-none" />
                        </div>

                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-moto-accent rounded-lg border-2 border-white dark:border-black flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform">
                            <Plus size={14} className="text-black stroke-[3px]" />
                        </div>
                    </div>
                </motion.div>

                {/* SEPARATOR */}
                <div className="w-[1px] h-10 bg-gray-200 dark:bg-white/10 mx-1" />

                {/* OTHER STORIES */}
                {storyGroups.map((group, index) => (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        key={group.user._id}
                        className="flex flex-col items-center gap-2 cursor-pointer group"
                        onClick={() => onStorySelect(group)}
                    >
                        <div className="relative w-[72px] h-[72px]">
                            {/* Gradient Ring (Squircle) */}
                            {!group.allSeen && (
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-moto-accent via-rose-500 to-amber-500 p-[2px] animate-gradient-xy">
                                    <div className="w-full h-full bg-black rounded-2xl" />
                                </div>
                            )}

                            {/* Image Container */}
                            <div className={`absolute inset-[2px] rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border-2 ${group.allSeen ? 'border-gray-200 dark:border-white/10' : 'border-black dark:border-black'}`}>
                                <img
                                    src={group.user.avatar || `https://ui-avatars.com/api/?name=${group.user.name}&background=random`}
                                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                    alt={group.user.name}
                                />

                                {/* Gradient Overlay on Image */}
                                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/0 to-black/40 opacity-60" />
                            </div>

                            {/* Name Overlay (Inside Card) */}
                            <div className="absolute bottom-1 left-1 right-1 text-center">
                                <span className="text-[9px] font-bold text-white drop-shadow-md truncate block">
                                    {group.user.name.split(' ')[0]}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
