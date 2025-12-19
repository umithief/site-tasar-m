import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { ShoppingBag, ChevronRight, Zap, Info } from 'lucide-react';
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

    const springX = useSpring(mouseX, { damping: 30, stiffness: 200 });
    const springY = useSpring(mouseY, { damping: 30, stiffness: 200 });

    // Magnetic Title values
    const titleX = useTransform(springX, (val) => val * 0.05);
    const titleY = useTransform(springY, (val) => val * 0.05);

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!cardRef.current) return;
        const { left, top, width, height } = cardRef.current.getBoundingClientRect();
        mouseX.set(e.clientX - (left + width / 2));
        mouseY.set(e.clientY - (top + height / 2));
    };

    const handleMouseLeave = () => {
        mouseX.set(0);
        mouseY.set(0);
        onLeave();
    };

    const backgroundGradient = useTransform(
        [springX, springY],
        ([x, y]) => `radial-gradient(circle at calc(50% + ${x}px) calc(50% + ${y}px), rgba(255,255,255,0.08) 0%, transparent 60%)`
    );

    return (
        <motion.div
            ref={cardRef}
            layout
            onMouseEnter={onHover}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className={`relative h-[650px] cursor-pointer overflow-hidden rounded-[3rem] border border-white/10 group
        ${isActive ? 'flex-[3]' : 'flex-1'}
      `}
        >
            {/* Dynamic Background Spotlight */}
            <motion.div
                className="absolute inset-0 z-[1] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: backgroundGradient }}
            />

            {/* Background Image / Placeholder */}
            <motion.div
                layout="position"
                className="absolute inset-0 z-0"
            >
                <motion.img
                    src={product.image}
                    alt={product.name}
                    className={`h-full w-full object-cover transition-all duration-1000 ease-out
            ${isActive ? 'scale-110 blur-[2px] brightness-[0.4]' : 'scale-100 grayscale-[0.5] brightness-[0.7] group-hover:grayscale-0 group-hover:brightness-90 group-hover:scale-105'}
          `}
                />
                {/* Grain Overlay */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />
            </motion.div>

            <div className="absolute inset-0 z-10 flex flex-col justify-between p-10">
                {/* Top Section */}
                <div className="flex justify-between items-start">
                    <motion.div
                        layout="position"
                        className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl"
                    >
                        <div className="w-1.5 h-1.5 rounded-full bg-moto-accent animate-pulse" />
                        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
                            {product.category}
                        </span>
                    </motion.div>

                    <AnimatePresence>
                        {isActive && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                                className="flex flex-col items-end"
                            >
                                <span className="text-white/40 text-[10px] font-black tracking-widest uppercase mb-1">Authentic Gear</span>
                                <div className="h-[1px] w-12 bg-moto-accent/50 mb-2" />
                                <span className="text-moto-accent text-3xl font-black font-mono tracking-tighter italic">#{product._id.slice(-4).toUpperCase()}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content Section */}
                <div className="relative flex items-end justify-between gap-8">
                    <div className="flex flex-col gap-6 max-w-[65%]">
                        <motion.h3
                            layout="position"
                            style={{ x: titleX, y: titleY }}
                            className={`font-black text-white leading-[0.85] transition-all duration-700 tracking-tighter
                ${isActive ? 'text-7xl md:text-8xl drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]' : 'text-xl'}
              `}
                        >
                            {product.name}
                        </motion.h3>

                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                    exit={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
                                    transition={{ delay: 0.1, duration: 0.5 }}
                                    className="space-y-8"
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
                                initial={{ opacity: 0, scale: 0.9, x: 40, rotateY: 20 }}
                                animate={{ opacity: 1, scale: 1, x: 0, rotateY: 0 }}
                                exit={{ opacity: 0, scale: 0.9, x: 40, rotateY: 20 }}
                                transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
                                className="hidden lg:flex flex-col gap-8 p-8 rounded-[2.5rem] bg-black/40 backdrop-blur-3xl border border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.5)] perspective-1000"
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
                                            <span className="text-moto-accent text-[9px] font-black uppercase tracking-tighter">SPEC_0{idx + 1}</span>
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

            {/* Card Border Highlight (Spotlight following) */}
            {isActive && (
                <motion.div
                    className="absolute inset-0 z-[15] pointer-events-none rounded-[3rem] border border-moto-accent/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                />
            )}
        </motion.div>
    );
};
