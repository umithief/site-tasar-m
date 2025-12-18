import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ChevronRight, Heart, Share2 } from 'lucide-react';

// --- Types ---
interface Story {
    id: string;
    title: string;
    image: string;
    video?: string; // Optional video URL
    duration: number; // in seconds
    color: string; // Accent color for the blob border
}

// --- Mock Data ---
const STORIES: Story[] = [
    {
        id: '1',
        title: 'Yeni Kasklar',
        image: 'https://images.unsplash.com/photo-1622185135505-2d795043997a?auto=format&fit=crop&q=80&w=600',
        duration: 5,
        color: '#F2994A', // Orange
    },
    {
        id: '2',
        title: 'Gece Sürüşü',
        image: 'https://images.unsplash.com/photo-1625043484555-47841a723e74?auto=format&fit=crop&q=80&w=600',
        duration: 8,
        color: '#00F260', // Neon Green
    },
    {
        id: '3',
        title: 'Pist Günü',
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&q=80&w=600',
        duration: 10,
        color: '#0575E6', // Blue
    },
    {
        id: '4',
        title: 'Kampanya',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600',
        duration: 6,
        color: '#8E2DE2', // Purple
    },
    {
        id: '5',
        title: 'Atölye',
        image: 'https://images.unsplash.com/photo-1596706173770-3d7793b8e894?auto=format&fit=crop&q=80&w=600',
        duration: 7,
        color: '#FF416C', // Red
    },
];

// --- Organic Shape Variants ---
// These border-radius values create the "liquid" morphing effect
const blobVariants = {
    initial: {
        borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%",
    },
    animate: {
        borderRadius: [
            "60% 40% 30% 70% / 60% 30% 70% 40%",
            "30% 60% 70% 40% / 50% 60% 30% 60%",
            "60% 40% 30% 70% / 60% 30% 70% 40%",
        ],
        transition: {
            duration: 4,
            ease: "easeInOut",
            repeat: Infinity,
        },
    },
    hover: {
        scale: 1.1,
        transition: { duration: 0.3 },
    },
};

const StoryBlobs: React.FC = () => {
    const [selectedId, setSelectedId] = useState<string | null>(null);

    return (
        <section className="py-12 bg-gray-50 overflow-hidden min-h-[300px] flex items-center">
            <div className="container mx-auto px-4">
                {/* Title */}
                <div className="mb-8 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                        Hikayeler <span className="text-orange-500 text-sm ml-2 align-top">🔥</span>
                    </h2>
                </div>

                {/* Blobs Container */}
                <div className="flex gap-8 overflow-x-auto pb-12 pt-4 px-4 no-scrollbar items-center">
                    {STORIES.map((story) => (
                        <StoryBlob
                            key={story.id}
                            story={story}
                            onClick={() => setSelectedId(story.id)}
                        />
                    ))}
                </div>
            </div>

            {/* Full Screen View */}
            <AnimatePresence>
                {selectedId && (
                    <FullScreenStory
                        story={STORIES.find(s => s.id === selectedId)!}
                        onClose={() => setSelectedId(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};

// --- Sub-Components ---

const StoryBlob: React.FC<{ story: Story; onClick: () => void }> = ({ story, onClick }) => {
    return (
        <div className="relative group cursor-pointer flex-shrink-0 flex flex-col items-center gap-3">
            <motion.div
                layoutId={`container-${story.id}`}
                className="relative w-24 h-24 md:w-28 md:h-28"
                onClick={onClick}
                whileHover="hover"
                initial="initial"
                animate="animate"
            >
                {/* Glowing Border Ring */}
                <motion.div
                    variants={blobVariants}
                    className="absolute inset-0 border-[3px] border-transparent"
                    style={{
                        borderColor: story.color,
                        boxShadow: `0 0 15px ${story.color}60`
                    }}
                />

                {/* Masked Content */}
                <motion.div
                    variants={blobVariants}
                    className="absolute inset-[4px] overflow-hidden bg-gray-900"
                >
                    <motion.img
                        layoutId={`image-${story.id}`}
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                    />
                    {/* Play Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Play className="w-8 h-8 text-white fill-white drop-shadow-lg" />
                    </div>
                </motion.div>
            </motion.div>

            {/* Title */}
            <motion.span
                initial={{ opacity: 0.8 }}
                whileHover={{ opacity: 1, y: -2 }}
                className="text-sm font-semibold text-gray-700 max-w-[100px] text-center truncate"
            >
                {story.title}
            </motion.span>
        </div>
    );
};

const FullScreenStory: React.FC<{ story: Story; onClose: () => void }> = ({ story, onClose }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(old => {
                if (old >= 100) {
                    clearInterval(timer);
                    onClose();
                    return 100;
                }
                return old + (100 / (story.duration * 10)); // Update every 100ms
            });
        }, 100);

        return () => clearInterval(timer);
    }, [story.duration, onClose]);

    return (
        <motion.div
            layoutId={`container-${story.id}`}
            className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center"
            initial={{ borderRadius: 0 }}
            animate={{ borderRadius: 0 }}
            exit={{ opacity: 0 }}
        >
            {/* Background Blur */}
            <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl z-0" />

            {/* Content Container */}
            <div className="relative w-full h-full max-w-md md:max-h-[90vh] md:rounded-2xl overflow-hidden bg-gray-900 shadow-2xl z-10">

                {/* Progress Bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-white/20 z-30 flex gap-1 px-1 pt-2">
                    <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-white"
                            style={{ width: `${progress}%` }}
                            transition={{ ease: "linear", duration: 0.1 }}
                        />
                    </div>
                </div>

                {/* Header */}
                <div className="absolute top-4 left-0 right-0 z-30 px-4 flex items-center justify-between mt-2">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-yellow-500 p-[2px]">
                            <img
                                src="https://images.unsplash.com/photo-1549497557-d54cd2f0802a?fit=crop&w=100&h=100"
                                className="w-full h-full rounded-full object-cover border border-white"
                                alt="Avatar"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white text-sm font-bold shadow-black drop-shadow-md">MotoVibe</span>
                            <span className="text-white/80 text-xs">2 saat önce</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-black/20 hover:bg-black/40 rounded-full text-white backdrop-blur-md transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Main Content (Image/Video) */}
                <motion.img
                    layoutId={`image-${story.id}`}
                    src={story.image}
                    className="w-full h-full object-cover"
                    alt={story.title}
                />

                {/* Gradient Overlay at Bottom */}
                <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent z-20" />

                {/* Bottom Actions */}
                <div className="absolute bottom-6 left-0 right-0 z-30 px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button className="text-white hover:scale-110 transition-transform">
                            <Heart className="w-7 h-7" />
                        </button>
                        <button className="text-white hover:scale-110 transition-transform">
                            <Share2 className="w-7 h-7" />
                        </button>
                    </div>

                    <button className="px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-bold text-sm flex items-center gap-2 transition-colors">
                        İncele <ChevronRight size={16} />
                    </button>
                </div>

            </div>
        </motion.div>
    );
};

export default StoryBlobs;
