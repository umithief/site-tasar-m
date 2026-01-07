import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Lock } from 'lucide-react';

interface PaymentFormProps {
    cardData: {
        number: string;
        holder: string;
        expiry: string;
        cvc: string;
    };
    onChange: (field: string, value: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ cardData, onChange }) => {
    const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'unknown'>('unknown');

    useEffect(() => {
        if (cardData.number.startsWith('4')) setCardBrand('visa');
        else if (cardData.number.startsWith('5')) setCardBrand('mastercard');
        else setCardBrand('unknown');
    }, [cardData.number]);

    return (
        <div className="space-y-8">
            {/* 3D Virtual Card Preview */}
            <div className="perspective-1000 w-full max-w-md mx-auto">
                <motion.div
                    initial={{ rotateX: 20, rotateY: 10 }}
                    animate={{ rotateX: 0, rotateY: 0 }}
                    whileHover={{ rotateX: 5, rotateY: 5 }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                    className={`relative w-full aspect-[1.586] rounded-2xl p-6 overflow-hidden shadow-2xl transition-all duration-500
                        ${cardBrand === 'visa' ? 'bg-gradient-to-br from-[#1a1f71] to-[#00aeef]' :
                            cardBrand === 'mastercard' ? 'bg-gradient-to-br from-[#eb001b] to-[#f79e1b]' :
                                'bg-gradient-to-br from-[#111] to-[#222] border border-white/10'}`}
                >
                    {/* Chip */}
                    <div className="w-12 h-9 rounded bg-gradient-to-br from-yellow-200 to-yellow-500 mb-8 opacity-90 shadow-sm" />

                    {/* Brand */}
                    <div className="absolute top-6 right-6 text-white font-black italic text-2xl tracking-tighter opacity-80">
                        {cardBrand === 'visa' ? 'VISA' : cardBrand === 'mastercard' ? 'Mastercard' : 'MOTOVIBE'}
                    </div>

                    {/* Number */}
                    <div className="mb-6">
                        <div className="font-mono text-xl sm:text-2xl text-white tracking-widest drop-shadow-md">
                            {cardData.number || '•••• •••• •••• ••••'}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex justify-between items-end text-white/90">
                        <div>
                            <div className="text-[8px] uppercase tracking-widest opacity-60 mb-1">Card Holder</div>
                            <div className="font-bold uppercase tracking-wider text-sm sm:text-base">
                                {cardData.holder || 'YOUR NAME'}
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-[8px] uppercase tracking-widest opacity-60 mb-1">Expires</div>
                            <div className="font-mono font-bold">
                                {cardData.expiry || 'MM/YY'}
                            </div>
                        </div>
                    </div>

                    {/* Gloss */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none mix-blend-overlay" />
                </motion.div>
            </div>

            {/* Inputs */}
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Card Number</label>
                    <div className="relative">
                        <input
                            type="text"
                            maxLength={19}
                            value={cardData.number}
                            onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                onChange('number', v);
                            }}
                            placeholder="0000 0000 0000 0000"
                            className="w-full bg-[#111] border border-white/10 rounded-xl p-4 pl-12 text-white font-mono focus:border-[#E2FF3B] focus:ring-1 focus:ring-[#E2FF3B] outline-none transition-all"
                        />
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                    </div>
                </div>

                <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Card Holder</label>
                    <input
                        type="text"
                        value={cardData.holder}
                        onChange={(e) => onChange('holder', e.target.value.toUpperCase())}
                        placeholder="NAME ON CARD"
                        className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white font-bold focus:border-[#E2FF3B] focus:ring-1 focus:ring-[#E2FF3B] outline-none transition-all uppercase"
                    />
                </div>

                <div className="col-span-1 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Expiry</label>
                    <input
                        type="text"
                        maxLength={5}
                        value={cardData.expiry}
                        onChange={(e) => {
                            let v = e.target.value.replace(/\D/g, '');
                            if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                            onChange('expiry', v);
                        }}
                        placeholder="MM/YY"
                        className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white font-mono focus:border-[#E2FF3B] focus:ring-1 focus:ring-[#E2FF3B] outline-none transition-all"
                    />
                </div>

                <div className="col-span-1 space-y-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">CVC</label>
                    <div className="relative">
                        <input
                            type="text"
                            maxLength={3}
                            value={cardData.cvc}
                            onChange={(e) => onChange('cvc', e.target.value.replace(/\D/g, ''))}
                            placeholder="123"
                            className="w-full bg-[#111] border border-white/10 rounded-xl p-4 pl-12 text-white font-mono focus:border-[#E2FF3B] focus:ring-1 focus:ring-[#E2FF3B] outline-none transition-all"
                        />
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-gray-500 justify-center bg-white/5 p-3 rounded-lg border border-white/5">
                <Lock size={12} className="text-[#E2FF3B]" />
                Payments are securely processed with 256-bit encryption.
            </div>
        </div>
    );
};
