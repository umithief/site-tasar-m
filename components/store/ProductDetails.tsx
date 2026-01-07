import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, ArrowLeft, Heart, Share2, Shield, Wind, Thermometer, Droplets, Check } from 'lucide-react';
import { Product, ViewState } from '../../types';
import { VibeButton } from '../ui/VibeButton';
import { ProductGallery } from './ProductGallery';
import { ProductSpecs } from './ProductSpecs';

interface ProductDetailsProps {
    product: Product;
    onAddToCart: (product: Product) => void;
    onNavigate: (view: ViewState) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({
    product,
    onAddToCart,
    onNavigate
}) => {
    const [selectedSize, setSelectedSize] = useState('M');
    const [selectedColor, setSelectedColor] = useState('Black');

    const sizes = ['S', 'M', 'L', 'XL'];
    const colors = [
        { name: 'Black', hex: '#000000' },
        { name: 'Carbon', hex: '#1A1A1A' },
        { name: 'Neon', hex: '#E2FF3B' }
    ];

    if (!product) return null;

    const price = product.discountPrice || product.price;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#E2FF3B] selection:text-black">

            {/* Sticky Header */}
            <header className="sticky top-0 z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <button
                    onClick={() => onNavigate('shop')}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span className="text-xs font-bold uppercase tracking-widest hidden md:inline">Back to Shop</span>
                </button>
                <div className="font-bold font-mono text-sm tracking-widest opacity-50">PROD_ID: {product._id.slice(-6).toUpperCase()}</div>
            </header>

            <div className="container mx-auto px-4 py-8 lg:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* Left Column: Gallery (Sticky) */}
                    <div className="lg:col-span-7">
                        <ProductGallery
                            images={product.images.length ? product.images : [product.image]}
                            productName={product.name}
                        />
                    </div>

                    {/* Right Column: Content */}
                    <div className="lg:col-span-5 flex flex-col pt-4">

                        {/* Brand & Title */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[#E2FF3B] text-xs font-black uppercase tracking-[0.2em]">{product.brand}</span>
                                <div className="flex gap-2">
                                    <button className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                                        <Heart size={18} />
                                    </button>
                                    <button className="p-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
                                        <Share2 size={18} />
                                    </button>
                                </div>
                            </div>

                            <h1 className="text-4xl lg:text-5xl font-black italic uppercase leading-[0.9] tracking-tighter text-white mb-6">
                                {product.name}
                            </h1>

                            <div className="flex items-baseline gap-4 mb-8 group cursor-default w-fit">
                                <span className="text-4xl font-mono font-bold text-[#E2FF3B] transition-all group-hover:drop-shadow-[0_0_30px_#E2FF3B]">
                                    ${price.toLocaleString()}
                                </span>
                                {product.discountPrice && (
                                    <span className="text-lg text-gray-500 line-through font-mono">
                                        ${product.price.toLocaleString()}
                                    </span>
                                )}
                            </div>
                        </motion.div>

                        <div className="w-full h-px bg-white/10 my-6" />

                        {/* Configurator */}
                        <div className="space-y-6">

                            {/* Color */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Color Configuration</label>
                                <div className="flex gap-3">
                                    {colors.map(color => (
                                        <button
                                            key={color.name}
                                            onClick={() => setSelectedColor(color.name)}
                                            className={`h-12 px-6 rounded-full border flex items-center gap-3 transition-all ${selectedColor === color.name
                                                    ? 'border-[#E2FF3B] bg-[#E2FF3B]/10 text-white shadow-[0_0_15px_rgba(226,255,59,0.1)]'
                                                    : 'border-white/10 bg-transparent text-gray-400 hover:border-white/30'
                                                }`}
                                        >
                                            <div className="w-4 h-4 rounded-full border border-white/20" style={{ backgroundColor: color.hex }} />
                                            <span className="text-xs font-bold uppercase">{color.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Size */}
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Size Selection</label>
                                <div className="flex gap-2">
                                    {sizes.map(size => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`w-12 h-12 rounded-xl border flex items-center justify-center font-bold font-mono transition-all ${selectedSize === size
                                                    ? 'bg-white text-black border-white'
                                                    : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30 hover:text-white'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Actions */}
                        <div className="mt-8 mb-12">
                            <VibeButton
                                variant="primary"
                                size="lg"
                                fullWidth
                                icon={Zap}
                                onClick={() => onAddToCart(product)}
                                className="!h-16 !text-lg !rounded-2xl"
                            >
                                Initiate Acquisition
                            </VibeButton>
                            <p className="text-center text-[10px] text-gray-500 uppercase tracking-widest mt-3">
                                Secure Transaction Encrypted • Global Shipping Available
                            </p>
                        </div>

                        {/* Description Reveal */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={{
                                visible: { transition: { staggerChildren: 0.1 } }
                            }}
                            className="space-y-4 text-gray-400 leading-relaxed text-sm mb-8"
                        >
                            <h3 className="text-white text-sm font-bold uppercase tracking-widest">Product Intel</h3>
                            <p>{product.description}</p>
                            <ul className="space-y-2 mt-4">
                                {product.features.map((feature, i) => (
                                    <li key={i} className="flex items-start gap-3">
                                        <Check size={14} className="text-[#E2FF3B] mt-1 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        {/* Specs Grid */}
                        <ProductSpecs />

                    </div>
                </div>
            </div>

            {/* Mobile Buy Bar (Visible only on small screens) */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-[#050505]/90 backdrop-blur-xl border-t border-white/10 z-50">
                <VibeButton variant="primary" fullWidth onClick={() => onAddToCart(product)}>
                    Add to Cart • ${price.toLocaleString()}
                </VibeButton>
            </div>

        </div>
    );
};
