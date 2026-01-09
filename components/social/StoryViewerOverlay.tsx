import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Send, X, ChevronLeft, ChevronRight, MessageCircle } from 'lucide-react';
import { StoryGroup, storyService } from '../../services/storyService';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface StoryViewerProps {
    initialGroup: StoryGroup;
    allGroups: StoryGroup[];
    onClose: () => void;
    onGroupChange: (groupId: string) => void;
}

export const StoryViewerOverlay: React.FC<StoryViewerProps> = ({ initialGroup, allGroups, onClose, onGroupChange }) => {
    // Current Group & Story Indices
    const [activeGroupIndex, setActiveGroupIndex] = useState(allGroups.findIndex(g => g.user._id === initialGroup.user._id));
    const [activeStoryIndex, setActiveStoryIndex] = useState(0); // Start from first unseen preferably, but 0 for now

    // UI State
    const [isPaused, setIsPaused] = useState(false);
    const progressRef = useRef<number>(0);
    const [progress, setProgress] = useState(0);

    const activeGroup = allGroups[activeGroupIndex];
    if (!activeGroup) return null;

    const activeStory = activeGroup.stories[activeStoryIndex];

    // Mark as viewed on entry
    useEffect(() => {
        if (activeStory && !activeStory.seen) {
            storyService.viewStory(activeStory._id).catch(console.error);
        }
    }, [activeStory._id]);

    // Timer Logic
    useEffect(() => {
        if (isPaused) return;

        const duration = 5000; // 5s per story
        const interval = 50; // Update every 50ms
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress(prev => {
                const next = prev + step;
                if (next >= 100) {
                    handleNext();
                    return 0;
                }
                return next;
            });
        }, interval);

        return () => clearInterval(timer);
    }, [activeStoryIndex, activeGroupIndex, isPaused]);

    // Reset progress on story change
    useEffect(() => {
        setProgress(0);
    }, [activeStoryIndex, activeGroupIndex]);

    const handleNext = () => {
        if (activeStoryIndex < activeGroup.stories.length - 1) {
            setActiveStoryIndex(prev => prev + 1);
        } else {
            // Next Group
            if (activeGroupIndex < allGroups.length - 1) {
                setActiveGroupIndex(prev => prev + 1);
                setActiveStoryIndex(0);
            } else {
                onClose(); // End of all stories
            }
        }
    };

    const handlePrev = () => {
        if (activeStoryIndex > 0) {
            setActiveStoryIndex(prev => prev - 1);
            setProgress(0); // Restart prev story
        } else {
            // Prev Group
            if (activeGroupIndex > 0) {
                setActiveGroupIndex(prev => prev - 1);
                setActiveStoryIndex(allGroups[activeGroupIndex - 1].stories.length - 1); // Go to last story of prev group
            } else {
                onClose();
            }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[200] bg-black flex flex-col"
        >
            {/* --- TOP PROGRESS BARS --- */}
            <div className="absolute top-4 left-2 right-2 flex gap-1 z-30">
                {activeGroup.stories.map((story, idx) => (
                    <div key={story._id} className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-white transition-all duration-100 ease-linear"
                            style={{
                                width: idx < activeStoryIndex ? '100%' :
                                    idx === activeStoryIndex ? `${progress}%` : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* --- HEADER --- */}
            <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-30">
                <div className="flex items-center gap-3">
                    <img src={activeGroup.user.avatar} className="w-10 h-10 rounded-full border border-white/20" />
                    <div>
                        <h4 className="text-white font-bold text-sm leading-tight">{activeGroup.user.name}</h4>
                        <span className="text-white/60 text-xs">
                            {formatDistanceToNow(new Date(activeStory.createdAt), { addSuffix: true, locale: tr })}
                        </span>
                    </div>
                </div>
                <div className="flex gap-4">
                    <button onClick={onClose} className="text-white/80 hover:text-white">
                        <X size={28} />
                    </button>
                </div>
            </div>

            {/* --- TOUCH ZONES FOR NAVIGATION --- */}
            <div className="absolute inset-0 z-20 flex">
                <div
                    className="w-1/3 h-full"
                    onClick={handlePrev}
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                />
                <div
                    className="w-2/3 h-full"
                    onClick={handleNext}
                    onMouseDown={() => setIsPaused(true)}
                    onMouseUp={() => setIsPaused(false)}
                    onTouchStart={() => setIsPaused(true)}
                    onTouchEnd={() => setIsPaused(false)}
                />
            </div>

            {/* --- CONTENT --- */}
            <div className="flex-1 relative bg-zinc-900 flex items-center justify-center">
                {activeStory.mediaType === 'VIDEO' ? (
                    <video
                        src={activeStory.mediaUrl}
                        className="w-full h-full object-cover"
                        autoPlay
                        playsInline // Important for mobile
                        loop // Optional, maybe loop until time runs out? Or sync duration?
                    // If syncing duration, we need onLoadedMetadata to set interval duration based on video length
                    />
                ) : (
                    <img src={activeStory.mediaUrl} className="w-full h-full object-cover" />
                )}
            </div>

            {/* --- BOTTOM ACTIONS --- */}
            <div className="absolute bottom-6 left-4 right-4 z-30 flex items-center gap-4">
                <div className="flex-1 relative">
                    <input
                        type="text"
                        placeholder="Mesaj Gönder..."
                        className="w-full bg-transparent border border-white/30 rounded-full px-6 h-12 text-white placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/10 transition-all backdrop-blur-md"
                        onFocus={() => setIsPaused(true)}
                        onBlur={() => setIsPaused(false)}
                    />
                </div>
                <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-95">
                    <Heart size={24} className="hover:text-red-500 transition-colors" />
                </button>
                <button className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/20 active:scale-95">
                    <Send size={24} className="-ml-1 mt-1 -rotate-45" />
                </button>
            </div>

        </motion.div>
    );
};
