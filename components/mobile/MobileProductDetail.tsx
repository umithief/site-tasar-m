
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, ChevronDown, ChevronRight, Heart, Share2, ShoppingBag, Star, AlertCircle, Info, Truck, Shield, Box } from 'lucide-react';
import { Product, ViewState, NegotiationOffer, User } from '../../types';
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
    const [isZoomed, setIsZoomed] = useState(false);
    const [expandedSection, setExpandedSection] = useState<string | null>('desc');

    const images = product?.images && product.images.length > 0 ? product.images : [product?.image || ''];

    useEffect(() => {
        if (product && user && product.isNegotiable) {
            negotiationService.checkUserOffer(user._id, product._id).then(offer => {
                if (offer) setActiveOffer(offer);
            });
        }
        // Track View
        if (product) {
            statsService.trackEvent('view_product', { productId: product._id, productName: product.name });
        }
    }, [product, user]);

    if (!product) return null;

    const currentPrice = activeOffer ? activeOffer.offerPrice : product.price;

    // Compatibility Logic
    const checkCompatibility = () => {
        if (!user || !user.primaryBike) return 'unknown';
        if (!product.compatibleBikes || product.compatibleBikes.length === 0) return 'universal';

        // Check for partial match or exact match
        const isCompatible = product.compatibleBikes.some(bike =>
            user.primaryBike!.toLowerCase().includes(bike.toLowerCase()) ||
            bike.toLowerCase().includes(user.primaryBike!.toLowerCase())
        );

        return isCompatible ? 'match' : 'mismatch';
    };

    const compatibilityStatus = checkCompatibility();

    const handleAddToCart = () => {
        // Trigger vibration (haptic feedback)
        if (navigator.vibrate) navigator.vibrate([50, 30, 50]);

        const productToAdd = activeOffer ? { ...product, price: activeOffer.offerPrice } : product;
        onAddToCart(productToAdd);
        onOpenCart();
    };

    const handleDragEnd = (_: any, info: any) => {
        if (Math.abs(info.offset.x) > 50) {
            if (info.offset.x > 0 && currentImageIndex > 0) {
                setCurrentImageIndex(prev => prev - 1);
            } else if (info.offset.x < 0 && currentImageIndex < images.length - 1) {
                setCurrentImageIndex(prev => prev + 1);
            }
        }
    };

    const nextImage = () => {
        if (currentImageIndex < images.length - 1) setCurrentImageIndex(prev => prev + 1);
    };

    const prevImage = () => {
        if (currentImageIndex > 0) setCurrentImageIndex(prev => prev - 1);
    };

    return (
        <div className="min-h-screen bg-[#000000] text-zinc-100 font-sans pb-32 overflow-x-hidden">

            {/* 1. Immersive Media Gallery (Full Bleed) */}
            <div className="relative w-full h-[60vh] bg-[#050505] overflow-hidden group">

                {/* Floating Controls */}
                <div className="absolute top-safe-top left-0 right-0 px-6 z-50 flex justify-between items-start pt-4">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onNavigate('shop')}
                        className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                        aria-label="Back"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleClick('share')}
                        className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-colors"
                    >
                        <Share2 className="w-5 h-5" />
                    </motion.button>
                </div>

                <div className="w-full h-full relative cursor-grab active:cursor-grabbing">
                    <AnimatePresence initial={false} mode='wait'>
                        <motion.div
                            key={currentImageIndex}
                            className="w-full h-full flex items-center justify-center bg-radial-gradient from-zinc-800/20 to-black"
                            initial={{ opacity: 0, scale: 1.05 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            {/* Pinch to Zoom Logic Placeholder (basic double tap implementation) */}
                            <motion.img
                                src={images[currentImageIndex]}
                                className="w-full h-full object-cover md:object-contain"
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                onDragEnd={handleDragEnd}
                                onDoubleClick={() => setIsZoomed(!isZoomed)}
                                animate={{ scale: isZoomed ? 2 : 1 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        </motion.div>
                    </AnimatePresence>

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />

                    {/* Minimalist Slim Line Indicators */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                        {images.map((_, idx) => (
                            <motion.div
                                key={idx}
                                className={`h-0.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-[#E2FF3B] w-8 shadow-[0_0_10px_rgba(226,255,59,0.8)]' : 'bg-zinc-700 w-4'}`}
                                layoutId="indicator"
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* 2. The Biker's Dashboard (Product Info) */}
            <div className="relative px-6 -mt-10 z-20">

                {/* Compatibility 'Smart Fit' Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`mb-6 p-0.5 rounded-2xl bg-gradient-to-r ${compatibilityStatus === 'match' ? 'from-green-500/50 to-emerald-900/50' : 'from-zinc-800 to-zinc-900'}`}
                >
                    <div className="bg-[#0a0a0a] rounded-[15px] p-4 flex items-center justify-between backdrop-blur-xl">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${compatibilityStatus === 'match' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                {compatibilityStatus === 'match' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            </div>
                            <div>
                                <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${compatibilityStatus === 'match' ? 'text-green-500' : 'text-zinc-500'}`}>
                                    {compatibilityStatus === 'match' ? 'Smart Fit Verified' : 'Uyumluluk Kontrolü'}
                                </p>
                                <p className="text-sm font-bold text-white">
                                    {compatibilityStatus === 'match' ? `${user?.primaryBike} ile mükemmel uyum` : 'Motorunuz ile uyumlu mu?'}
                                </p>
                            </div>
                        </div>
                        {compatibilityStatus !== 'match' && <ChevronRight className="w-5 h-5 text-zinc-600" />}
                    </div>
                </motion.div>

                {/* Title & Price Header */}
                <div className="mb-8">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[#E2FF3B] text-xs font-bold uppercase tracking-[0.2em] font-mono">{product.brand || 'MOTOBIKE'} // SERIES X</span>
                        <div className="flex items-center gap-1.5">
                            <Star className="w-4 h-4 text-[#E2FF3B] fill-[#E2FF3B]" />
                            <span className="text-sm font-bold text-white">{product.rating}</span>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-white leading-tight mb-4 tracking-tight">{product.name}</h1>

                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-mono font-bold text-white tracking-tighter">
                            ₺{currentPrice.toLocaleString('tr-TR')}
                        </span>
                        {activeOffer && (
                            <span className="px-2 py-1 rounded bg-[#E2FF3B]/10 border border-[#E2FF3B]/20 text-[#E2FF3B] text-[10px] font-bold uppercase tracking-wider">
                                Teklif Fiyatı
                            </span>
                        )}
                    </div>
                </div>

                {/* 3. Tech Specs "Exploded View" (Tech Tiles) */}
                <div className="mb-10">
                    <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-4">Teknik Detaylar</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: 'Materyal', value: 'Carbon Fiber', icon: Box },
                            { label: 'Sertifika', value: 'ECE 22.06', icon: Shield },
                            { label: 'Ağırlık', value: '1350g ± 50', icon: Info },
                            { label: 'Garanti', value: '5 Yıl', icon: Check },
                        ].map((spec, i) => (
                            <div key={i} className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl flex flex-col gap-2 hover:border-[#E2FF3B]/30 transition-colors group">
                                <spec.icon className="w-5 h-5 text-zinc-500 group-hover:text-[#E2FF3B] transition-colors" />
                                <div>
                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">{spec.label}</p>
                                    <p className="text-sm font-bold text-white font-mono">{spec.value}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Deep Specs Accordion */}
                    <div className="mt-4 bg-zinc-900/30 border border-white/5 rounded-xl overflow-hidden">
                        <button
                            onClick={() => setExpandedSection(expandedSection === 'deep' ? null : 'deep')}
                            className="w-full flex items-center justify-between p-4"
                        >
                            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                                <Info className="w-4 h-4 text-[#E2FF3B]" />
                                Detaylı Açıklama
                            </span>
                            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${expandedSection === 'deep' ? 'rotate-180' : ''}`} />
                        </button>
                        <AnimatePresence>
                            {expandedSection === 'deep' && (
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: 'auto' }}
                                    exit={{ height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 pt-0 text-sm text-zinc-400 leading-relaxed border-t border-white/5 font-light">
                                        {product.description}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* 4. Social Proof & Community */}
                <div className="mb-12">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Sürücü Galerisi</h3>
                        <button className="text-[#E2FF3B] text-xs font-bold">Tümünü Gör</button>
                    </div>

                    {/* "Spotted on the Road" Scroll */}
                    <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="w-24 h-32 flex-shrink-0 rounded-xl bg-zinc-800 overflow-hidden relative group">
                                <img src={`https://images.unsplash.com/photo-${i === 1 ? '1622185135895-188c0054bb8e' : i === 2 ? '1558981806-2722110c958d' : '1609630875171-b1321377ee65'}?auto=format&fit=crop&q=80&w=200`} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-2 left-2">
                                    <p className="text-[9px] text-white font-bold">@rider{i}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* 5. The "Instant Action" Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 pb-safe-bottom z-[100]">
                {/* Glassmorphism Background with Gradient Border */}
                <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/10" />
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#E2FF3B]/50 to-transparent" />

                <div className="relative flex items-center gap-4 max-w-lg mx-auto">
                    <button
                        onClick={() => setIsFavorite(!isFavorite)}
                        className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-red-500 active:scale-95 transition-all"
                    >
                        <Heart className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    </button>

                    <button
                        onClick={handleAddToCart}
                        className="flex-1 h-14 rounded-2xl bg-[#E2FF3B] text-black flex items-center justify-center gap-3 shadow-[0_0_30px_-5px_rgba(226,255,59,0.3)] hover:shadow-[0_0_40px_rgba(226,255,59,0.5)] active:scale-95 transition-all group overflow-hidden relative"
                    >
                        <div className="absolute inset-0 bg-white/40 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                        <span className="font-bold uppercase tracking-widest text-sm relative z-10">Garage'a Ekle</span>
                        <ShoppingBag className="w-5 h-5 relative z-10" />
                    </button>
                </div>
            </div>

        </div>
    );
};

// Helper for 'handleClick' only used in share button currently
const handleClick = (action: string) => {
    if (action === 'share') {
        if (navigator.share) {
            navigator.share({ title: 'Motovibe', url: window.location.href });
        } else {
            console.log('Share not supported');
        }
    }
};
