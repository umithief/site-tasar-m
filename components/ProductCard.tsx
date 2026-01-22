
import React, { useState } from 'react';
import { Heart, ShoppingBag, Check, Eye, Share2, Sparkles } from 'lucide-react';
import { Button } from './ui/Button';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { StarRating } from './ui/StarRating';
import { Highlighter } from './Highlighter';
import { useLanguage } from '../contexts/LanguageProvider';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product, event?: React.MouseEvent) => void;
    onClick: (product: Product) => void;
    onQuickView?: (product: Product) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (product: Product) => void;
    highlight?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onAddToCart,
    onClick,
    isFavorite,
    onToggleFavorite,
    onQuickView,
    highlight = ''
}) => {
    const { t } = useLanguage();
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isAdded, setIsAdded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.stopPropagation();
        onAddToCart(product, e);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const handleShare = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(`${window.location.origin}/product/${product._id}`);
    };

    const handleQuickView = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (onQuickView) onQuickView(product);
    }

    return (
        <motion.div
            onClick={() => onClick(product)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-gradient-to-br from-dark-elevated to-dark-card border border-white/10 rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 hover:border-moto-accent/50 hover:-translate-y-2 hover:shadow-glow-lg"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
        >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-moto-accent/0 to-moto-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Shine Animation */}
            <div className="absolute -top-full left-0 w-full h-full bg-gradient-to-b from-transparent via-white/10 to-transparent rotate-12 group-hover:top-full transition-all duration-1000" />

            {/* Image Section */}
            <div className="relative aspect-square overflow-hidden bg-dark-surface">
                <LazyLoadImage
                    src={product.image}
                    alt={product.name}
                    className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    effect="blur"
                    wrapperClassName="w-full h-full"
                    afterLoad={() => setImageLoaded(true)}
                    width="100%"
                    height="100%"
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    {onQuickView && (
                        <button
                            onClick={handleQuickView}
                            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-all flex items-center justify-center"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                    )}
                    {onToggleFavorite && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(product); }}
                            className={`w-12 h-12 rounded-full backdrop-blur-md border transition-all flex items-center justify-center ${isFavorite
                                ? 'bg-moto-accent text-white border-moto-accent'
                                : 'bg-white/10 border-white/20 text-white hover:bg-white hover:text-black'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                    )}
                    <button
                        onClick={handleShare}
                        className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-neon-cyan hover:border-neon-cyan transition-all flex items-center justify-center"
                    >
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>

                {/* Badges */}
                {product.isDealOfTheDay && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-moto-accent to-moto-orange-600 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-glow z-10">
                        🔥 {t('product.deal')}
                    </div>
                )}
                {product.isEditorsChoice && (
                    <div className="absolute top-4 right-4 bg-neon-purple text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 z-10">
                        <Sparkles className="w-3 h-3" /> {t('product.premium')}
                    </div>
                )}
                {product.stock < 5 && product.stock > 0 && !product.isDealOfTheDay && (
                    <div className="absolute bottom-4 right-4 bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase z-10">
                        {product.stock} {t('product.stock_last')}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-5 space-y-3">
                {/* Category & Brand */}
                <div className="flex items-center justify-between">
                    <span className="text-moto-accent text-xs font-bold uppercase tracking-wider">
                        {product.brand || product.category}
                    </span>
                    {product.isNegotiable && (
                        <span className="text-neon-green text-xs font-bold uppercase tracking-wider">
                            {t('product.deal')}
                        </span>
                    )}
                </div>

                {/* Name */}
                <h3 className="text-white font-display font-bold text-lg leading-tight line-clamp-2 group-hover:text-moto-accent transition-colors">
                    <Highlighter text={product.name} highlight={highlight} />
                </h3>

                {/* Rating */}
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full transition-all ${i < Math.floor(product.rating)
                                ? 'bg-gradient-to-r from-moto-accent to-neon-yellow shadow-glow-sm'
                                : 'bg-white/10'
                                }`}
                        />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">({product.rating})</span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                    <div>
                        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-moto-accent to-neon-yellow">
                            ₺{product.price.toLocaleString('tr-TR')}
                        </p>
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className={`w-12 h-12 rounded-full transition-all flex items-center justify-center shadow-lg group/btn ${isAdded
                            ? 'bg-neon-green text-black'
                            : 'bg-gradient-to-r from-moto-accent to-moto-orange-600 text-black hover:shadow-glow-lg'
                            }`}
                    >
                        <AnimatePresence mode="wait">
                            {isAdded ? (
                                <motion.div
                                    key="check"
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    exit={{ scale: 0 }}
                                >
                                    <Check className="w-5 h-5" />
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="bag"
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                >
                                    <ShoppingBag className="w-5 h-5 transform group-hover/btn:scale-110 transition-transform" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
