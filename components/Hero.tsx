import React, { useState, useEffect, useRef } from 'react';
import ReactPlayer from 'react-player';
import { ViewState, Slide } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { DEFAULT_SLIDES } from '../constants';
import { sliderService } from '../services/sliderService';
import { useLanguage } from '../contexts/LanguageProvider';
import { ArrowRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/Button';

interface HeroProps {
    onNavigate: (view: ViewState) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
    // Bypass strict type checking for ReactPlayer due to environment mismatches
    const Player = ReactPlayer as any;
    const { t } = useLanguage();
    const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isAutoPlay, setIsAutoPlay] = useState(true);
    const [isMuted, setIsMuted] = useState(true);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isPlaying, setIsPlaying] = useState(true);

    const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const AUTO_PLAY_DURATION = 8000;
    const playerRef = useRef<any>(null);

    useEffect(() => {
        const loadSlides = async () => {
            const fetchedSlides = await sliderService.getSlides();
            if (fetchedSlides && fetchedSlides.length > 0) {
                setSlides(fetchedSlides);
            }
        };
        loadSlides();
    }, []);

    useEffect(() => {
        if (isAutoPlay) {
            autoPlayRef.current = setInterval(() => {
                nextSlide();
            }, AUTO_PLAY_DURATION);
        }
        return () => stopAutoPlay();
    }, [currentSlide, isAutoPlay, isPlaying]);

    const stopAutoPlay = () => {
        if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        setMousePosition({
            x: (clientX / innerWidth - 0.5) * 20,
            y: (clientY / innerHeight - 0.5) * 20
        });
    };

    const togglePlayPause = () => {
        const newStatus = !isPlaying;
        setIsPlaying(newStatus);
        setIsAutoPlay(newStatus); // Sync auto slide with video play status
    };

    const current = slides[currentSlide];
    const isVideo = current.type === 'video' && !!current.videoUrl;

    return (
        <section
            className="relative w-full h-screen min-h-[800px] overflow-hidden bg-black text-white group"
            onMouseMove={handleMouseMove}
        >
            {/* 1. BACKGROUND LAYER (Media) */}
            <AnimatePresence mode='wait'>
                <motion.div
                    key={current._id}
                    className="absolute inset-0 w-full h-full bg-black"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                >
                    {isVideo ? (
                        <div className="relative w-full h-full">
                            {/* REACT PLAYER INTEGRATION */}
                            <Player
                                ref={playerRef}
                                url={current.videoUrl}
                                playing={isPlaying}
                                muted={isMuted}
                                loop={true}
                                width="100%"
                                height="100%"
                                className="react-player absolute top-0 left-0"
                                style={{ objectFit: 'cover', position: 'absolute', top: 0, left: 0 }}
                                controls={false}
                                playsinline={true}
                                config={{
                                    youtube: {
                                        playerVars: {
                                            showinfo: 0,
                                            controls: 0,
                                            disablekb: 1,
                                            modestbranding: 1,
                                            rel: 0
                                        }
                                    },
                                    file: {
                                        attributes: {
                                            style: { width: '100%', height: '100%', objectFit: 'cover' },
                                            muted: isMuted, // Enforce mute on attribute level for autoplay policy
                                            autoPlay: isPlaying,
                                            playsInline: true
                                        }
                                    }
                                } as any}
                            />
                            {/* Texture Overlay */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>
                        </div>
                    ) : (
                        <motion.img
                            key={current.image}
                            src={current.image}
                            initial={{ scale: 1.1 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 6, ease: "linear" }}
                            className="w-full h-full object-cover opacity-80"
                        />
                    )}

                    {/* Gradient Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-90"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>
                </motion.div>
            </AnimatePresence>

            {/* 2. CONTENT LAYER */}
            <div className="relative z-20 h-full container mx-auto px-6 md:px-12 flex items-center">
                <div className="w-full lg:w-2/3 xl:w-1/2">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current._id + "-content"}
                            style={{ x: mousePosition.x * -1, y: mousePosition.y * -1 }}
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="space-y-6"
                        >
                            {/* Badge */}
                            <div className="flex items-center gap-4">
                                <div className="h-[1px] w-12 bg-[#E2FF3B]"></div>
                                <span className="text-[#E2FF3B] font-mono text-sm tracking-[0.2em] font-bold uppercase">
                                    {isVideo ? 'CINEMATIC EXPERIENCE' : 'PREMIUM COLLECTION'}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-5xl md:text-7xl xl:text-8xl font-black text-white leading-[0.9] tracking-tighter mix-blend-difference">
                                {current.title.split(' ').map((word, i) => (
                                    <span key={i} className="block">{word}</span>
                                ))}
                            </h1>

                            {/* Subtitle */}
                            <p className="text-lg md:text-xl text-gray-300 font-light max-w-md leading-relaxed border-l-2 border-[#E2FF3B] pl-4">
                                {current.subtitle}
                            </p>

                            {/* CTA Buttons */}
                            <div className="flex items-center gap-4 pt-4">
                                <Button
                                    onClick={() => onNavigate(current.action as ViewState)}
                                    className="bg-[#E2FF3B] text-black hover:bg-white px-8 py-6 rounded-none text-lg font-bold tracking-wide transition-all clip-path-slant"
                                >
                                    {current.cta} <ArrowRight className="ml-2 w-5 h-5" />
                                </Button>

                                {isVideo && (
                                    <button
                                        onClick={() => setIsMuted(!isMuted)}
                                        className="w-14 h-14 flex items-center justify-center border border-white/20 hover:bg-white/10 text-white rounded-full transition-colors backdrop-blur-sm"
                                    >
                                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* 3. CONTROLS */}
            <div className="absolute bottom-10 right-10 z-30 flex flex-col items-end gap-6">

                {/* Custom Pagination */}
                <div className="flex gap-2">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => { setCurrentSlide(idx); setIsPlaying(true); }}
                            className={`h-1 transition-all duration-300 ${currentSlide === idx ? 'w-12 bg-[#E2FF3B]' : 'w-4 bg-white/30 hover:bg-white/60'}`}
                        />
                    ))}
                </div>

                {/* Play/Pause Control */}
                <div className="flex items-center gap-4">
                    <span className="text-xs font-mono text-white/50 tracking-widest">
                        {currentSlide + 1} / {slides.length}
                    </span>
                    <button
                        onClick={togglePlayPause}
                        className="w-12 h-12 flex items-center justify-center border border-white/20 hover:bg-white hover:text-black text-white rounded-full transition-all"
                    >
                        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-1" />}
                    </button>
                </div>
            </div>

            {/* CSS for custom object-fit on React Player */}
            <style>{`
                .react-player video {
                    object-fit: cover;
                }
            `}</style>
        </section>
    );
};
