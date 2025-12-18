import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, X, ChevronRight, Share2, Heart } from 'lucide-react';
import { storyService } from '../services/storyService';

// --- Types ---
interface Story {
    id: string;
    title: string;
    category: string;
    coverImg: string;
    videoUrl: string;
    duration: string;
}

// --- Mock Data ---
const STORIES: Story[] = [
    {
        id: '1',
        title: 'TRACK DAY 2024',
        category: 'EVENT',
        coverImg: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=800',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-riding-a-motorcycle-on-a-curvy-road-4563/1080p.mp4',
        duration: '0:45',
    },
    {
        id: '2',
        title: 'NEW ARRIVALS',
        category: 'GEAR',
        coverImg: 'https://images.unsplash.com/photo-1622185135505-2d795043997a?auto=format&fit=crop&q=80&w=800',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-motorcycle-helmet-closeup-5388/1080p.mp4',
        duration: '0:30',
    },
    {
        id: '3',
        title: 'NIGHT RIDE',
        category: 'LIFESTYLE',
        coverImg: 'https://images.unsplash.com/photo-1625043484555-47841a723e74?auto=format&fit=crop&q=80&w=800',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-person-riding-a-motorcycle-at-night-4261/1080p.mp4',
        duration: '1:15',
    },
    {
        id: '4',
        title: 'MT-09 REVIEW',
        category: 'REVIEWS',
        coverImg: 'https://images.unsplash.com/photo-1596706173770-3d7793b8e894?auto=format&fit=crop&q=80&w=800',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-motorcycle-exhaust-smoke-4569/1080p.mp4',
        duration: '5:20',
    },
    {
        id: '5',
        title: 'SUMMER VIBES',
        category: 'COMMUNITY',
        coverImg: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
        videoUrl: 'https://cdn.coverr.co/videos/coverr-friends-riding-motorcycles-together-4682/1080p.mp4',
        duration: '0:55',
    }
];

// Mock story service for demonstration
const storyService = {
    getStories: (): Promise<Story[]> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(STORIES);
            }, 500); // Simulate network delay
        });
    }
};

