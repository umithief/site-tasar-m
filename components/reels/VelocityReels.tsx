
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Zap, Plus, Film } from 'lucide-react';
import { api } from '../../services/api';
import { ReelPlayer } from './ReelPlayer';

export const VelocityReels: React.FC = () => {
    const [reels, setReels] = useState<any[]>([]);
    const [selectedReelIndex, setSelectedReelIndex] = useState<number | null>(null);

    // Video hover preview refs
    const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

    useEffect(() => {
        api.get('/reels').then(res => setReels(res.data)).catch(console.error);
    }, []);

    const handleMouseEnter = (index: number) => {
        const video = videoRefs.current[index];
        if (video) {
            video.currentTime = 0;
            video.play().catch(() => { });
            video.muted = false;
        }
    };

    const handleMouseLeave = (index: number) => {
        const video = videoRefs.current[index];
        if (video) {
            video.pause();
            video.currentTime = 0;
            video.muted = true;
        }
    };

    return (
        <section className="relative py-24 bg-[#050505] border-y border-white/5">
            <div className="container mx-auto px-8 mb-12 flex items-baseline justify-between">
                <h2 className="text-xs font-bold tracking-[0.3em] text-[#FF4500] uppercase flex items-center gap-4">
                    <Film className="w-4 h-4" />
                    VELOCITY_ARCHIVE
                </h2>
                <div className="h-[1px] flex-1 bg-white/10 mx-8" />
                <span className="font-mono text-[9px] text-gray-600">REQ_ID: 2049</span>
            </div>

            {/* FILMSTRIP LAYOUT */}
            <div className="flex overflow-x-auto gap-[2px] px-8 pb-8 no-scrollbar touch-pan-x">
                {reels.map((reel, index) => (
                    <motion.div
                        key={reel._id}
                        initial={{ opacity: 0, filter: 'grayscale(100%)' }}
                        whileInView={{ opacity: 1, filter: 'grayscale(100%)' }}
                        whileHover={{ filter: 'grayscale(0%)', width: 300, zIndex: 10 }} // Expand on hover
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="group relative flex-shrink-0 w-[180px] h-[320px] bg-black cursor-pointer overflow-hidden border-r border-white/5 last:border-r-0"
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={() => handleMouseLeave(index)}
                        onClick={() => setSelectedReelIndex(index)}
                    >
                        <video
                            ref={el => videoRefs.current[index] = el}
                            src={reel.videoUrl}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-300"
                            muted
                            playsInline
                            loop
                        />

                        {/* GHOST UI */}
                        <div className="absolute inset-0 flex flex-col justify-end p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/90 to-transparent">
                            <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                                <h3 className="text-white text-sm font-bold uppercase tracking-widest mb-1 leading-none">{reel.userName}</h3>
                                <p className="text-[10px] text-gray-400 font-mono truncate">{reel.caption}</p>
                            </div>
                        </div>

                        {/* Flash Effect Overlay */}
                        <div className="absolute inset-0 bg-white mix-blend-overlay opacity-0 group-hover:opacity-10 transition-opacity duration-100" />
                    </motion.div>
                ))}
            </div>

            {/* Upload Trigger */}
            <div className="flex justify-center mt-12">
                <button className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.2em] text-gray-600 hover:text-[#FF4500] transition-colors">
                    <Plus className="w-4 h-4" /> Initiate_Upload
                </button>
            </div>

            <AnimatePresence>
                {selectedReelIndex !== null && (
                    <ReelPlayer
                        reels={reels}
                        initialIndex={selectedReelIndex}
                        onClose={() => setSelectedReelIndex(null)}
                    />
                )}
            </AnimatePresence>
        </section>
    );
};
