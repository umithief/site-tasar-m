import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import { ShoppingBag, ChevronRight, Zap } from 'lucide-react';
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
        x.set(clientX - centerX);
        y.set(clientY - centerY);
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
            className={`relative rounded-full px-8 py-4 font-bold text-white bg-moto-accent overflow-hidden shadow-[0_0_20px_rgba(var(--moto-accent-rgb),0.4)] ${className}`}
            whileHover={{ scale: 1.1 }}
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
    const [videoLoaded, setVideoLoaded] = useState(false);

    return (
        <motion.div
            layout
            onMouseEnter={onHover}
            onMouseLeave={onLeave}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className={`relative h-[600px] cursor-pointer overflow-hidden rounded-[2.5rem] border border-white/10 group
        ${isActive ? 'flex-[3]' : 'flex-1'}
      `}
        >
            {/* Background Image / Placeholder */}
            <motion.div
                layout="position"
                className="absolute inset-0 z-0"
            >
                <motion.img
                    src={product.image}
                    alt={product.name}
                    className={`h-full w-full object-cover transition-all duration-700
            ${isActive ? 'scale-110 blur-sm brightness-50' : 'scale-100 grayscale-[0.3] brightness-90 group-hover:grayscale-0'}
          `}
                />
            </motion.div>

            {/* Background Video (If available) */}
            <AnimatePresence>
                {isActive && product.model3d && ( // Reusing model3d as a video url for this concept if exists, or assume images[0] is high-res
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-1"
                    >
                        {/* Mocking video fade-in with a secondary image if real video isn't provided */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="absolute inset-0 z-10 flex flex-col justify-between p-8">
                {/* Top Section */}
                <div className="flex justify-between items-start">
                    <motion.span
                        layout="position"
                        className="px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] font-bold text-white uppercase tracking-[0.2em]"
                    >
                        {product.category}
                    </motion.span>

                    <AnimatePresence>
                        {isActive && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex flex-col items-end gap-1"
                            >
                                <span className="text-white/60 text-xs font-mono">MODEL 2024</span>
                                <span className="text-moto-accent text-2xl font-black font-mono">#{product._id.slice(-4).toUpperCase()}</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Content Section */}
                <div className="relative flex items-end justify-between">
                    <div className="flex flex-col gap-4 max-w-[60%]">
                        <motion.h3
                            layout="position"
                            className={`font-black text-white leading-none transition-all duration-500
                ${isActive ? 'text-6xl md:text-7xl' : 'text-xl rotate-0 origin-left'}
              `}
                        >
                            {product.name}
                        </motion.h3>

                        <AnimatePresence>
                            {isActive && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{ delay: 0.2 }}
                                    className="space-y-4"
                                >
                                    <p className="text-white/70 text-lg line-clamp-2">
                                        {product.description}
                                    </p>

                                    <div className="flex items-center gap-6">
                                        <div className="flex flex-col">
                                            <span className="text-white/40 text-[10px] font-bold uppercase tracking-widest">Price</span>
                                            <span className="text-white text-3xl font-mono font-bold">₺{product.price.toLocaleString('tr-TR')}</span>
                                        </div>
                                        <MagneticButton onClick={() => onAddToCart(product)}>
                                            <ShoppingBag size={20} />
                                            BUY NOW
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
                                initial={{ opacity: 0, scale: 0.8, x: 50 }}
                                animate={{ opacity: 1, scale: 1, x: 0 }}
                                exit={{ opacity: 0, scale: 0.8, x: 50 }}
                                transition={{ delay: 0.3 }}
                                className="hidden md:flex flex-col gap-6 p-6 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10"
                            >
                                <div className="flex items-center gap-2 text-moto-accent">
                                    <Zap size={16} />
                                    <span className="text-xs font-bold uppercase tracking-widest">Tech Specs</span>
                                </div>

                                <div className="space-y-4">
                                    {product.features.slice(0, 4).map((feat, idx) => (
                                        <div key={idx} className="flex flex-col">
                                            <span className="text-white/40 text-[9px] font-bold uppercase">Feature 0{idx + 1}</span>
                                            <span className="text-white text-sm font-medium">{feat}</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Idle Glass Label (Visible only when not active) */}
            {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
            )}
        </motion.div>
    );
};