const StorySection: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [stories, setStories] = useState<Story[]>([]);

    useEffect(() => {
        storyService.getStories().then(setStories);
    }, []);

    // Lock body scroll when modal is open
    useEffect(() => {
        if (selectedId) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [selectedId]);

    if (!stories.length) return null; // Or loading state

    return (
        <div className="py-12 bg-[#0a0a0a] overflow-hidden select-none">
            <div className="container mx-auto px-4 md:px-8 mb-6 flex items-end justify-between">
                <div>
                    <h2 className="text-3xl font-display font-black text-white leading-none tracking-tight">
                        THE VELOCITY <span className="text-orange-600">REEL</span>
                    </h2>
                    <p className="text-gray-400 text-sm mt-2 font-medium tracking-wide">
                        CATCH THE VIBE
                    </p>
                </div>

                {/* Scroll hint / Controls could go here */}
                <div className="hidden md:flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                    <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                </div>
            </div>

            {/* Reel Container */}
            <div className="overflow-x-auto no-scrollbar pb-12 pt-4 pl-4 md:pl-8 flex gap-6 snap-x snap-mandatory">
                {stories.map((story) => (
                    <StoryCard
                        key={story.id || story._id}
                        story={story}
                        onClick={() => setSelectedId(story.id || story._id)}
                    />
                ))}
            </div>

            {/* Full Screen Viewer */}
            <AnimatePresence>
                {selectedId && (
                    <FullScreenStory
                        story={stories.find(s => (s.id || s._id) === selectedId)!}
                        onClose={() => setSelectedId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

// --- Sub-Components ---

const StoryCard: React.FC<{ story: Story; onClick: () => void }> = ({ story, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (isHovered) {
            videoRef.current?.play().catch(() => { });
        } else {
            videoRef.current?.pause();
            if (videoRef.current) videoRef.current.currentTime = 0;
        }
    }, [isHovered]);

    return (
        <motion.div
            layoutId={`card-container-${story.id}`}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="relative flex-shrink-0 w-[200px] h-[300px] md:w-[260px] md:h-[390px] rounded-2xl cursor-pointer overflow-hidden snap-center group border border-white/5 hover:border-orange-500/50 transition-colors duration-300"
            whileHover={{ scale: 1.02 }}
        >
            {/* Background Media */}
            <div className="absolute inset-0 bg-gray-900">
                <motion.img
                    layoutId={`media-${story.id}`}
                    src={story.coverImg}
                    alt={story.title}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-0' : 'opacity-100'}`}
                />
                <video
                    ref={videoRef}
                    src={story.videoUrl}
                    muted
                    loop
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
                />
            </div>

            {/* Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

            {/* Content */}
            <div className="absolute inset-0 p-5 flex flex-col justify-between">
                <div className="flex justify-between items-start">
                    <span className="bg-black/40 backdrop-blur-md text-[10px] font-bold text-white px-2 py-1 rounded border border-white/10 uppercase tracking-widest">
                        {story.category}
                    </span>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white"
                        >
                            <Play size={12} fill="currentColor" />
                        </motion.div>
                    )}
                </div>

                <div>
                    <h3 className="text-white font-bold text-lg leading-tight uppercase font-display tracking-wide group-hover:text-orange-500 transition-colors">
                        {story.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                        <Play size={12} className="text-orange-500 fill-orange-500" />
                        <span className="text-xs text-gray-300 font-medium">{story.duration}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const FullScreenStory: React.FC<{ story: Story; onClose: () => void }> = ({ story, onClose }) => {
    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Backdrop (Blurred) */}
            <div className="absolute inset-0 bg-black/95 backdrop-blur-3xl">
                <img
                    src={story.coverImg}
                    className="w-full h-full object-cover opacity-20 blur-3xl scale-110"
                    alt="blur-bg"
                />
            </div>

            {/* Main Card Expansion */}
            <motion.div
                layoutId={`card-container-${story.id}`}
                className="relative w-full h-full md:w-[95vw] md:h-[90vh] md:max-w-6xl md:rounded-3xl overflow-hidden bg-black shadow-2xl flex flex-col md:flex-row"
            >
                {/* Close Button Mobile */}
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="absolute top-4 right-4 z-50 p-2 bg-black/50 text-white rounded-full backdrop-blur-md md:hidden hover:bg-white/20"
                >
                    <X size={24} />
                </button>

                {/* Video Section (Left / Top) */}
                <div className="relative w-full h-[60vh] md:h-full md:w-3/4 bg-black">
                    <motion.img
                        layoutId={`media-${story.id}`}
                        src={story.coverImg}
                        className="absolute inset-0 w-full h-full object-cover opacity-0" // Hidden immediately, showing video
                    />
                    <video
                        src={story.videoUrl}
                        autoPlay
                        loop
                        controls
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent md:hidden" />
                </div>

                {/* Details Section (Right / Bottom) */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="relative h-[40vh] md:h-full md:w-1/4 bg-[#111] p-6 md:p-8 flex flex-col border-l border-white/5"
                >
                    {/* Close Button Desktop */}
                    <div className="hidden md:flex justify-end mb-8">
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="flex-1">
                        <span className="text-orange-500 font-bold text-xs tracking-widest uppercase mb-2 block">
                            {story.category}
                        </span>
                        <h2 className="text-3xl md:text-3xl font-display font-black text-white leading-none uppercase mb-4">
                            {story.title}
                        </h2>
                        <p className="text-gray-400 text-sm leading-relaxed mb-6">
                            Experience the thrill of the ride. This exclusive coverage brings you closer to the action than ever before.
                        </p>

                        <div className="flex gap-4 mb-8">
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-white">2.4k</span>
                                <span className="text-xs text-gray-500">Likes</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-white">108</span>
                                <span className="text-xs text-gray-500">Comments</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-lg font-bold text-white">{story.duration}</span>
                                <span className="text-xs text-gray-500">Duration</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 mt-auto">
                        <button className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-transform hover:scale-[1.02]">
                            HEMEN İZLE <Play size={16} fill="white" />
                        </button>
                        <div className="flex gap-3">
                            <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                                <Heart size={18} /> Beğen
                            </button>
                            <button className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
                                <Share2 size={18} /> Paylaş
                            </button>
                        </div>
                    </div>

                </motion.div>
            </motion.div>
        </motion.div>
    );
};

export default StorySection;
