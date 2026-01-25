
import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, ArrowRight, Zap } from 'lucide-react';

interface SponsoredCardProps {
    product: any; // Using any for flexibility with Product type
    onNavigate?: (view: string, data?: any) => void;
}

export const SponsoredCard: React.FC<SponsoredCardProps> = ({ product, onNavigate }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow mb-6 relative group"
        >
            {/* Badge */}
            <div className="absolute top-3 left-3 z-10">
                <span className="px-2 py-1 bg-black/80 dark:bg-white/90 backdrop-blur-md text-white dark:text-black text-[10px] font-black tracking-widest uppercase rounded-md shadow-lg flex items-center gap-1">
                    <Zap className="w-3 h-3 text-yellow-400 dark:text-yellow-600 fill-current" />
                    Önerilen
                </span>
            </div>

            {/* Image Section */}
            <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-[#151515]">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                />
            </div>

            {/* Content Section */}
            <div className="p-4 relative">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-display font-black text-gray-900 dark:text-white text-lg leading-tight uppercase italic mb-1">
                            {product.name}
                        </h3>
                        <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{product.rating}</span>
                            <span className="text-[10px] text-gray-400 ml-1">({product.reviewCount || 42} Değerlendirme)</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-lg font-black text-moto-accent">
                            ₺{product.price?.toLocaleString('tr-TR')}
                        </div>
                        {product.originalPrice && (
                            <div className="text-xs text-gray-400 line-through decoration-red-500 decoration-2">
                                ₺{product.originalPrice.toLocaleString('tr-TR')}
                            </div>
                        )}
                    </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 font-medium">
                    {product.description}
                </p>

                <button
                    onClick={() => onNavigate?.('product-detail', product)}
                    className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-xl font-black uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                >
                    <ShoppingBag className="w-4 h-4" />
                    Hemen İncele
                    <ArrowRight className="w-3 h-3 ml-auto opacity-50" />
                </button>
            </div>

            {/* Background Gradient Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-moto-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
        </motion.div>
    );
};
