import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartItem } from './CartItem';
import { CartSummary } from './CartSummary';
import { CartItem as CartItemType } from '../../../types';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { VibeButton } from '../../ui/VibeButton';

interface CartPageProps {
    items: CartItemType[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemoveItem: (id: string) => void;
    onCheckout: () => void;
    onContinueShopping: () => void;
}

export const CartPage: React.FC<CartPageProps> = ({
    items,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    onContinueShopping
}) => {
    const subtotal = items.reduce((acc, item) => acc + ((item.discountPrice || item.price) * item.quantity), 0);

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#E2FF3B] selection:text-black">

            {/* Background Grid Pattern */}
            <div className="fixed inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

            <div className="container mx-auto px-4 pt-8 pb-32 max-w-7xl relative z-10">

                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <button
                        onClick={onContinueShopping}
                        className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span className="font-bold uppercase tracking-wider text-sm">Mağazaya Dön</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#E2FF3B]/10 rounded-xl text-[#E2FF3B]">
                            <ShoppingCart size={24} />
                        </div>
                        <h1 className="text-3xl font-black italic uppercase tracking-tighter">Sepetim</h1>
                    </div>
                </div>

                {items.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center justify-center py-20 bg-[#111] rounded-3xl border border-white/5 border-dashed"
                    >
                        <ShoppingCart size={64} className="text-gray-700 mb-6" />
                        <h2 className="text-2xl font-bold uppercase tracking-wider text-white mb-2">Sepetiniz Boş</h2>
                        <p className="text-gray-500 mb-8 font-mono">Henüz sepetinize ekipman eklemediniz.</p>
                        <VibeButton variant="secondary" onClick={onContinueShopping}>Ekipman Aramasını Başlat</VibeButton>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                        {/* Left Column: Items */}
                        <div className="lg:col-span-8 space-y-4">
                            <AnimatePresence mode="popLayout">
                                {items.map(item => (
                                    <CartItem
                                        key={item._id}
                                        item={item}
                                        onUpdateQuantity={onUpdateQuantity}
                                        onRemove={onRemoveItem}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* Right Column: Summary */}
                        <div className="lg:col-span-4 hidden lg:block">
                            <CartSummary
                                subtotal={subtotal}
                                onCheckout={onCheckout}
                            />
                        </div>

                    </div>
                )}
            </div>

            {/* Mobile Bottom Sticky Summary */}
            {items.length > 0 && (
                <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[#111]/90 backdrop-blur-xl border-t border-white/10 p-4 pb-safe-bottom z-50">
                    <div className="flex justify-between items-center mb-4">
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-400 uppercase font-bold tracking-wider">Tahmini Toplam</span>
                            <span className="text-2xl font-mono font-bold text-[#E2FF3B]">${subtotal.toLocaleString()}</span>
                        </div>
                        <div className="h-8 w-[1px] bg-white/10" />
                        <span className="text-xs text-gray-500 font-mono">{items.length} Parça</span>
                    </div>
                    <VibeButton variant="primary" fullWidth onClick={onCheckout}>Teslimat Adımına Geç</VibeButton>
                </div>
            )}

        </div>
    );
};
