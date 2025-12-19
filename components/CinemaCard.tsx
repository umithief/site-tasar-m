import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { ShoppingBag, Zap, Info } from 'lucide-react';
import { Product } from '../types';

interface CinemaCardProps {
    product: Product;
    isActive: boolean;
    onHover: () => void;
    onLeave: () => void;
    onAddToCart: (product: Product) => void;
}

const MagneticButton: React.FC<{ children: React.ReactNode; onClick: () => void; className?: string }> = ({
    children,
    onClick,
    className = ""
}) => {
    const ref = useRef<HTMLButtonElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const springConfig = { damping: 20, stiffness: 200 };
    const springX = useSpring(x, springConfig);
    const springY = useSpring(y, springConfig);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { left, top, width, height } = ref.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        x.set((clientX - centerX) * 0.4);
        y.set((clientY - centerY) * 0.4);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    return (
        <motion.button
            ref={ref}
            style={{ x: springX, y: springY }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => {
                e.stopPropagation();
                onClick();
            }}
            className={`relative rounded-full px-8 py-4 font-bold text-white bg-moto-accent overflow-hidden shadow-[0_0_30px_rgba(var(--moto-accent-rgb),0.5)] ${className}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
        >
            <span className="relative z-10 flex items-center gap-2">
                {children}
            </span>
            <motion.div
                className="absolute inset-0 bg-white/20"
                initial={{ x: "-100%" }}
                whileHover={{ x: "100%" }}
                transition={{ duration: 0.5 }}
            />
        </motion.button>
    );
};

const DecodingText: React.FC<{ text: string; delay?: number }> = ({ text, delay = 0 }) => {
    const [display, setDisplay] = useState("");
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&";

    useEffect(() => {
        let interval: NodeJS.Timeout;
        let iteration = 0;

        const startDecryption = () => {
            interval = setInterval(() => {
                setDisplay(text.split("").map((char, index) => {
                    if (index < iteration) return char;
                    return chars[Math.floor(Math.random() * chars.length)];
                }).join(""));

                if (iteration >= text.length) clearInterval(interval);
                iteration += 1 / 3;
            }, 30);
        };

        const timeout = setTimeout(startDecryption, delay * 1000);

        return () => {
            if (interval) clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [text, delay]);

    return <span className="font-mono">{display || (delay > 0 ? "" : text)}</span>;
};

export const CinemaCard: React.FC<CinemaCardProps> = ({
    product,
    isActive,
    onHover,
    onLeave,
    onAddToCart
}) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const springConfig = { damping: 25, stiffness: 150 };
    const springX = useSpring(mouseX, springConfig);
    const springY = useSpring(mouseY, springConfig);

    // 3D Tilt Values
    const rotateX = useTransform(springY, [-300, 300], [10, -10]);
    const rotateY = useTransform(springX, [-300, 300], [-10, 10]);

    // Parallax Values
    const titleX = useTransform(springX, (val) => val * 0.08);
    const titleY = useTransform(springY, (val) => val * 0.08);
    const sheenX = useTransform(springX, (val) => val * 0.2);
    const sheenY = useTransform(springY, (val) => val * 0.2);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        const centerX = left + width / 2;
        const centerY = top + height / 2;
        mouseX.set(e.clientX - centerX);
        mouseY.set(e.clientY - centerY);
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        onLeave();
    };

    const backgroundGradient = useTransform(
        [springX, springY],
        ([x, y]) => `radial-gradient(circle at calc(50% + ${x}px) calc(50% + ${y}px), rgba(255,255,255,0.1) 0%, transparent 50%)`
    );

    return (
        <motion.div
            ref={cardRef}
            // layout prop removed to prevent potential calculation crashes
            onMouseEnter={onHover}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
                rotateX: 0, // Temporarily disabled for stability check
                rotateY: 0,
                transformStyle: "preserve-3d",
                perspective: 1000
            }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className={`relative h-[650px] cursor-pointer rounded-[3rem] border border-white/10 group
        ${isActive ? 'flex-[3] z-20 shadow-2xl' : 'flex-1 z-0'}
      `}
        >
            {/* Container for content that needs internal clipping/rounding */}
            <div className="absolute inset-0 rounded-[3rem] overflow-hidden bg-black" style={{ transformStyle: "preserve-3d" }}>

                {/* Holographic Sheen Overlay */}
                <motion.div
                    className="absolute inset-[-50%] z-[2] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(255,255,255,0.1)_180deg,transparent_360deg)] mix-blend-color-dodge"
                    style={{
                        rotate: useTransform(springX, [-300, 300], [-45, 45]),
                        x: sheenX,
                        y: sheenY
                    }}
                />

                {/* Dynamic Background Spotlight */}
                <motion.div
                    className="absolute inset-0 z-[1] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: backgroundGradient }}
                />

                {/* Background Image / Placeholder */}
                <motion.div
                    className="absolute inset-0 z-0 scale-105"
                    style={{ transform: "translateZ(0px)" }}
                >
                    <motion.img
                        src={product.image}
                        alt={product.name}
                        className={`h-full w-full object-cover transition-all duration-1000 ease-out
              ${isActive ? 'scale-110 blur-[2px] brightness-[0.4]' : 'scale-100 grayscale-[0.5] brightness-[0.7] group-hover:grayscale-0 group-hover:brightness-90 group-hover:scale-105'}
            `}
                    />
                    <div className="absolute inset-0 opacity-[0.04] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
                </motion.div>

                {/* Ambient Smoke/Fog Effect (Added here for proper z-index layering) */}
                {isActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-x-0 bottom-0 h-1/2 pointer-events-none z-[1]"
                    >
                        <div className="w-full h-full bg-gradient-to-t from-moto-accent/10 to-transparent blur-3xl animate-pulse" />
                    </motion.div>
                )}

                <div className="absolute inset-0 z-10 flex flex-col justify-between p-10" style={{ transformStyle: "preserve-3d", transform: "translateZ(20px)" }}>
                    {/* Top Section */}
                    <div className="flex justify-between items-start">
                        <motion.div
                            className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
                            style={{ transform: "translateZ(30px)" }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-moto-accent animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                                {product.category}
                            </span>
                        </motion.div>

                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    key="auth-gear"
                                    initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                                    className="flex flex-col items-end"
                                    style={{ transform: "translateZ(30px)" }}
                                >
                                    <span className="text-white/40 text-[10px] font-black tracking-widest uppercase mb-1">Authentic Gear</span>
                                    <div className="h-[1px] w-12 bg-moto-accent/50 mb-2" />
                                    <span className="text-moto-accent text-3xl font-black font-mono tracking-tighter italic">#{product._id.slice(-4).toUpperCase()}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Content Section */}
                    <div className="relative flex items-end justify-between gap-8 h-fit" style={{ transformStyle: "preserve-3d" }}>
                        <div className="flex flex-col gap-6 max-w-[65%]" style={{ transformStyle: "preserve-3d" }}>

                            {/* Staggered Title Animation */}
                            <div
                                className="relative z-50 mix-blend-overlay"
                                aria-label={product.name}
                            >
                                <motion.h3
                                    style={{ x: titleX, y: titleY, transform: "translateZ(60px)" }}
                                    className={`flex flex-wrap font-black text-white leading-[0.85] transition-all duration-700 tracking-tighter
                      ${isActive ? 'text-7xl md:text-8xl' : 'text-xl'}
                    `}
                                >
                                    {isActive ? (
                                        product.name.split("").map((char, i) => (
                                            <motion.span
                                                key={i}
                                                initial={{ opacity: 0, y: 20, rotateX: 90 }}
                                                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                                                transition={{ delay: 0.1 + i * 0.05, type: "spring", damping: 12, stiffness: 200 }}
                                                className="inline-block"
                                            >
                                                {char === " " ? "\u00A0" : char}
                                            </motion.span>
                                        ))
                                    ) : (
                                        product.name
                                    )}
                                </motion.h3>
                            </div>

                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        key="content-desc"
                                        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                        exit={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                        transition={{ delay: 0.1, duration: 0.5 }}
                                        className="space-y-8"
                                        style={{ transform: "translateZ(40px)" }}
                                    >
                                        <p className="text-white/60 text-xl font-medium leading-relaxed max-w-lg border-l-2 border-moto-accent/30 pl-6">
                                            {product.description}
                                        </p>

                                        <div className="flex items-center gap-10">
                                            <div className="flex flex-col">
                                                <span className="text-white/30 text-[11px] font-black uppercase tracking-[0.2em] mb-1">Standard Price</span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-white text-4xl font-black font-mono">₺{product.price.toLocaleString('tr-TR')}</span>
                                                    <span className="text-moto-accent text-sm font-bold">*</span>
                                                </div>
                                            </div>
                                            <MagneticButton onClick={() => onAddToCart(product)}>
                                                <ShoppingBag size={22} strokeWidth={2.5} />
                                                <span className="tracking-widest uppercase text-sm">Pre-Order Now</span>
                                            </MagneticButton>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Tech Specs Revealed on Right */}
                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    key="tech-specs-box"
                                    initial={{ opacity: 0, scale: 0.9, x: 40, rotateY: 20 }}
                                    animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, x: 40, rotateY: 20 }}
                                    transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                                    style={{ transform: "translateZ(40px)" }}
                                    className="hidden lg:flex flex-col gap-8 p-8 rounded-[2.5rem] bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)]"
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-moto-accent/20 flex items-center justify-center text-moto-accent">
                                                <Zap size={16} fill="currentColor" />
                                            </div>
                                            <span className="text-xs font-black text-white uppercase tracking-[0.3em]">Performance</span>
                                        </div>
                                        <Info size={14} className="text-white/20" />
                                    </div>

                                    <div className="grid grid-cols-1 gap-6">
                                        {product.features.slice(0, 4).map((feat, idx) => (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 + (idx * 0.1) }}
                                                className="flex flex-col gap-1 border-b border-white/5 pb-4 last:border-0 last:pb-0"
                                            >
                                                <span className="text-moto-accent text-[9px] font-black uppercase tracking-tighter">
                                                    {/* Temporarily removed DecodingText to debug crash */}
                                                    SPEC_0{idx + 1}
                                                    {/* <DecodingText text={`SPEC_0${idx + 1}`} delay={0.3 + (idx * 0.1)} /> */}
                                                </span>
                                                <span className="text-white/90 text-[13px] font-bold tracking-tight">{feat}</span>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Ambient Gradient Overlays */}
                <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black via-black/40 to-transparent z-[5] pointer-events-none opacity-90" />
                <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/60 to-transparent z-[5] pointer-events-none" />
            </div>

            {/* Removed Border Highlight to fix crash */}
        </motion.div>
    );
};
