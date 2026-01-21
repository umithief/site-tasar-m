import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Share2, Heart, Shield, CloudRain, Wind, Layers,
    Star, ChevronRight, ShoppingBag, Plus, Minus
} from 'lucide-react';
import { Product, ViewState } from '../../types';
import { useAuthStore } from '../../store/authStore';

interface MobileProductDetailProps {
    product: Product | null;
    onAddToCart: (product: Product) => void;
    onNavigate: (view: ViewState) => void;
    onOpenCart: () => void;
}

export const MobileProductDetail: React.FC<MobileProductDetailProps> = ({
    product,
    onAddToCart,
    onNavigate,
    onOpenCart
}) => {
    // Falls back to mock data if product is null, just for visualization of the new design
    const dummyProduct = {
        brand: 'DAINESE',
        name: product?.name || 'Avro 4 Deri Ceket',
        price: product?.price || 24500,
        rating: 4.8,
        reviews: 124,
        images: product?.images?.length ? product.images : [
            'https://images.unsplash.com/photo-1551028919-ac7675cf5c63?q=80&w=1887&auto=format&fit=crop', // Jacket placeholder
            'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=1587&auto=format&fit=crop',
            'https://images.unsplash.com/photo-1544652478-6653e09f1826?q=80&w=1887&auto=format&fit=crop'
        ],
        description: product?.description || "Dainese Avro 4 deri motosiklet ceketi, en üst düzey güvenlik ve konforu bir araya getiriyor. Tutu dana derisi yapısı, bi-elastik S1 kumaş ekleri ve Nanofeel astarı ile her sürüşte mükemmel performans sağlar. Zorlu hava koşullarına dayanıklıdır ve şehir içi kullanım için..."
    };

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState<'black' | 'red' | 'neon'>('neon');
    const [selectedSize, setSelectedSize] = useState('L');
    const [isFavorite, setIsFavorite] = useState(false);

    const sizes = ['S', 'M', 'L', 'XL'];
    const colors = [
        { id: 'black', hex: '#000000', name: 'Siyah' },
        { id: 'red', hex: '#EF4444', name: 'Kırmızı' },
        { id: 'neon', hex: '#E2FF3B', name: 'Neon' }
    ];

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % dummyProduct.images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + dummyProduct.images.length) % dummyProduct.images.length);
    };

    const handleAddToCart = () => {
        if (navigator.vibrate) navigator.vibrate(50);
        if (product) {
            onAddToCart(product);
        }
        onOpenCart();
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans relative overflow-x-hidden">

            {/* 1. NAVIGATION & HERO IMAGE */}
            <header className="absolute top-0 left-0 right-0 z-50 p-6 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
                <button
                    onClick={() => onNavigate('shop')}
                    className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex gap-4">
                    <button className="p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white hover:bg-white/20 transition-colors">
                        <Share2 className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className={`p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/10 transition-colors ${isFavorite ? 'text-red-500 bg-red-500/10' : 'text-white hover:bg-white/20'}`}
                    >
                        <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    </button>
                </div>
            </header>

            {/* Immersive Image Swiper */}
            <div className="relative w-full h-[55vh]">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImageIndex}
                        src={dummyProduct.images[currentImageIndex]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                    />
                </AnimatePresence>

                {/* Pagination Dots */}
                <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2 z-20">
                    {dummyProduct.images.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentImageIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${currentImageIndex === idx ? 'w-8 bg-[#E2FF3B]' : 'w-1.5 bg-white/50'}`}
                        />
                    ))}
                </div>

                {/* Overlay Gradient for smooth transition to info sheet */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
            </div>

            {/* 2. PRODUCT INFO SHEET */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="relative -mt-10 bg-[#050505] rounded-t-[40px] px-6 pt-10 pb-32 min-h-[50vh] border-t border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.8)]"
            >
                {/* Drag Indicator */}
                <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-8" />

                <div className="mb-8">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <span className="text-gray-400 text-sm font-bold tracking-widest uppercase mb-1 block">{dummyProduct.brand}</span>
                            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-2 tracking-tight">{dummyProduct.name}</h1>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-[#E2FF3B] text-3xl font-black tracking-tight">
                            ₺{dummyProduct.price.toLocaleString('tr-TR')}
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <span className="text-yellow-400 font-bold text-sm">{dummyProduct.rating}</span>
                            <span className="text-yellow-400/60 text-xs font-medium">({dummyProduct.reviews} Değerlendirme)</span>
                        </div>
                    </div>
                </div>

                {/* 3. SELECTORS */}
                <div className="space-y-8 mb-10">
                    {/* Color Selector */}
                    <div>
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Renk Seç</h3>
                        <div className="flex gap-4">
                            {colors.map((color) => (
                                <button
                                    key={color.id}
                                    onClick={() => setSelectedColor(color.id as any)}
                                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all relative ${selectedColor === color.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'hover:scale-105'}`}
                                    style={{ backgroundColor: color.hex }}
                                >
                                    {selectedColor === color.id && color.id === 'neon' && <Check className="w-6 h-6 text-black" />}
                                    {selectedColor === color.id && color.id !== 'neon' && <div className="w-12 h-12 rounded-full border-2 border-white/20" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Size Selector */}
                    <div>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Beden Seç</h3>
                            <button className="text-xs text-[#E2FF3B] font-bold hover:underline">Beden Tablosu</button>
                        </div>
                        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                            {sizes.map((size) => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`flex-1 min-w-[60px] h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all border ${selectedSize === size
                                            ? 'bg-[#E2FF3B] text-black border-[#E2FF3B] shadow-[0_0_20px_rgba(226,255,59,0.3)]'
                                            : 'bg-white/5 text-gray-400 border-white/5 hover:bg-white/10 hover:border-white/10'
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 4. TECH SPECS */}
                <div className="mb-10">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Teknik Özellikler</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                            <div className="p-2 bg-white/10 rounded-lg text-white">
                                <Shield className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500 font-bold uppercase mb-1">Koruma</span>
                                <span className="text-sm text-white font-bold">Seviye 2</span>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                            <div className="p-2 bg-white/10 rounded-lg text-white">
                                <CloudRain className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500 font-bold uppercase mb-1">Su Geçirmez</span>
                                <span className="text-sm text-white font-bold">100%</span>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                            <div className="p-2 bg-white/10 rounded-lg text-white">
                                <Wind className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500 font-bold uppercase mb-1">Direnç</span>
                                <span className="text-sm text-white font-bold">Rüzgar</span>
                            </div>
                        </div>
                        <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-start gap-4 hover:bg-white/10 transition-colors">
                            <div className="p-2 bg-white/10 rounded-lg text-white">
                                <Layers className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500 font-bold uppercase mb-1">Malzeme</span>
                                <span className="text-sm text-white font-bold">Dana Derisi</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. DESCRIPTION */}
                <div className="mb-8">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-3">Ürün Hakkında</h3>
                    <p className="text-gray-300 text-sm leading-relaxed opacity-80">
                        {dummyProduct.description}
                        <button className="text-[#E2FF3B] font-bold ml-1 hover:underline">Devamını Oku</button>
                    </p>
                </div>

            </motion.div>

            {/* 6. STICKY BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-[#050505]/80 backdrop-blur-xl border-t border-white/10 z-40">
                <div className="flex items-center gap-6 max-w-lg mx-auto">
                    <div className="flex-1">
                        <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-0.5">Toplam Tutar</span>
                        <div className="text-2xl font-black text-white tracking-tight">
                            ₺{dummyProduct.price.toLocaleString('tr-TR')}
                        </div>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="flex-[2] bg-[#E2FF3B] text-black h-14 rounded-xl font-black text-base uppercase tracking-wider hover:bg-[#d4f030] active:scale-95 transition-all shadow-[0_0_20px_rgba(226,255,59,0.3)] flex items-center justify-center gap-2"
                    >
                        Sepete Ekle
                        <ShoppingBag className="w-5 h-5 mb-0.5" />
                    </button>
                </div>
            </div>

            {/* Safe Area Spacer for Bottom Bar */}
            <div className="h-24" />

        </div>
    );
};

// Helper component for Color Check
const Check = ({ className }: { className?: string }) => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
);
