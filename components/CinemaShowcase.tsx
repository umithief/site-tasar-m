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
        description: 'Unmatched protection with a tactical edge. The Venom 400 jacket brings military-grade materials to your daily ride.',
        price: 8900,
        category: ProductCategory.JACKET,
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
        images: [],
        rating: 4.8,
        features: ['Cordura® Construction', 'CE Level 2 Armor', 'Waterproof Membrane', 'Hydration Pack Ready'],
        stock: 12,
        model3d: 'has-video-mock'
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
        <section className="py-24 bg-black overflow-hidden">
            <div className="max-w-[1400px] mx-auto px-6">
                <div className="flex flex-col mb-16">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="text-moto-accent font-black tracking-[0.3em] text-xs uppercase mb-4"
                    >
                        Premium Collection
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-5xl md:text-7xl font-black text-white"
                    >
                        FOCUS & <span className="text-white/20">EXPANSION</span>
                    </motion.h2>
                </div>

                <div className="flex gap-4 min-h-[600px] items-stretch">
                    {MOCK_PRODUCTS.map((product, index) => (
                        <CinemaCard
                            key={product._id}
                            product={product}
                            isActive={activeIndex === index}
                            onHover={() => setActiveIndex(index)}
                            onLeave={() => { }} // Keep active or clear? Setting index keeps focus.
                            onAddToCart={handleAddToCart}
                        />
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 flex justify-between items-center text-white/30 text-xs font-bold uppercase tracking-widest border-t border-white/10 pt-8"
                >
                    <span>Scroll to explore more</span>
                    <span>(3) Premium items curated</span>
                    <div className="flex gap-2">
                        {[0, 1, 2].map((i) => (
                            <div
                                key={i}
                                className={`w-12 h-1 ${activeIndex === i ? 'bg-moto-accent' : 'bg-white/10'} transition-all duration-500`}
                            />
                        ))}
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
