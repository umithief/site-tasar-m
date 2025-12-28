import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Heart, Award } from 'lucide-react';
import { Product } from '../../hooks/useProducts';
import { useCartStore } from '../../store/useCartStore';
import { notify } from '../../services/notificationService';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const addToCart = useCartStore((state) => state.addToCart);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        await addToCart({
            productId: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
        notify.success('Sepete eklendi');
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.98 }}
            className="group relative bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800"
        >
            {/* Image Area */}
            <div className="aspect-[4/5] bg-zinc-800 relative overflow-hidden">
                <img
                    src={product.image || "https://images.unsplash.com/photo-1557844352-761f2565b576?auto=format&fit=crop&q=80&w=400"}
                    alt={product.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                {/* Brand Badge */}
                <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                    <span className="text-[10px] uppercase font-bold text-zinc-300 tracking-wider">
                        {product.brand}
                    </span>
                </div>

                {/* Social Cred (Rider's Choice) */}
                {(product.likes || 0) > 50 && (
                    <div className="absolute top-2 right-2 bg-orange-500/20 backdrop-blur-md px-2 py-1 rounded-full border border-orange-500/50 flex items-center gap-1">
                        <Award size={10} className="text-orange-500" />
                        <span className="text-[9px] font-bold text-orange-400 uppercase">Rider's Choice</span>
                    </div>
                )}
            </div>

            {/* Content Area */}
            <div className="p-3">
                <h3 className="text-white text-sm font-bold leading-tight line-clamp-2 h-10 mb-1">
                    {product.name}
                </h3>

                <div className="flex items-center justify-between mt-2">
                    <div className="text-orange-500 font-bold text-sm tracking-wide">
                        ₺{product.price.toLocaleString('tr-TR')}
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.8 }}
                        onClick={handleAddToCart}
                        className="bg-white text-black p-1.5 rounded-full hover:bg-orange-500 transition-colors"
                    >
                        <Plus size={16} strokeWidth={3} />
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default ProductCard;
