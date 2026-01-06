import React from 'react';
import { Product } from '../../types';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageProvider';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    onProductClick: (product: Product) => void;
    isFavorite?: boolean;
    onToggleFavorite?: (id: string, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onAddToCart,
    onProductClick,
    isFavorite = false,
    onToggleFavorite
}) => {
    const { t } = useLanguage();

    // Calculate display price (with discount if any)
    const hasDiscount = product.discountPrice && product.discountPrice < product.price;
    const discountPercentage = hasDiscount
        ? Math.round(((product.price - (product.discountPrice || 0)) / product.price) * 100)
        : 0;

    return (
        <motion.div
            layoutId={`product-${product._id}`}
            className="group relative bg-white dark:bg-[#121214] rounded-xl overflow-hidden border border-gray-200 dark:border-white/5 hover:border-moto-accent/30 dark:hover:border-moto-accent/30 transition-all duration-300 shadow-lg dark:shadow-none"
            whileHover={{ y: -5 }}
        >
            {/* Image Container */}
            <div
                className="relative aspect-[4/5] overflow-hidden cursor-pointer"
                onClick={() => onProductClick(product)}
            >
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {hasDiscount && (
                        <span className="bg-[#FF3E3E] text-white text-xs font-bold px-2 py-1 rounded">
                            %{discountPercentage} {t('cart.discount')}
                        </span>
                    )}
                    {product.stock <= 5 && product.stock > 0 && (
                        <span className="bg-[#E2FF3B] text-black text-xs font-bold px-2 py-1 rounded">
                            {t('product.stock_last').replace('{count}', String(product.stock))}
                        </span>
                    )}
                    {product.stock === 0 && (
                        <span className="bg-gray-500 text-white text-xs font-bold px-2 py-1 rounded">
                            {t('product.stock_out')}
                        </span>
                    )}
                </div>

                {/* Quick Actions (Hover) */}
                <div className="absolute right-3 top-3 flex flex-col gap-2 translate-x-10 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                        onClick={(e) => onToggleFavorite?.(product._id, e)}
                        className={`p-2 rounded-full backdrop-blur-md transition-colors ${isFavorite ? 'bg-[#FF3E3E]/20 text-[#FF3E3E]' : 'bg-black/40 text-white hover:bg-white hover:text-black'
                            }`}
                    >
                        <Heart size={18} fill={isFavorite ? "currentColor" : "none"} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onProductClick(product);
                        }}
                        className="p-2 rounded-full bg-black/40 text-white hover:bg-white hover:text-black backdrop-blur-md transition-colors"
                    >
                        <Eye size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-2">
                    <span className="text-xs text-moto-accent font-medium uppercase tracking-wider">
                        {product.brand}
                    </span>
                    <h3
                        className="text-zinc-900 dark:text-white font-medium line-clamp-1 cursor-pointer hover:text-moto-accent dark:hover:text-moto-accent transition-colors"
                        onClick={() => onProductClick(product)}
                    >
                        {product.name}
                    </h3>
                </div>

                <div className="flex items-end justify-between mt-3">
                    <div className="flex flex-col">
                        {hasDiscount && (
                            <span className="text-sm text-gray-500 line-through">
                                {product.price.toLocaleString('tr-TR')} ₺
                            </span>
                        )}
                        <span className="text-lg font-bold text-zinc-900 dark:text-white">
                            {(product.discountPrice || product.price).toLocaleString('tr-TR')} ₺
                        </span>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onAddToCart(product);
                        }}
                        disabled={product.stock === 0}
                        className={`p-3 rounded-xl flex items-center justify-center transition-all active:scale-95 ${product.stock === 0
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                            : 'bg-[#E2FF3B] text-black hover:bg-white hover:shadow-[0_0_15px_rgba(226,255,59,0.3)]'
                            }`}
                    >
                        <ShoppingCart size={20} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
