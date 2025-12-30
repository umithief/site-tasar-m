import React from 'react';
import { X, Shield, Check, ArrowRight, ShoppingBag, Sparkles, Star } from 'lucide-react';
import { Product } from '../types';
import { Button } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductQuickViewModalProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product, event?: React.MouseEvent) => void;
    onViewDetail: (product: Product) => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
    product,
    isOpen,
    onClose,
    onAddToCart,
    onViewDetail
}) => {
    if (!product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] overflow-y-auto">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/95 backdrop-blur-xl cursor-pointer"
                        onClick={onClose}
                    />

                    {/* Modal Container */}
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", duration: 0.5 }}
                            className="relative bg-gradient-to-br from-dark-elevated to-dark-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/50 max-w-5xl w-full"
                        >
                            {/* Glow Effect */}
                            <div className="absolute inset-0 bg-gradient-to-br from-moto-accent/5 via-transparent to-neon-purple/5 pointer-events-none" />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 z-30 p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-all hover:scale-110 border border-white/10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col md:flex-row relative z-10">
                                {/* Left: Image Section */}
                                <div className="w-full md:w-1/2 bg-dark-surface relative min-h-[400px] p-12 flex items-center justify-center group">
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-moto-accent/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <motion.img
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        src={product.image}
                                        alt={product.name}
                                        className="relative z-10 w-full h-full object-contain drop-shadow-2xl"
                                    />

                                    {/* Floating Badges */}
                                    {product.isEditorsChoice && (
                                        <div className="absolute top-6 left-6 bg-neon-purple/90 backdrop-blur-md text-white text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-1.5 shadow-lg border border-white/20">
                                            <Sparkles className="w-3 h-3" /> Editor's Choice
                                        </div>
                                    )}
                                    {product.isDealOfTheDay && (
                                        <div className="absolute bottom-6 left-6 bg-gradient-to-r from-moto-accent to-neon-yellow text-black text-xs font-black px-3 py-1.5 rounded-full uppercase tracking-wider shadow-glow">
                                            🔥 Today's Deal
                                        </div>
                                    )}
                                </div>

                                {/* Right: Product Info */}
                                <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col">
                                    {/* Category */}
                                    <motion.div
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.3 }}
                                        className="mb-2"
                                    >
                                        <span className="text-moto-accent text-xs font-black uppercase tracking-widest">
                                            {product.brand || product.category}
                                        </span>
                                    </motion.div>

                                    {/* Product Name */}
                                    <motion.h2
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4 }}
                                        className="text-3xl md:text-4xl font-display font-black text-white mb-4 leading-tight"
                                    >
                                        {product.name}
                                    </motion.h2>

                                    {/* Rating */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="flex items-center gap-3 mb-6"
                                    >
                                        <div className="flex items-center gap-1">
                                            {[...Array(5)].map((_, i) => (
                                                <Star
                                                    key={i}
                                                    className={`w-4 h-4 ${i < Math.floor(product.rating)
                                                            ? 'fill-moto-accent text-moto-accent'
                                                            : 'text-white/20'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <span className="text-gray-400 text-sm">({product.rating}) • 120 reviews</span>
                                    </motion.div>

                                    {/* Description */}
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.6 }}
                                        className="text-gray-300 text-sm leading-relaxed mb-6 line-clamp-3"
                                    >
                                        {product.description}
                                    </motion.p>

                                    {/* Features */}
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.7 }}
                                        className="space-y-2 mb-8 pb-6 border-b border-white/10"
                                    >
                                        {product.features.slice(0, 3).map((feature, i) => (
                                            <div key={i} className="flex items-center gap-3 text-sm text-gray-300">
                                                <div className="w-5 h-5 rounded-full bg-neon-green/20 flex items-center justify-center flex-shrink-0">
                                                    <Check className="w-3 h-3 text-neon-green" />
                                                </div>
                                                {feature}
                                            </div>
                                        ))}
                                    </motion.div>

                                    {/* Price & Stock */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 }}
                                        className="mb-6"
                                    >
                                        <div className="flex items-end justify-between mb-2">
                                            <span className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-moto-accent to-neon-yellow">
                                                ₺{product.price.toLocaleString('tr-TR')}
                                            </span>
                                            {product.stock < 5 && (
                                                <span className="text-red-400 text-xs font-bold px-3 py-1 bg-red-500/20 rounded-full border border-red-500/50">
                                                    Only {product.stock} left!
                                                </span>
                                            )}
                                        </div>
                                        {product.isNegotiable && (
                                            <p className="text-neon-green text-sm font-bold uppercase tracking-wider">
                                                Negotiable Price
                                            </p>
                                        )}
                                    </motion.div>

                                    {/* Action Buttons */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.9 }}
                                        className="grid grid-cols-2 gap-4"
                                    >
                                        <button
                                            onClick={(e) => onAddToCart(product, e)}
                                            className="col-span-2 md:col-span-1 bg-gradient-to-r from-moto-accent to-moto-orange-600 text-black font-black text-sm uppercase tracking-wider py-4 rounded-2xl hover:shadow-glow-lg transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            Add to Cart
                                        </button>
                                        <button
                                            onClick={() => onViewDetail(product)}
                                            className="col-span-2 md:col-span-1 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-sm uppercase tracking-wider py-4 rounded-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                                        >
                                            View Details
                                            <ArrowRight className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            )}
        </AnimatePresence>
    );
};