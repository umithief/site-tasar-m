import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowLeft, ArrowRight, MapPin, Wind, Zap } from 'lucide-react';
import { heroService } from '../services/heroService';
import { Slide } from '../types';

export const HeroShowcase = () => {
    const [slides, setSlides] = useState<Slide[]>([]);
    const [index, setIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    // Initial Data Load
    useEffect(() => {
        const loadSlides = async () => {
            try {
                const data = await heroService.getSlides();
                const activeSlides = data.filter(s => s.isActive);
                if (activeSlides.length > 0) {
                    setSlides(activeSlides);
                }
            } catch (error) {
                console.error("Failed to load hero slides", error);
            }
        };
        loadSlides();
    }, []);

    // Mouse Parallax Logic
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth versions of mouse values
    const smoothX = useSpring(mouseX, { stiffness: 100, damping: 20 });
    const smoothY = useSpring(mouseY, { stiffness: 100, damping: 20 });

    // Transforms for layers
    const imageX = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
    const imageY = useTransform(smoothY, [-0.5, 0.5], [20, -20]);
    const imageRotateX = useTransform(smoothY, [-0.5, 0.5], [5, -5]);
    const imageRotateY = useTransform(smoothX, [-0.5, 0.5], [-5, 5]);

    const textX = useTransform(smoothX, [-0.5, 0.5], [10, -10]);
    const textY = useTransform(smoothY, [-0.5, 0.5], [10, -10]);

    // Update mouse position normalized (-0.5 to 0.5)
    const handleMouseMove = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const { width, height, left, top } = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        mouseX.set(x);
        mouseY.set(y);
    };

    // Auto Play
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            handleNext();
        }, 6000);
        return () => clearInterval(timer);
    }, [index, slides.length]);

    const handleNext = () => setIndex((prev) => (prev + 1) % slides.length);
    const handlePrev = () => setIndex((prev) => (prev - 1 + slides.length) % slides.length);

    if (slides.length === 0) return null;

    const activeSlide = slides[index];

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
            className="relative h-screen w-full overflow-hidden bg-black text-white font-sans selection:bg-[#E2FF3B] selection:text-black"
        >
            {/* 1. Background (Infinite Horizon) */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black opacity-80" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150" />
                {/* Subtle Grid Floor */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-1/2 bg-[linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:4rem_4rem] [transform:perspective(1000px)_rotateX(60deg)_translateY(200px)] origin-bottom opacity-20 pointer-events-none"
                    style={{ maskImage: 'linear-gradient(to top, black, transparent)' }}
                />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSlide._id}
                    className="absolute inset-0 z-10 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* LAYER 1: Vibe Text (Background Parallax) */}
                    <motion.div
                        style={{ x: textX, y: textY, scale: 1.1 }}
                        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden"
                    >
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 0.1, scale: 1 }}
                            exit={{ opacity: 0, scale: 1.2, filter: "blur(10px)" }}
                            transition={{ duration: 1, ease: "circOut" }}
                            className="text-[25vw] font-black uppercase tracking-tighter text-white stroke-text leading-none text-center opacity-10"
                            style={{
                                WebkitTextStroke: `2px ${activeSlide.accent || '#E2FF3B'}`
                            }}
                        >
                            {activeSlide.vibeText || 'MOTOVIBE'}
                        </motion.h1>
                    </motion.div>

                    {/* LAYER 2: The Machine (Middle) */}
                    <div className="absolute inset-0 z-20 flex items-center justify-center perspective-1000">
                        <motion.div
                            style={{
                                x: imageX,
                                y: imageY,
                                rotateX: imageRotateX,
                                rotateY: imageRotateY
                            }}
                            className="relative w-full max-w-5xl aspect-[16/9] flex items-center justify-center"
                        >
                            <motion.img
                                src={activeSlide.image}
                                alt={activeSlide.title}
                                initial={{ opacity: 0, scale: 0.8, y: 100, rotate: -5 }}
                                animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                                exit={{ opacity: 0, scale: 1.1, x: 100 }}
                                transition={{ duration: 0.8, ease: "circOut" }}
                                className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                            />
                            {/* Reflection/Shadow */}
                            <div className="absolute -bottom-10 left-10 right-10 h-20 bg-black/60 blur-3xl rounded-[100%]" />
                        </motion.div>
                    </div>

                    {/* LAYER 3: The Message (Front - HUD Overlay Style) */}
                    <div className="absolute inset-x-0 bottom-32 md:bottom-auto md:top-1/2 md:-translate-y-1/2 container mx-auto px-6 z-30 pointer-events-none">
                        <div className="max-w-4xl pt-48 md:pt-0">
                            <div className="overflow-hidden">
                                <motion.h2
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "-100%" }}
                                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
                                    className="text-5xl md:text-8xl font-black italic tracking-tighter text-white leading-[0.9] mb-4 drop-shadow-2xl"
                                >
                                    {activeSlide.title.split(' ').map((word, i) => (
                                        <span key={i} className="block md:inline-block mr-4">{word}</span>
                                    ))}
                                </motion.h2>
                            </div>

                            <div className="overflow-hidden">
                                <motion.p
                                    initial={{ y: "100%", opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: "50%", opacity: 0 }}
                                    transition={{ duration: 0.6, ease: "easeOut", delay: 0.4 }}
                                    className="text-lg md:text-2xl text-zinc-400 font-medium tracking-wide max-w-xl mb-8 md:mb-12 backdrop-blur-sm"
                                >
                                    {activeSlide.subtitle}
                                </motion.p>
                            </div>

                            <motion.button
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5, delay: 0.6 }}
                                className="pointer-events-auto group relative px-8 py-4 bg-white/5 backdrop-blur-md border border-white/20 text-white font-bold uppercase tracking-[0.2em] rounded-sm overflow-hidden hover:bg-white hover:text-black transition-all duration-300"
                                style={{ borderColor: activeSlide.accent || '#E2FF3B' }}
                            >
                                <span className="relative z-10 flex items-center gap-3">
                                    {activeSlide.buttonText || 'İNCELE'}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                                {/* Hover Fill Effect */}
                                <div
                                    className="absolute inset-0 bg-white translate-y-[101%] group-hover:translate-y-0 transition-transform duration-300"
                                    style={{ backgroundColor: activeSlide.accent || '#E2FF3B' }}
                                />
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* --- HUD ELEMENTS & CONTROLS --- */}

            {/* Top Left: Location/Time */}
            <div className="absolute top-safe-top left-6 md:left-12 z-40 flex items-center gap-4 text-[10px] md:text-xs font-mono text-zinc-500 tracking-widest uppercase pointer-events-none">
                <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#E2FF3B]" />
                    <span>34.0522° N, 118.2437° W</span>
                </div>
                <span className="w-px h-4 bg-zinc-800" />
                <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4" />
                    <span>14 KM/H NE</span>
                </div>
            </div>

            {/* Top Right: Status */}
            <div className="absolute top-safe-top right-6 md:right-12 z-40 flex items-center gap-2 pointer-events-none">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] md:text-xs font-mono text-white tracking-widest uppercase">LIVE SYSTEM</span>
            </div>

            {/* Bottom Controls */}
            <div className="absolute bottom-12 left-0 right-0 z-40 px-6 md:px-12 flex items-end justify-between pointer-events-auto">
                {/* RPM Style Progress Bar */}
                <div className="flex-1 max-w-md hidden md:flex flex-col gap-2">
                    <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                        <span>00</span>
                        <span>0{index + 1} / 0{slides.length}</span>
                    </div>
                    <div className="h-0.5 bg-zinc-800 w-full relative overflow-hidden">
                        <motion.div
                            key={index}
                            initial={{ width: "0%" }}
                            animate={{ width: "100%" }}
                            transition={{ duration: 6, ease: "linear" }}
                            className="absolute inset-y-0 left-0 bg-[#E2FF3B] shadow-[0_0_10px_#E2FF3B]"
                        />
                    </div>
                </div>

                {/* Arrows */}
                <div className="flex items-center gap-4 ml-auto">
                    <button
                        onClick={handlePrev}
                        className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black hover:border-white text-white transition-all rounded-full backdrop-blur-sm group"
                    >
                        <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center border border-white/10 hover:bg-white hover:text-black hover:border-white text-white transition-all rounded-full backdrop-blur-sm group"
                    >
                        <ArrowRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Decorative Corners */}
            <div className="absolute top-8 left-8 w-4 h-4 border-t border-l border-white/30 pointer-events-none" />
            <div className="absolute top-8 right-8 w-4 h-4 border-t border-r border-white/30 pointer-events-none" />
            <div className="absolute bottom-8 left-8 w-4 h-4 border-b border-l border-white/30 pointer-events-none" />
            <div className="absolute bottom-8 right-8 w-4 h-4 border-b border-r border-white/30 pointer-events-none" />

        </div>
    );
};
