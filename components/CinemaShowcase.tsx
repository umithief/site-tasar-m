import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CinemaCard } from './CinemaCard';
import { Product, ProductCategory } from '../types';

// Mock products for demonstration
const MOCK_PRODUCTS: Product[] = [
    {
        _id: 'p1',
        name: 'CARBON X-1',
        description: 'Aerodynamic excellence meets pure carbon fiber construction. Designed for the track, refined for the street.',
        price: 12500,
        category: ProductCategory.HELMET,
        image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800',
        images: [],
        rating: 5,
        features: ['Ultra-Light Carbon Shell', 'Emergency Release System', 'MaxVision Pinlock', 'Wind Tunnel Tested'],
        stock: 3
    },
    {
        _id: 'p2',
        name: 'VENOM 400',
        description: 'Unmatched protection with a tactical edge. The Venom 100 jacket brings military-grade materials to your daily ride.',
        price: 8900,
        category: ProductCategory.JACKET,
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
        images: [],
        rating: 4.8,
        features: ['Cordura® Construction', 'CE Level 2 Armor', 'Waterproof Membrane', 'Hydration Pack Ready'],
        stock: 12
    },
    {
        _id: 'p3',
        name: 'TITAN BOOTS',
        description: 'Stability that feels like gravity. Titan boots provide the ultimate grip and ankle support for extreme conditions.',
        price: 6750,
        category: ProductCategory.BOOTS,
        image: 'https://images.unsplash.com/photo-1609630875171-b132137746be?auto=format&fit=crop&q=80&w=800',
        images: [],
        rating: 4.9,
        features: ['Gore-Tex Extreme', 'Vibram Outsole', 'Composite Toe Box', 'Adjustable Buckle System'],
        stock: 8
    }
];

export const CinemaShowcase: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(1); // Default to middle one for best look

    const handleAddToCart = (product: Product) => {
        console.log('Added to cart:', product.name);
    };

    return (
        <section className="relative py-32 bg-[#050505] overflow-hidden">
            {/* Cinematic Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(var(--moto-accent-rgb),0.05)_0%,transparent_70%)]" />
                <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay" />

                {/* Animated Particles (Simplified) */}
                {[...Array(6)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-px h-32 bg-gradient-to-b from-transparent via-moto-accent/20 to-transparent"
                        initial={{ top: "-20%", left: `${20 * i}%`, opacity: 0 }}
                        animate={{
                            top: ["-20%", "120%"],
                            opacity: [0, 1, 0]
                        }}
                        transition={{
                            duration: 5 + i,
                            repeat: Infinity,
                            ease: "linear",
                            delay: i * 2
                        }}
                    />
                ))}
            </div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-10">
                <div className="flex flex-col mb-20">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-4 mb-6"
                    >
                        <div className="w-12 h-[1px] bg-moto-accent" />
                        <span className="text-moto-accent font-black tracking-[0.5em] text-[10px] uppercase">
                            The Winter '24 Selection
                        </span>
                    </motion.div>

                    <motion.h2
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-6xl md:text-8xl font-black text-white tracking-tighter"
                    >
                        FOCUS & <span className="text-white/10 italic">EXPANSION</span>
                    </motion.h2>
                </div>

                <div className="flex gap-6 min-h-[650px] items-stretch perspective-2000">
                    {MOCK_PRODUCTS.map((product, index) => (
                        <CinemaCard
                            key={product._id}
                            product={product}
                            isActive={activeIndex === index}
                            onHover={() => setActiveIndex(index)}
                            onLeave={() => { }}
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-20 flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/5 pt-12"
                >
                    <div className="flex flex-col gap-1">
                        <span className="text-white/20 text-[10px] font-black uppercase tracking-widest leading-none">Curation Metadata</span>
                        <span className="text-white/40 text-xs font-bold uppercase tracking-widest">(3) Masterpieces Loaded</span>
                    </div>

                    <div className="flex gap-4">
                        {MOCK_PRODUCTS.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setActiveIndex(i)}
                                className="group flex flex-col gap-3 py-2"
                            >
                                <div className={`w-20 h-1 transition-all duration-700 rounded-full ${activeIndex === i ? 'bg-moto-accent shadow-[0_0_15px_rgba(var(--moto-accent-rgb),0.8)]' : 'bg-white/10 group-hover:bg-white/20'}`} />
                                <span className={`text-[9px] font-black transition-all duration-500 uppercase tracking-widest ${activeIndex === i ? 'text-white opacity-100' : 'text-white/20 opacity-0 group-hover:opacity-100'}`}>0{i + 1}</span>
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4 text-white/20 text-[10px] font-black uppercase tracking-widest">
                        <span>Scroll</span>
                        <div className="w-8 h-[1px] bg-white/10" />
                        <span>Discover</span>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
