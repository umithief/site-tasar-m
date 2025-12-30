import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Heart, Eye } from 'lucide-react';
import { Product } from '../../types';
import { GlassButton } from '../ui/GlassButton';

interface PremiumProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    onQuickView?: (product: Product) => void;
    onToggleFavorite?: (id: string) => void;
    isFavorite?: boolean;
}

export const PremiumProductCard: React.FC<PremiumProductCardProps> = ({
    product,
    onAddToCart,
    onQuickView,
    onToggleFavorite,
    isFavorite
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-dark-elevated to-dark-card border border-white/10 hover:border-moto-accent/50 transition-all duration-500"
        >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-moto-accent/0 to-moto-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Shine Animation */}
            <div className="absolute -top-full left-0 w-full h-full bg-gradient-to-b from-transparent via-white/10 to-transparent rotate-12 group-hover:top-full transition-all duration-1000" />

            {/* Image Container */}
            <div className="relative aspect-square overflow-hidden bg-dark-surface">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                />

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    {onQuickView && (
                        <button
                            onClick={() => onQuickView(product)}
                            className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white hover:text-black transition-all flex items-center justify-center"
                        >
                            <Eye className="w-5 h-5" />
                        </button>
                    )}
                    {onToggleFavorite && (
                        <button
                            onClick={() => onToggleFavorite(product._id)}
                            className={`w-12 h-12 rounded-full backdrop-blur-md border transition-all flex items-center justify-center ${isFavorite
                                    ? 'bg-moto-accent text-white border-moto-accent'
                                    : 'bg-white/10 border-white/20 text-white hover:bg-white hover:text-black'
                                }`}
                        >
                            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                        </button>
                    )}
                </div>

                {/* Badges */}
                {product.isDealOfTheDay && (
                    <div className="absolute top-4 left-4 bg-gradient-to-r from-moto-accent to-moto-orange-600 text-black text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-glow">
                        🔥 Fırsat
                    </div>
                )}
                {product.isEditorsChoice && (
                    <div className="absolute top-4 right-4 bg-neon-purple text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                        ⭐ Editör
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                {/* Brand & Name */}
                <div>
                    <p className="text-moto-accent text-xs font-bold uppercase tracking-wider mb-1">
                        {product.brand || 'Premium'}
                    </p>
                    <h3 className="text-white font-display font-bold text-lg leading-tight line-clamp-2 group-hover:text-moto-accent transition-colors">
                        {product.name}
                    </h3>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${i < Math.floor(product.rating)
                                    ? 'bg-gradient-to-r from-moto-accent to-neon-yellow'
                                    : 'bg-white/10'
                                }`}
                        />
                    ))}
                    <span className="text-xs text-gray-500 ml-2">({product.rating})</span>
                </div>

                {/* Price & CTA */}
                <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    <div>
                        <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-moto-accent to-neon-yellow">
                            {product.price.toLocaleString('tr-TR')}₺
                        </p>
                        {product.isNegotiable && (
                            <p className="text-xs text-neon-green font-bold uppercase tracking-wider">
                                Pazarlık yapılır
                            </p>
                        )}
                    </div>
                    <button
                        onClick={() => onAddToCart(product)}
                        className="w-12 h-12 rounded-full bg-gradient-to-r from-moto-accent to-moto-orange-600 text-black hover:shadow-glow-lg transition-all flex items-center justify-center group/btn"
                    >
                        <ShoppingBag className="w-5 h-5 transform group-hover/btn:scale-110 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Stock Indicator */}
            {product.stock < 5 && product.stock > 0 && (
                <div className="absolute bottom-4 right-4 bg-red-500/20 backdrop-blur-md border border-red-500/50 text-red-400 text-xs font-bold px-3 py-1 rounded-full uppercase">
                    {product.stock} Adet Kaldı
                </div>
            )}
        </motion.div>
    );
};
