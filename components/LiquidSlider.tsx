import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

import { sliderService } from '../services/sliderService';

// --- FALLBACK DATA ---
const FALLBACK_SLIDES = [
    {
        id: 1,
        title: "NITRO ASPHALT",
        subtitle: "The heat is rising.",
        image: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1920&auto=format&fit=crop"
    }
];

export default function LiquidSlider() {
    const [index, setIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const [slides, setSlides] = useState<any[]>(FALLBACK_SLIDES);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadSlides = async () => {
            try {
                const data = await sliderService.getSlides();
                if (data && data.length > 0) {
                    setSlides(data);
                }
            } catch (error) {
                console.error("Slider fetch error:", error);
            } finally {
                setIsLoaded(true);
            }
        };
        loadSlides();
    }, []);

    const activeSlide = slides[index] || slides[0];

    // Motion Values for the Filter
    const distortion = useMotionValue(0);

    // Map distortion (0 to 1) to SVG attributes
    // baseFrequency: turbulence noise roughness. 
    // We go from 0 (calm) to 0.05 (rippled) and back.
    const bf = useTransform(distortion, [0, 1], ["0.01 0.01", "0.04 0.09"]);

    // scale: displacement intensity. 
    // We go from 0 (no displacement) to 300 (heavy melt).
    const scale = useTransform(distortion, [0, 1], [0, 300]);

    // Opacity handling for smooth crossfade text
    const textOpacity = useTransform(distortion, [0, 0.5, 1], [1, 0, 0]);
    const textScale = useTransform(distortion, [0, 1], [1, 1.2]);

    const handleNext = async () => {
        if (isAnimating) return;
        setIsAnimating(true);

        // 1. MELT (Animate distortion up)
        await animate(distortion, 1, { duration: 0.6, ease: "easeInOut" }).finished;

        if (slides.length > 0) {
            setIndex((prev) => (prev + 1) % slides.length);
        }

        // 3. SOLIDIFY (Animate distortion down)
        // Ensure the image loads/swaps before solidifying? 
        // With simple generic URLs it should be fast, but ideally we'd wait for load.
        await animate(distortion, 0, { duration: 0.8, ease: "circOut" }).finished;

        setIsAnimating(false);
    };

    // Auto-Play Logic
    useEffect(() => {
        if (slides.length <= 1) return; // Don't auto-play if single slide

        const timer = setInterval(() => {
            if (!isAnimating) {
                handleNext();
            }
        }, 5000);

        return () => clearInterval(timer);
    }, [index, isAnimating, slides.length]);

    if (!isLoaded && slides.length === 0) return null; // Or loader

    return (
        <div className="relative w-full h-[80vh] min-h-[600px] overflow-hidden bg-black font-sans selection:bg-[#F2A619] selection:text-black">

            {/* --- SVG FILTER DEFINITION (HIDDEN) --- */}
            {/* The magic engine that powers the fake WebGL effect */}
            <svg className="absolute w-0 h-0 pointer-events-none">
                <defs>
                    <filter id="liquid-distortion" colorInterpolationFilters="sRGB">
                        {/* Generate Noise */}
                        <motion.feTurbulence
                            type="fractalNoise"
                            baseFrequency={bf}
                            numOctaves="2"
                            result="noise"
                        />
                        {/* Displace Image with Noise */}
                        <motion.feDisplacementMap
                            in="SourceGraphic"
                            in2="noise"
                            scale={scale}
                            xChannelSelector="R"
                            yChannelSelector="G"
                        />
                    </filter>
                </defs>
            </svg>

            {/* --- ACTIVE SLIDE with FILTER --- */}
            <motion.div
                className="absolute inset-0 w-full h-full bg-cover bg-center"
                style={{
                    backgroundImage: `url(${activeSlide.image})`,
                    // We apply the filter here. 
                    // Important: Tailwind backdrop-filter utils won't work for SVG filters easily.
                    // We use inline style.
                    filter: "url(#liquid-distortion)",
                    willChange: "filter"
                }}
                // "Drag to Explore" Logic
                onPanEnd={(e, info) => {
                    if (info.offset.x < -50) handleNext();
                    // Optional: prev slide logic if x > 50
                }}
            />

            {/* --- DARK OVERLAY --- */}
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />

            {/* --- CONTENT LAYER --- */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10 px-4">

                {/* GHOST TITLE */}
                <div className="relative overflow-hidden mix-blend-overlay">
                    <motion.h1
                        className="text-[12vw] leading-none font-black text-white uppercase tracking-tighter text-center"
                        style={{
                            opacity: textOpacity,
                            scale: textScale,
                            filter: "blur(0px)"
                        }}
                    >
                        {activeSlide.title}
                    </motion.h1>
                </div>

                {/* ANIMATED SUBTITLE */}
                <motion.p
                    className="mt-4 text-white/80 text-lg md:text-xl font-light tracking-[0.5em] uppercase mix-blend-difference"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={activeSlide.id || activeSlide._id || index} // Retrigger animation
                    transition={{ delay: 0.5, duration: 1 }}
                >
                    {activeSlide.subtitle}
                </motion.p>
            </div>

            {/* --- PROGRESS BAR NAVIGATION --- */}
            <div className="absolute bottom-12 left-0 w-full flex justify-center items-end px-12 z-20">
                <div className="w-full max-w-md h-0.5 bg-white/20 relative overflow-hidden rounded-full">
                    {/* Animated Progress Fill */}
                    <motion.div
                        className="absolute top-0 left-0 h-full bg-[#F2A619] shadow-[0_0_10px_#F2A619]"
                        initial={{ width: "0%" }}
                        animate={{ width: `${((index + 1) / slides.length) * 100}%` }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                    />
                </div>

                {/* INTERACTIVE AREA FOR CLICKING */}
                <div
                    onClick={handleNext}
                    className="absolute inset-0 cursor-none hover:cursor-e-resize z-50"
                    title="Click or Drag to Next"
                />
            </div>

            {/* --- DRAG CURSOR HINT --- */}
            <div className="absolute bottom-6 w-full text-center text-[10px] text-white/40 uppercase tracking-widest pointer-events-none">
                Drag or Click to Explore
            </div>

        </div>
    );
}

// Add strict types if referencing motion components directly inside SVG fails in some TS configs,
// but usually it works fine with latest framer-motion types.
