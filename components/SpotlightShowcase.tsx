import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import { ShoppingCart, ArrowRight, Star } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    category: string;
    price: string;
    image: string;
    className?: string; // For grid span
}

const SPOTLIGHT_PRODUCTS: Product[] = [
    {
        id: '1',
        name: 'SHOEI X-SPR PRO',
        category: 'KASK',
        price: '₺28.500',
        image: 'https://images.unsplash.com/photo-1622185135505-2d795043997a?q=80&w=800&auto=format&fit=crop',
        className: 'md:col-span-2 md:row-span-2'
    },
    {
        id: '2',
        name: 'ALPINESTARS GP',
        category: 'ELDİVEN',
        price: '₺4.200',
        image: 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?q=80&w=600&auto=format&fit=crop',
        className: 'md:col-span-1 md:row-span-1'
    },
    {
        id: '3',
        name: 'DAINESE LAGUNA',
        category: 'TULUM',
        price: '₺42.000',
        image: 'https://images.unsplash.com/photo-1596706173770-3d7793b8e894?q=80&w=800&auto=format&fit=crop',
        className: 'md:col-span-1 md:row-span-2'
    },
    {
        id: '4',
        name: 'REVIT AIRWAVE',
        category: 'MONT',
        price: '₺12.350',
        image: 'https://images.unsplash.com/photo-1625043484555-47841a723e74?q=80&w=600&auto=format&fit=crop',
        className: 'md:col-span-1 md:row-span-1'
    },
    {
        id: '5',
        name: 'AGV PISTA GP',
        category: 'KASK',
        price: '₺55.000',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop',
        className: 'md:col-span-2 md:row-span-1'
    }
];

const SpotlightShowcase: React.FC = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top } = e.currentTarget.getBoundingClientRect();
        mouseX.set(e.clientX - left);
        mouseY.set(e.clientY - top);
    };

    // The mask image moves with the mouse
    const maskImage = useMotionTemplate`radial-gradient(400px circle at ${mouseX}px ${mouseY}px, black, transparent)`;

    return (
        <section
            className="relative bg-[#050505] py-24 overflow-hidden min-h-screen flex items-center justify-center cursor-default"
            onMouseMove={handleMouseMove}
        >
            <div className="container mx-auto px-4 md:px-8 relative">

                {/* Header Text (Also masked eventually? No, let's keep header visible for context) */}
                <div className="mb-12 relative z-10 pointer-events-none">
                    <h2 className="text-4xl md:text-6xl font-black text-white/20 uppercase tracking-tighter">
                        Darkroom <span className="text-white/10">Garage</span>
                    </h2>
                    <p className="text-white/30 mt-2 text-sm tracking-widest uppercase font-bold">
                        Mouse ile Keşfet • Işığı Takip Et
                    </p>
                </div>

                {/* THE GRID STACK */}
                <div className="relative">

                    {/* LAYER 1: The 'Shadow' Layer (Grayscale, Dimmed) */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pointer-events-none">
                        {SPOTLIGHT_PRODUCTS.map(product => (
                            <ProductCard key={product.id} product={product} isRevealed={false} />
                        ))}
                    </div>

                    {/* LAYER 2: The 'Revealed' Layer (Color, Bright) */}
                    {/* This layer sits exactly on top but is masked */}
                    <motion.div
                        className="absolute inset-0 grid grid-cols-1 md:grid-cols-4 gap-4 pointer-events-none"
                        style={{ maskImage, WebkitMaskImage: maskImage }}
                    >
                        {SPOTLIGHT_PRODUCTS.map(product => (
                            <ProductCard key={product.id} product={product} isRevealed={true} />
                        ))}
                    </motion.div>

                    {/* INTERACTION LAYER: Invisible buttons for clicks */}
                    {/* We need this because pointer-events-none on top layers blocks interaction */}
                    <div className="absolute inset-0 grid grid-cols-1 md:grid-cols-4 gap-4 z-20">
                        {SPOTLIGHT_PRODUCTS.map(product => (
                            <InteractionCard key={product.id} product={product} />
                        ))}
                    </div>

                </div>
            </div>
        </section>
    );
};

// --- Sub Components ---

const ProductCard: React.FC<{ product: Product, isRevealed: boolean }> = ({ product, isRevealed }) => {
    return (
        <div className={`relative overflow-hidden rounded-3xl bg-[#111] ${product.className || ''} h-[300px] md:h-auto`}>
            {/* Image Background */}
            <div className="absolute inset-0">
                <img
                    src={product.image}
                    alt={product.name}
                    className={`
                        w-full h-full object-cover transition-transform duration-700
                        ${isRevealed ? 'scale-105 saturate-100 brightness-110' : 'scale-100 grayscale brightness-[0.25]'}
                    `}
                />
            </div>

            {/* Overlay Gradient (Only for Shadow Layer) */}
            {!isRevealed && (
                <div className="absolute inset-0 bg-black/60" />
            )}

            {/* Content (Visible only when revealed ideally, or dimmed) */}
            <div className={`absolute inset-0 p-8 flex flex-col justify-end transition-opacity duration-300 ${isRevealed ? 'opacity-100' : 'opacity-0'}`}>
                <div className="translate-y-4 group-hover:translate-y-0 transition-transform">
                    <span className="text-orange-500 text-xs font-bold tracking-widest uppercase mb-2 block border-l-2 border-orange-500 pl-3">
                        {product.category}
                    </span>
                    <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase mb-1">
                        {product.name}
                    </h3>
                    <p className="text-xl font-bold text-gray-300">
                        {product.price}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Separate Interaction Component to handle hover states and clicks without being masked
const InteractionCard: React.FC<{ product: Product }> = ({ product }) => {
    return (
        <div className={`group relative cursor-pointer ${product.className || ''} h-[300px] md:h-auto`}>
            {/* Center Floating Action Button (Only visible on hover) */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                <button className="bg-orange-600 text-white px-6 py-3 rounded-full font-bold uppercase tracking-wider text-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all shadow-[0_0_30px_rgba(234,88,12,0.5)] border border-orange-400">
                    <ShoppingCart size={16} />
                    Hızlı Ekle
                </button>
            </div>
            {/* Top Right Icon */}
            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">
                <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                    <ArrowRight size={18} className="-rotate-45" />
                </div>
            </div>
        </div>
    );
};

export default SpotlightShowcase;
