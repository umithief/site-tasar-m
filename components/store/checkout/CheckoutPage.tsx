import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Truck, MapPin } from 'lucide-react';
import { CartItem } from './CartItem';
import { OrderSummary } from './OrderSummary';
import { PaymentForm } from './PaymentForm';
import { CartItem as CartItemType, ViewState } from '../../../types';

interface CheckoutPageProps {
    items: CartItemType[];
    total: number;
    onBack: () => void;
    onSuccess: (orderId: string) => void;
    onToast: (type: 'success' | 'error', msg: string) => void;
}

type Step = 'loadout' | 'deployment' | 'ignition';

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ items, total, onBack, onSuccess, onToast }) => {
    const [step, setStep] = useState<Step>('loadout');
    const [loading, setLoading] = useState(false);

    // Form States
    const [address, setAddress] = useState({ street: '', city: '', zip: '', country: 'Turkey' });
    const [cardData, setCardData] = useState({ number: '', holder: '', expiry: '', cvc: '' });

    // Mock functions for cart updates (In a real app, these would update global state)
    const handleUpdateQuantity = (id: string, delta: number) => { console.log('Update', id, delta); };
    const handleRemoveItem = (id: string) => { console.log('Remove', id); };

    const steps: { id: Step; label: string }[] = [
        { id: 'loadout', label: 'Ekipman' },
        { id: 'deployment', label: 'Teslimat' },
        { id: 'ignition', label: 'Ödeme' }
    ];

    const handleNext = () => {
        if (step === 'loadout') setStep('deployment');
        else if (step === 'deployment') setStep('ignition');
        else if (step === 'ignition') handlePlaceOrder();
    };

    const handleBackStep = () => {
        if (step === 'ignition') setStep('deployment');
        else if (step === 'deployment') setStep('loadout');
        else onBack();
    };

    const handlePlaceOrder = () => {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            onSuccess(`ORD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`);
        }, 2000);
    };

    return (
        <div className="min-h-screen bg-[#080808] text-white pb-32 font-sans selection:bg-[#E2FF3B] selection:text-black">

            {/* Top Bar / Stepper */}
            <div className="sticky top-0 z-50 bg-[#080808]/80 backdrop-blur-xl border-b border-white/5">
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <button onClick={onBack} className="p-2 rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>

                    {/* Stepper Steps */}
                    <div className="flex items-center gap-2 md:gap-8">
                        {steps.map((s, idx) => {
                            const isActive = s.id === step;
                            const isPast = steps.findIndex(st => st.id === step) > idx;

                            return (
                                <div key={s.id} className="flex items-center gap-3">
                                    <div className={`flex items-center gap-2 transition-colors ${isActive || isPast ? 'text-white' : 'text-gray-600'}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${isActive ? 'bg-[#E2FF3B] border-[#E2FF3B] text-black shadow-[0_0_15px_rgba(226,255,59,0.4)]' :
                                            isPast ? 'bg-white border-white text-black' :
                                                'bg-transparent border-gray-700 text-gray-700'
                                            }`}>
                                            {isPast ? <Check size={14} /> : idx + 1}
                                        </div>
                                        <span className={`text-xs font-bold uppercase tracking-wider hidden md:block`}>{s.label}</span>
                                    </div>
                                    {idx < steps.length - 1 && (
                                        <div className={`w-8 md:w-16 h-px ${isPast ? 'bg-[#E2FF3B]' : 'bg-gray-800'}`} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="w-10" /> {/* Spacer */}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT COLUMN: Main Content */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">

                            {/* STEP 1: LOADOUT (Cart) */}
                            {step === 'loadout' && (
                                <motion.div
                                    key="loadout"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-4"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-2xl font-black italic uppercase text-white">Ekipman Listesi</h2>
                                        <span className="text-gray-500 font-mono text-xs">{items.length} ÜRÜN TESPİT EDİLDİ</span>
                                    </div>

                                    {items.length === 0 ? (
                                        <div className="text-center py-20 bg-[#111] rounded-3xl border border-dashed border-white/10">
                                            <p className="text-gray-500 font-mono">SEPET BOŞ</p>
                                        </div>
                                    ) : (
                                        items.map(item => (
                                            <CartItem
                                                key={item._id}
                                                item={item}
                                                onUpdateQuantity={handleUpdateQuantity}
                                                onRemove={handleRemoveItem}
                                            />
                                        ))
                                    )}
                                </motion.div>
                            )}

                            {/* STEP 2: DEPLOYMENT (Shipping) */}
                            {step === 'deployment' && (
                                <motion.div
                                    key="deployment"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-black italic uppercase text-white mb-6">Teslimat Koordinatları</h2>

                                    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 lg:p-8 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Sokak Adresi</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={address.street}
                                                    onChange={e => setAddress({ ...address, street: e.target.value })}
                                                    className="w-full bg-[#080808] border border-white/10 rounded-xl p-4 pl-12 text-white focus:border-[#E2FF3B] outline-none transition-all"
                                                    placeholder="Sector 7G, Apt 12"
                                                />
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Şehir</label>
                                                <input
                                                    type="text"
                                                    value={address.city}
                                                    onChange={e => setAddress({ ...address, city: e.target.value })}
                                                    className="w-full bg-[#080808] border border-white/10 rounded-xl p-4 text-white focus:border-[#E2FF3B] outline-none transition-all"
                                                    placeholder="İstanbul"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2">Posta Kodu</label>
                                                <input
                                                    type="text"
                                                    value={address.zip}
                                                    onChange={e => setAddress({ ...address, zip: e.target.value })}
                                                    className="w-full bg-[#080808] border border-white/10 rounded-xl p-4 text-white focus:border-[#E2FF3B] outline-none transition-all"
                                                    placeholder="34000"
                                                />
                                            </div>
                                        </div>

                                        <div className="p-4 rounded-xl bg-[#E2FF3B]/5 border border-[#E2FF3B]/20 flex items-center gap-3">
                                            <div className="p-2 rounded-full bg-[#E2FF3B]/20 text-[#E2FF3B]">
                                                <Truck size={20} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-white text-sm">Ekspres Drone Kargo</h4>
                                                <p className="text-xs text-gray-400">Tahmini Varış: <span className="text-[#E2FF3B]">Yarın, 14:00</span></p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* STEP 3: IGNITION (Payment) */}
                            {step === 'ignition' && (
                                <motion.div
                                    key="ignition"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    className="space-y-6"
                                >
                                    <h2 className="text-2xl font-black italic uppercase text-white mb-6">Ödemeyi Onayla</h2>

                                    <div className="bg-[#111] border border-white/5 rounded-3xl p-6 lg:p-8">
                                        <PaymentForm
                                            cardData={cardData}
                                            onChange={(field, value) => setCardData(prev => ({ ...prev, [field]: value }))}
                                        />
                                    </div>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>

                    {/* RIGHT COLUMN: Summary (Sticky) */}
                    <div className="lg:col-span-4">
                        <OrderSummary
                            subtotal={total}
                            shipping={0}
                            tax={total * 0.18}
                            total={total}
                            loading={loading}
                            step={step}
                            onNext={handleNext}
                            onBack={handleBackStep}
                        />
                    </div>

                </div>
            </div>

        </div>
    );
};
