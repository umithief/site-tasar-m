import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Heart, Share2, Star, Check } from 'lucide-react';
import { Product } from '../../types';

interface DesktopQuickViewProps {
    product: Product | null;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
    onToggleFavorite?: (product: Product) => void;
    isFavorite?: boolean;
}

export const DesktopQuickView: React.FC<DesktopQuickViewProps> = ({
    product,
    onClose,
    onAddToCart,
    onToggleFavorite,
    isFavorite
}) => {
    return (
        <AnimatePresence>
            {product && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Side Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed top-0 right-0 bottom-0 w-[500px] bg-zinc-950 border-l border-white/10 z-[101] overflow-y-auto no-scrollbar shadow-2xl"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-black/50 hover:bg-white text-white hover:text-black transition-colors z-20"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Content */}
                        <div className="flex flex-col min-h-full">
                            {/* Image Section */}
                            <div className="relative h-[60vh] bg-zinc-900 border-b border-white/5">
                                <img
                                    src={product.image}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent" />

                                <div className="absolute bottom-6 left-8 right-8">
                                    <h3 className="text-[#E2FF3B] font-bold uppercase tracking-widest text-xs mb-2">{product.brand || 'MOTOVIBE'}</h3>
                                    <h2 className="text-3xl font-bold text-white leading-tight mb-2">{product.name}</h2>
                                    <div className="flex items-center gap-2">
                                        <div className="flex text-[#E2FF3B]">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-zinc-700'}`} />
                                            ))}
                                        </div>
                                        <span className="text-sm text-zinc-400">({product.stock} items in stock)</span>
                                    </div>
                                </div>
                            </div>

                            {/* Details Section */}
                            <div className="p-8 flex-1 flex flex-col">
                                <p className="text-zinc-400 text-sm leading-relaxed mb-8 flex-1">
                                    {product.description}
                                </p>

                                {/* Features */}
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {product.features?.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-3">
                                            <Check className="w-4 h-4 text-[#E2FF3B] mt-1 shrink-0" />
                                            <span className="text-sm text-zinc-300 font-medium">{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* Actions */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-3xl font-mono font-bold text-white">₺{product.price.toLocaleString('tr-TR')}</span>
                                    </div>

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => onAddToCart(product)}
                                            className="flex-1 h-14 bg-white text-black rounded-full font-bold uppercase tracking-widest hover:bg-[#E2FF3B] hover:text-black transition-all flex items-center justify-center gap-2"
                                        >
                                            <ShoppingBag className="w-5 h-5" />
                                            Add to Garage
                                        </button>
                                        <button
                                            onClick={() => onToggleFavorite && onToggleFavorite(product)}
                                            className={`w-14 h-14 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors ${isFavorite ? 'text-red-500' : 'text-white'}`}
                                        >
                                            <Heart className={`w-6 h-6 ${isFavorite ? 'fill-current' : ''}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
