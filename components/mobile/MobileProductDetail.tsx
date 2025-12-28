
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
        if (!product.compatibleBikes || product.compatibleBikes.length === 0) return 'universal'; // Assume universal if not specified? Or unknown.

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
        if (navigator.vibrate) navigator.vibrate(50);

        const productToAdd = activeOffer ? { ...product, price: activeOffer.offerPrice } : product;
        onAddToCart(productToAdd);
        onOpenCart();
    };

    const handleDragEnd = (_: any, info: any) => {
        if (info.offset.x > 50 && currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
        } else if (info.offset.x < -50 && currentImageIndex < images.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
        }
    };

    return (
        <div className="min-h-screen bg-[#f9fafb] pb-24">

            {/* 1. Hero Experience */}
            <div className="relative w-full h-[50vh] bg-white rounded-b-[40px] shadow-2xl overflow-hidden z-10">

                {/* Floating Back Button */}
                <button
                    onClick={() => onNavigate('shop')}
                    className="absolute top-safe-top left-6 z-50 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-gray-900 shadow-sm active:scale-90 transition-transform"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>

                <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="absolute top-safe-top right-6 z-50 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/20 flex items-center justify-center text-gray-900 shadow-sm active:scale-90 transition-transform"
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                </button>

                {/* Image Slider */}
                <div className="relative w-full h-full">
                    <AnimatePresence initial={false} mode='wait'>
                        <motion.img
                            key={currentImageIndex}
                            src={images[currentImageIndex]}
                            className="w-full h-full object-contain p-8"
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            onDragEnd={handleDragEnd}
                        />
                    </AnimatePresence>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2">
                        {images.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-moto-accent w-6' : 'bg-gray-200'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <div className="px-6 -mt-8 relative z-20">
                {/* 2. Compatibility Badge */}
                {compatibilityStatus === 'match' && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-green-500 text-white p-4 rounded-2xl shadow-lg shadow-green-500/30 flex items-center gap-3 backdrop-blur-md"
                    >
                        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                            <Check className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold opacity-90 uppercase tracking-wide">Mükemmel Uyum</p>
                            <p className="text-sm font-bold">{user?.primaryBike} ile uyumlu</p>
                        </div>
                    </motion.div>
                )}

                {compatibilityStatus === 'mismatch' && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-gray-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between backdrop-blur-md"
                    >
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-yellow-500" />
                            <div>
                                <p className="text-xs text-gray-400">Uyumluluk Kontrolü</p>
                                <p className="text-sm font-bold">Motorunuz için kontrol edin</p>
                            </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                    </motion.div>
                )}
            </div>

            {/* 3. Content Hierarchy */}
            <div className="px-6 pt-8 pb-32">

                <div className="flex justify-between items-start mb-2">
                    <span className="text-moto-accent text-xs font-bold uppercase tracking-widest">{product.category}</span>
                    <div className="flex items-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-bold text-gray-900">{product.rating}</span>
                        <span className="text-xs text-gray-400">({product.rating * 10 + 24})</span>
                    </div>
                </div>

                <h1 className="text-3xl font-display font-black text-gray-900 leading-tight mb-4">{product.name}</h1>

                <div className="flex items-end gap-3 mb-8">
                    <span className="text-4xl font-mono font-bold text-moto-accent tracking-tighter">
                        ₺{currentPrice.toLocaleString('tr-TR')}
                    </span>
                    {activeOffer && (
                        <span className="mb-1.5 px-2 py-0.5 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">Özel Fiyat</span>
                    )}
                </div>

                {/* Social Proof */}
                <div className="flex items-center gap-3 mb-10 py-3 px-4 bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white" />
                        ))}
                    </div>
                    <p className="text-xs text-gray-500 font-medium">
                        <strong className="text-gray-900">4 sürücü</strong> yakın çevrende bunu kullanıyor.
                    </p>
                </div>

                {/* Accordions */}
                <div className="space-y-4">
                    {[
                        { id: 'desc', label: 'Açıklama', icon: Info, content: product.description },
                        { id: 'tech', label: 'Teknik Özellikler', icon: Box, content: product.features.join(' • ') },
                        { id: 'ship', label: 'Teslimat & İade', icon: Truck, content: 'Ücretsiz kargo ve 30 gün içinde kolay iade garantisi.' }
                    ].map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                            <button
                                onClick={() => setExpandedSection(expandedSection === item.id ? null : item.id)}
                                className="w-full flex items-center justify-between p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                                        <item.icon className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{item.label}</span>
                                </div>
                                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedSection === item.id ? 'rotate-180' : ''}`} />
                            </button>
                            <AnimatePresence>
                                {expandedSection === item.id && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: 'auto' }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-4 pt-0 text-sm text-gray-500 leading-relaxed border-t border-gray-50">
                                            {item.content}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ))}
                </div>

            </div>

            {/* Sticky Bottom Action */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-gray-200 pb-safe-bottom z-40">
                <button
                    onClick={handleAddToCart}
                    className="w-full h-14 bg-black text-white rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-black/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                    <ShoppingBag className="w-5 h-5" />
                    Sepete Ekle
                </button>
            </div>

        </div>
    );
};
