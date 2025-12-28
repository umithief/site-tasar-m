import React, { useState } from 'react';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { Product } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface DesktopProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    onQuickView: (product: Product) => void;
    isFavorite: boolean;
    onToggleFavorite: (product: Product) => void;
}

export const DesktopProductCard: React.FC<DesktopProductCardProps> = ({
    product,
    onAddToCart,
    onQuickView,
    isFavorite,
    onToggleFavorite
}) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            layoutId={`product-${product._id}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative bg-[#09090b] border border-white/5 rounded-2xl overflow-hidden cursor-pointer hover:border-orange-500/50 transition-colors duration-500"
        >
            {/* Image Area */}
            <div className="relative aspect-[0.8] overflow-hidden bg-zinc-900">
                <motion.img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                    transition={{ duration: 0.6 }}
                />

                {/* Overlay Gradient */}
                <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`} />

                {/* Hover Actions */}
                <div className={`absolute inset-0 flex items-center justify-center gap-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
                        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-orange-500 hover:text-white transition-colors shadow-lg transform hover:scale-110 active:scale-95"
                    >
                        <ShoppingBag className="w-5 h-5" />
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onQuickView(product); }}
                        className="w-12 h-12 rounded-full bg-black/50 backdrop-blur border border-white/20 text-white flex items-center justify-center hover:bg-white hover:text-black transition-colors shadow-lg transform hover:scale-110 active:scale-95"
                    >
                        <Eye className="w-5 h-5" />
                    </button>
                </div>

                {/* Favorite Button (Always visible but subtle) */}
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleFavorite(product); }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/20 backdrop-blur flex items-center justify-center transition-all hover:bg-red-500/20"
                >
                    <Heart className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>
            </div>

            {/* Info Area */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider font-mono">{product.brand || 'MOTO'}</span>
                    <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 text-orange-500 fill-orange-500" />
                        <span className="text-xs font-bold text-zinc-400">{product.rating}</span>
                    </div>
                </div>

                <h3 className="text-sm font-bold text-white mb-2 line-clamp-2 leading-relaxed group-hover:text-orange-500 transition-colors">
                    {product.name}
                </h3>

                <div className="flex items-center gap-2">
                    <span className="text-lg font-mono font-bold text-white">
                        ₺{product.price.toLocaleString('tr-TR')}
                    </span>
                    {product.stock < 5 && (
                        <span className="text-[9px] text-red-500 font-bold uppercase border border-red-500/30 px-1.5 py-0.5 rounded">
                            Last {product.stock}
                        </span>
                    )}
                </div>
            </div>
        </motion.div>
    );
};
