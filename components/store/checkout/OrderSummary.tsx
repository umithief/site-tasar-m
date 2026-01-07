import React from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck } from 'lucide-react';
import { VibeButton } from '../../ui/VibeButton';

interface OrderSummaryProps {
    subtotal: number;
    shipping: number;
    tax: number;
    total: number;
    loading: boolean;
    step: 'loadout' | 'deployment' | 'ignition';
    onNext: () => void;
    onBack: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
    subtotal,
    shipping,
    tax,
    total,
    loading,
    step,
    onNext,
    onBack
}) => {
    return (
        <div className="bg-[#111] rounded-3xl border border-white/5 p-6 space-y-6 sticky top-24">
            <h2 className="text-xl font-black italic text-white uppercase tracking-tighter">Order Manifest</h2>

            {/* Line Items */}
            <div className="space-y-3 pb-6 border-b border-white/5">
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Subtotal</span>
                    <span className="font-mono text-white">${subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Shipping</span>
                    <span className="font-mono text-[#E2FF3B] uppercase font-bold">{shipping === 0 ? 'Free' : `$${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-400">
                    <span>Estimated Tax</span>
                    <span className="font-mono text-white">${tax.toLocaleString()}</span>
                </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-end">
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Due</span>
                <motion.span
                    key={total}
                    initial={{ scale: 1.2, color: '#fff' }}
                    animate={{ scale: 1, color: '#E2FF3B' }}
                    className="text-3xl font-mono font-bold text-[#E2FF3B] drop-shadow-[0_0_15px_rgba(226,255,59,0.3)]"
                >
                    ${total.toLocaleString()}
                </motion.span>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
                <VibeButton
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={onNext}
                    isLoading={loading}
                    disabled={loading}
                    className="!h-14 !text-base !rounded-xl"
                >
                    {step === 'ignition' ? (
                        <>Confirm Order <ShieldCheck size={18} /></>
                    ) : (
                        step === 'loadout' ? "Proceed to Deployment" : "Proceed to Ignition"
                    )}
                </VibeButton>

                {step !== 'loadout' && (
                    <button
                        onClick={onBack}
                        className="w-full py-3 text-xs font-bold text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
                    >
                        Back to Previous Step
                    </button>
                )}
            </div>

            {/* Guarantee */}
            <div className="flex items-center gap-3 pt-4 justify-center opacity-50">
                <ShieldCheck size={14} className="text-gray-400" />
                <span className="text-[10px] text-gray-500 uppercase tracking-widest">MotoVibe Gear Guarantee</span>
            </div>
        </div>
    );
};
