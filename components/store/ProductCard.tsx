import React, { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { ShoppingBag, Star, Zap } from 'lucide-react';
import { Product } from '../../types';
import { VibeButton } from '../ui/VibeButton';

interface ProductCardProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    onProductClick: (product: Product) => void;
    className?: string;
}

const ROTATION_RANGE = 25;
const HALF_ROTATION_RANGE = ROTATION_RANGE / 2;

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
    product,
    onAddToCart,
    onProductClick,
    className
}) => {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const xSpring = useSpring(x, { stiffness: 300, damping: 30 });
    const ySpring = useSpring(y, { stiffness: 300, damping: 30 });

    const transform = useMotionTemplate`rotateX(${xSpring}deg) rotateY(${ySpring}deg)`;

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;

        const mouseX = (e.clientX - rect.left) * ROTATION_RANGE / width - HALF_ROTATION_RANGE;
        const mouseY = (e.clientY - rect.top) * ROTATION_RANGE / height - HALF_ROTATION_RANGE;

        x.set(-mouseY);
        y.set(mouseX);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    const price = product.discountPrice || product.price;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => onProductClick(product)}
            style={{
                transformStyle: "preserve-3d",
                transform
            }}
            className={`relative group h-full w-full cursor-pointer bg-[#0F0F0F] rounded-xl border border-white/5 hover:border-[#E2FF3B]/30 transition-colors duration-300 overflow-hidden ${className}`}
        >
            {/* Hover Glow Effect */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-br from-[#E2FF3B]/5 via-transparent to-transparent z-0" />

            {/* Content Container */}
            <div className="relative z-10 p-4 h-full flex flex-col" style={{ transform: "translateZ(20px)" }}>

                {/* Badges */}
                <div className="flex justify-between items-start mb-4">
                    {product.stock < 5 && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-500 text-[10px] font-bold uppercase tracking-wider rounded border border-red-500/20 flex items-center gap-1 backdrop-blur-sm">
                            <Zap size={10} fill="currentColor" /> Last {product.stock}
                        </span>
                    )}
                    {product.discountPrice && (
                        <span className="ml-auto px-2 py-1 bg-[#E2FF3B]/20 text-[#E2FF3B] text-[10px] font-bold uppercase tracking-wider rounded border border-[#E2FF3B]/20 backdrop-blur-sm">
                            Sale
                        </span>
                    )}
                </div>

                {/* Image Area */}
                <div className="flex-1 flex items-center justify-center relative min-h-[180px] mb-4 group-hover:scale-110 transition-transform duration-500 ease-out">
                    <img
                        src={product.images[0] || '/placeholder-moto.png'}
                        alt={product.name}
                        className="w-full h-full object-contain max-h-[200px] drop-shadow-2xl"
                        style={{ transform: "translateZ(50px)" }}
                    />
                </div>

                {/* Product Info */}
                <div className="mt-auto space-y-3" style={{ transform: "translateZ(30px)" }}>
                    <div>
                        <div className="flex items-baseline justify-between mb-1">
                            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">{product.brand}</span>
                            <div className="flex items-center gap-1 text-[#E2FF3B]">
                                <Star size={12} fill="currentColor" />
                                <span className="text-xs font-bold">{product.rating}</span>
                            </div>
                        </div>
                        <h3 className="text-lg font-bold text-white leading-tight group-hover:text-[#E2FF3B] transition-colors line-clamp-2">
                            {product.name}
                        </h3>
                    </div>

                    {/* Tech Specs (Revealed/Highlighted on Hover) */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-gray-400 border-t border-white/5 pt-3 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div>MAT: Carbon</div>
                        <div>WGT: 1.2kg</div>
                    </div>

                    {/* Price & Action */}
                    <div className="flex items-center justify-between pt-2">
                        <div className="flex flex-col">
                            {product.discountPrice && (
                                <span className="text-xs text-gray-600 line-through font-mono">
                                    ${product.price.toLocaleString()}
                                </span>
                            )}
                            <span className="text-xl font-bold text-white font-mono group-hover:text-[#E2FF3B] group-hover:drop-shadow-[0_0_10px_rgba(226,255,59,0.5)] transition-all">
                                ${price.toLocaleString()}
                            </span>
                        </div>

                        <div className="opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                            <VibeButton
                                variant="primary"
                                size="sm"
                                icon={ShoppingBag}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToCart(product);
                                }}
                                className="!h-8 !px-3"
                            >
                                Add
                            </VibeButton>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
});
