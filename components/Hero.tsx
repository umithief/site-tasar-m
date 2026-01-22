import React, { useState, useEffect, useRef } from 'react';
import { ViewState, Slide } from '../types';
import { AnimatePresence, motion } from 'framer-motion';
import { DEFAULT_SLIDES } from '../constants';
import { sliderService } from '../services/sliderService';
import { ArrowRight, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/Button';

interface HeroProps {
    onNavigate: (view: ViewState) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
    const [slides, setSlides] = useState<Slide[]>(DEFAULT_SLIDES);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isMuted, setIsMuted] = useState(true);
    const videoRef = useRef<HTMLVideoElement>(null);

    // Fetch slides from backend
    useEffect(() => {
        const loadSlides = async () => {
            try {
                const data = await sliderService.getSlides();
                if (data && data.length > 0) {
                    setSlides(data);
                }
            } catch (err) {
                console.error('Slider verisi alınamadı:', err);
            }
        };
        loadSlides();
    }, []);

    // Auto-slide every 6 seconds
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [slides.length]);

    // Play video when slide changes (for video slides)
    useEffect(() => {
        if (slides[currentSlide]?.type === 'video' && videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(e => console.log('Video autoplay blocked:', e));
        }
    }, [currentSlide, slides]);

    const current = slides[currentSlide];
    const isVideo = current?.type === 'video' && current?.videoUrl;

    const goNext = () => setCurrentSlide(prev => (prev + 1) % slides.length);
    const goPrev = () => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length);

    return (
        <section className="relative w-full h-screen min-h-[700px] bg-black overflow-hidden">

            {/* Background Media */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={current?._id || currentSlide}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className="absolute inset-0"
                >
                    {isVideo ? (
                        <video
                            ref={videoRef}
                            src={current.videoUrl}
                            poster={current.image}
                            autoPlay
                            loop
                            muted={isMuted}
                            playsInline
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <img
                            src={current?.image}
                            alt={current?.title}
                            className="w-full h-full object-cover"
                        />
                    )}

                    {/* Dark Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto px-6 md:px-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={current?._id + '-content'}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                            className="max-w-2xl"
                        >
                            {/* Badge */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-[2px] bg-[#E2FF3B]" />
                                <span className="text-[#E2FF3B] text-sm font-bold tracking-widest uppercase">
                                    {isVideo ? 'Video' : 'Koleksiyon'}
                                </span>
                            </div>

                            {/* Title */}
                            <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                                {current?.title}
                            </h1>

                            {/* Subtitle */}
                            <p className="text-lg text-gray-300 mb-8 max-w-lg">
                                {current?.subtitle}
                            </p>

                            {/* CTA Button */}
                            <Button
                                onClick={() => onNavigate(current?.action as ViewState)}
                                className="bg-[#E2FF3B] text-black hover:bg-white px-8 py-4 text-base font-bold"
                            >
                                {current?.cta || 'İNCELE'}
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>

            {/* Navigation Arrows */}
            <div className="absolute bottom-10 right-10 z-20 flex items-center gap-4">
                <button
                    onClick={goPrev}
                    className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                >
                    <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                    onClick={goNext}
                    className="w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                >
                    <ChevronRight className="w-5 h-5" />
                </button>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {slides.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentSlide(idx)}
                        className={`h-1 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-[#E2FF3B]' : 'w-4 bg-white/30'
                            }`}
                    />
                ))}
            </div>

            {/* Mute/Unmute Button (for video slides) */}
            {isVideo && (
                <button
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-10 left-10 z-20 w-12 h-12 rounded-full border border-white/30 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                >
                    {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
            )}
        </section>
    );
};
