import React, { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';
import { ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import { VibeButton } from '../../ui/VibeButton';

interface CartSummaryProps {
    subtotal: number;
    shippingThreshold?: number; // Amount needed for free shipping
    onCheckout: () => void;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
    subtotal,
    shippingThreshold = 15000,
    onCheckout
}) => {
    const shipping = subtotal > shippingThreshold ? 0 : 500;
    const progress = Math.min(100, (subtotal / shippingThreshold) * 100);
    const remaining = Math.max(0, shippingThreshold - subtotal);
    const total = subtotal + shipping;

    // Number ticker animation logic
    const AnimatedNumber = ({ value }: { value: number }) => {
        const spring = useSpring(value, { mass: 0.8, stiffness: 75, damping: 15 });
        const display = useTransform(spring, (current) => Math.round(current).toLocaleString());

        useEffect(() => {
            spring.set(value);
        }, [value, spring]);

        return <motion.span>{display}</motion.span>;
    };

    return (
        <div className="bg-[#111] rounded-3xl border border-white/5 p-6 lg:p-8 space-y-8 sticky top-24 shadow-2xl shadow-black/50">
            <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Sipariş Özeti</h2>

            {/* Free Shipping Progress */}
            <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                    <span className="text-gray-400">Kargo Durumu</span>
                    <span className={remaining === 0 ? "text-[#E2FF3B]" : "text-gray-400"}>
                        {remaining === 0 ? "Ücretsiz Kargo Aktif" : `$${remaining.toLocaleString()} daha ekle, Kargo Bedava`}
                    </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden relative">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#E2FF3B]/50 to-[#E2FF3B]"
                    />
                </div>
                {remaining === 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2 text-[#E2FF3B] text-xs font-bold justify-center bg-[#E2FF3B]/5 p-2 rounded-lg border border-[#E2FF3B]/10"
                    >
                        <Truck size={14} />
                        <span>Ücretsiz Kargo Kilidi Açıldı</span>
                    </motion.div>
                )}
            </div>

            {/* Totals */}
            <div className="space-y-4 py-6 border-y border-white/5">
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Ara Toplam</span>
                    <span className="font-mono text-white">$<AnimatedNumber value={subtotal} /></span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Kargo Ücreti</span>
                    <span className="font-mono uppercase font-bold text-[#E2FF3B]">
                        {shipping === 0 ? 'Ücretsiz' : `$${shipping}`}
                    </span>
                </div>
                <div className="flex justify-between items-end pt-2">
                    <span className="text-sm font-bold text-white uppercase tracking-widest">Genel Toplam</span>
                    <span className="text-3xl font-mono font-bold text-[#E2FF3B] drop-shadow-[0_0_15px_rgba(226,255,59,0.3)]">
                        $<AnimatedNumber value={total} />
                    </span>
                </div>
            </div>

            {/* Actions */}
            <VibeButton
                variant="primary"
                fullWidth
                size="lg"
                onClick={onCheckout}
                icon={ArrowRight}
                className="!h-16 !text-lg !rounded-2xl"
            >
                Teslimat Adımına Geç
            </VibeButton>

            {/* Trust Badges */}
            <div className="flex justify-center gap-6 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                {/* Placeholder SVGs for payment methods could go here */}
                <div className="h-6 w-10 bg-white/20 rounded-md" />
                <div className="h-6 w-10 bg-white/20 rounded-md" />
                <div className="h-6 w-10 bg-white/20 rounded-md" />
            </div>

            <div className="flex items-center gap-2 justify-center text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                <ShieldCheck size={12} />
                Güvenli Ödeme Altyapısı
            </div>
        </div>
    );
};
