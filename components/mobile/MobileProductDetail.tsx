
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Heart, Share2, ShoppingBag, Star, ChevronRight } from 'lucide-react';
import { Product, ViewState, NegotiationOffer } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { negotiationService } from '../../services/negotiationService';
import { statsService } from '../../services/statsService';
import { useLanguage } from '../../contexts/LanguageProvider';

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
    const { user } = useAuthStore();
    const { t } = useLanguage();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [activeOffer, setActiveOffer] = useState<NegotiationOffer | null>(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string>('39'); // Default selection for demo

    // Mock sizes for the "shoe" style selector
    const sizes = ['37', '38', '39', '40', '41', '42', '43', '44'];

    const images = product?.images && product.images.length > 0 ? product.images : [product?.image || ''];

    useEffect(() => {
        if (product && user && product.isNegotiable) {
            negotiationService.checkUserOffer(user._id, product._id).then(offer => {
                if (offer) setActiveOffer(offer);
            });
        }
        if (product) {
            statsService.trackEvent('view_product', { productId: product._id, productName: product.name });
        }
    }, [product, user]);

    if (!product) return null;

    const currentPrice = activeOffer ? activeOffer.offerPrice : product.price;

    const handleAddToCart = () => {
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
        const productToAdd = activeOffer ? { ...product, price: activeOffer.offerPrice } : product;
        onAddToCart(productToAdd);
        onOpenCart();
    };

    return (
        <div className="min-h-screen bg-[#Fdfdfd] text-zinc-900 font-sans pb-32 overflow-x-hidden relative">

            {/* 1. HEADER: Clean & Minimal */}
            <div className="fixed top-0 left-0 right-0 px-6 py-4 z-50 flex justify-between items-center pointer-events-none">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onNavigate('shop')}
                    className="w-10 h-10 rounded-full bg-white shadow-lg shadow-black/5 flex items-center justify-center text-zinc-900 pointer-events-auto"
                >
                    <ArrowLeft className="w-5 h-5" />
                </motion.button>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 bg-[#fee2e2]/0 pointer-events-auto" // Transparent container
                >
                    <div className="bg-[#FFF8F0] px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm border border-[#FFE4C4]/50">
                        <Check className="w-4 h-4 text-black bg-[#Eedc82] rounded-full p-0.5" />
                        <span className="text-xs font-bold text-zinc-800">{product.brand || 'Nike'}</span>
                    </div>
                </motion.div>
            </div>


            {/* 2. TITLE SECTION (Above Image) */}
            <div className="pt-24 px-6 mb-4">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl font-bold text-zinc-900 leading-tight tracking-tight"
                >
                    {product.name}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-zinc-500 font-medium text-sm mt-1"
                >
                    {product.category}
                </motion.p>
            </div>


            {/* 3. HERO IMAGE CAROUSEL */}
            <div className="relative w-full h-[35vh] flex items-center justify-center mb-8">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImageIndex}
                        src={images[currentImageIndex]}
                        initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="h-full object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.15)] z-10"
                    />
                </AnimatePresence>

                {/* Decorative background circle */}
                <div className="absolute inset-0 flex items-center justify-center -z-0">
                    <div className="w-[80%] aspect-square rounded-full bg-gradient-to-tr from-gray-100 to-white opacity-80" />
                </div>
            </div>


            {/* 4. THUMBNAIL GALLERY */}
            <div className="px-6 flex gap-4 overflow-x-auto no-scrollbar mb-8">
                {images.map((img, idx) => (
                    <motion.button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        whileTap={{ scale: 0.9 }}
                        className={`relative w-20 h-20 rounded-xl flex-shrink-0 flex items-center justify-center bg-gray-50 border transition-all ${currentImageIndex === idx ? 'border-zinc-300 shadow-md' : 'border-transparent'}`}
                    >
                        <img src={img} className="w-16 h-16 object-contain mix-blend-multiply" />
                    </motion.button>
                ))}
            </div>


            {/* 5. SIZE SELECTOR (Circular) */}
            <div className="px-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-zinc-900">Size</h3>
                    <button className="text-zinc-400 text-sm font-medium">Size Guide</button>
                </div>
                <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
                    {sizes.map((size) => {
                        const isActive = selectedSize === size;
                        return (
                            <motion.button
                                key={size}
                                onClick={() => setSelectedSize(size)}
                                className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold transition-all shadow-sm ${isActive ? 'bg-[#FBE89F] text-black scale-110 shadow-md ring-4 ring-[#FFF9E5]' : 'bg-white text-zinc-500 border border-gray-100'}`}
                            >
                                {size}
                            </motion.button>
                        );
                    })}
                </div>
            </div>


            {/* 6. DESCRIPTION */}
            <div className="px-6 mb-32">
                <h3 className="text-lg font-bold text-zinc-900 mb-2">About</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">
                    {product.description || "The eye-catching design features premium materials and advanced comfort technology. Perfect for long rides or casual outings, ensuring you stay stylish and protected wherever the road takes you."}
                </p>
            </div>


            {/* 7. ORGANIC BOTTOM BAR */}
            <div className="fixed bottom-0 left-0 right-0 z-[100] pointer-events-none">
                {/* The SVG and Buttons Container - Using SVG for complex shape */}
                <div className="relative w-full h-[100px] flex items-end justify-center pointer-events-auto">

                    {/* Main Black Bar Shape */}
                    <div className="absolute bottom-4 left-4 right-4 h-20 bg-black rounded-[40px] shadow-2xl flex items-center justify-between pl-10 pr-2 overflow-visible">

                        {/* Buy Text */}
                        <motion.button
                            onClick={handleAddToCart}
                            whileTap={{ scale: 0.95 }}
                            className="flex-1 text-left"
                        >
                            <span className="text-white text-2xl font-bold tracking-wide">Buy</span>
                        </motion.button>

                        {/* White Price Badge (Overlapping) */}
                        <div className="relative w-24 h-24 -mt-2 -mr-2 bg-white rounded-full flex items-center justify-center border-[6px] border-[#Fdfdfd] shadow-xl">
                            <div className="flex flex-col items-center leading-none">
                                <span className="text-[10px] text-zinc-400 font-bold uppercase mb-0.5">USD</span>
                                <span className="text-xl font-black text-black tracking-tighter">
                                    {currentPrice.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

        </div>
    );
};
