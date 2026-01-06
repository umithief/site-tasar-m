import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Shield, Info, ArrowRight, ShoppingBag } from 'lucide-react';
import { Product } from '../../types';
import { Button } from '../ui/Button';

interface QuickViewDrawerProps {
    product: Product | null;
    isOpen: boolean;
    onClose: () => void;
    onAddToCart: (product: Product) => void;
}

export const QuickViewDrawer: React.FC<QuickViewDrawerProps> = ({
    product,
    isOpen,
    onClose,
    onAddToCart
}) => {
    if (!product) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 bottom-0 w-full md:w-[500px] lg:w-[600px] bg-[#09090b] border-l border-white/10 z-50 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5">
                            <span className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Hızlı Bakış</span>
                            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-zinc-400 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content Scrollable */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {/* Image Slider Placeholder - Just one image for now but sleek */}
                            <div className="relative aspect-square bg-[#0c0c0e] flex items-center justify-center p-8 group">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                                />
                                {product.isDealOfTheDay && (
                                    <div className="absolute top-4 left-4 bg-gradient-to-r from-[#E2FF3B] to-green-500 text-black font-bold uppercase px-3 py-1 rounded-full shadow-lg shadow-[#E2FF3B]/20">
                                        Günün Fırsatı
                                    </div>
                                )}
                            </div>

                            <div className="p-8 space-y-8">
                                {/* Header Info */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <h2 className="text-2xl font-bold uppercase tracking-tight text-white leading-none">
                                            {product.name}
                                        </h2>
                                        <span className="text-xl font-mono font-bold text-[#E2FF3B]">
                                            ₺{product.price.toLocaleString('tr-TR')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-zinc-500 font-medium uppercase tracking-wider">{product.brand}</p>
                                </div>

                                {/* Smart Fit Badge */}
                                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                                    <div className="bg-green-500/20 p-2 rounded-full">
                                        <Check className="w-4 h-4 text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-green-500 uppercase tracking-wide">Smart Fit Onaylı</h4>
                                        <p className="text-xs text-green-400/70 mt-1">Bu parça garajındaki motosikletlerin ile tam uyumludur.</p>
                                    </div>
                                </div>

                                {/* Description */}
                                <p className="text-sm text-zinc-400 leading-relaxed">
                                    {product.description}
                                </p>

                                {/* Specs Grid */}
                                <div>
                                    <h3 className="text-xs font-bold uppercase text-white mb-4 flex items-center gap-2">
                                        <Info className="w-3 h-3" /> Teknik Özellikler
                                    </h3>
                                    <div className="grid grid-cols-2 gap-3">
                                        {product.features.slice(0, 4).map((feature, idx) => (
                                            <div key={idx} className="bg-zinc-900/50 p-3 rounded-lg border border-white/5">
                                                <span className="text-xs text-zinc-300 font-medium">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-white/5 bg-[#09090b]">
                            <Button
                                onClick={() => {
                                    onAddToCart(product);
                                    onClose();
                                }}
                                className="w-full bg-[#E2FF3B] hover:bg-[#cbe62b] text-black font-bold uppercase tracking-widest py-4 h-auto rounded-xl flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,255,59,0.3)] hover:shadow-[0_0_30px_rgba(226,255,59,0.5)] transition-all"
                            >
                                <ShoppingBag className="w-5 h-5" />
                                Sepete Ekle
                            </Button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
