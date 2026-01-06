import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CreditCard, MapPin, Check, Truck, ChevronDown, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { CartItem } from '../../types';
import { orderService } from '../../services/orderService';

interface CheckoutPageProps {
    items: CartItem[];
    total: number;
    onBack: () => void;
    onSuccess: (orderId: string) => void;
    onToast: (type: 'success' | 'error', msg: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ items, total, onBack, onSuccess, onToast }) => {
    const { user } = useAuthStore();
    const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
    const [loading, setLoading] = useState(false);

    // Shipping State
    const [useSavedAddress, setUseSavedAddress] = useState(true);
    const [address, setAddress] = useState({
        street: user?.address || '',
        city: user?.location || '',
        zip: '',
        country: 'Turkey'
    });

    // Payment State
    const [cardNumber, setCardNumber] = useState('');
    const [cardName, setCardName] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardBrand, setCardBrand] = useState<'visa' | 'mastercard' | 'unknown'>('unknown');

    // Detect Card Brand
    useEffect(() => {
        if (cardNumber.startsWith('4')) setCardBrand('visa');
        else if (cardNumber.startsWith('5')) setCardBrand('mastercard');
        else setCardBrand('unknown');
    }, [cardNumber]);

    // ... inside CheckoutPage component
    const [isSuccess, setIsSuccess] = useState(false);

    const handlePlaceOrder = async () => {
        setLoading(true);
        try {
            const order = await orderService.createOrder({
                user: user,
                orderItems: items.map(item => ({ ...item, product: item._id })),
                shippingAddress: {
                    address: address.street,
                    city: address.city,
                    postalCode: address.zip,
                    country: address.country
                },
                paymentMethod: 'Credit Card',
                itemsPrice: total,
                taxPrice: 0,
                shippingPrice: 0,
                totalPrice: total
            });

            // Simulate processing time
            setTimeout(() => {
                setLoading(false);
                setIsSuccess(true);

                // Navigate after animation
                setTimeout(() => {
                    onSuccess(order._id);
                }, 3000);
            }, 1500);

        } catch (error) {
            console.error(error);
            onToast('error', 'Sipariş oluşturulurken bir hata oluştu');
            setLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <motion.div
                className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
            >
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', delay: 0.2 }}
                    className="mb-8 relative"
                >
                    <div className="absolute inset-0 bg-orange-500 blur-3xl opacity-20" />
                    <Check className="w-24 h-24 text-orange-500 relative z-10" />
                </motion.div>

                <motion.h2
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-3xl font-bold italic uppercase tracking-tighter mb-2"
                >
                    ORDER CONFIRMED
                </motion.h2>

                <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-zinc-500 font-mono text-sm"
                >
                    Gear is being prepped. Ride safe.
                </motion.p>

                {/* Rider Animation Simulation */}
                <motion.div
                    initial={{ x: '-100vw' }}
                    animate={{ x: '100vw' }}
                    transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                    className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent"
                />
            </motion.div>
        );
    }

    // Card Preview Component
    const CardPreview = () => (
        <div className={`w-full aspect-[1.586] rounded-2xl p-6 mb-8 relative overflow-hidden transition-all duration-500
        ${cardBrand === 'visa' ? 'bg-gradient-to-br from-[#1a1f71] to-[#00aeef]' :
                cardBrand === 'mastercard' ? 'bg-gradient-to-br from-[#eb001b] to-[#f79e1b]' :
                    'bg-gradient-to-br from-zinc-800 to-zinc-900 border border-white/10'}`}
        >
            {/* Chip */}
            <div className="w-12 h-9 rounded bg-gradient-to-br from-yellow-200 to-yellow-500 mb-8 opacity-80" />

            {/* Specific Brand Logo */}
            <div className="absolute top-6 right-6 text-white font-bold italic text-xl">
                {cardBrand === 'visa' ? 'VISA' : cardBrand === 'mastercard' ? 'Mastercard' : 'MOTOVIBE'}
            </div>

            <div className="space-y-6">
                <div className="text-white text-xl font-mono tracking-widest shadow-black drop-shadow-md h-8">
                    {cardNumber || '•••• •••• •••• ••••'}
                </div>
                <div className="flex justify-between text-white/90">
                    <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-wider opacity-70">Card Holder</span>
                        <span className="font-medium tracking-wide uppercase text-sm truncate max-w-[150px]">{cardName || 'YOUR NAME'}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[8px] uppercase tracking-wider opacity-70">Expires</span>
                        <span className="font-medium tracking-wide font-mono">{expiry || 'MM/YY'}</span>
                    </div>
                </div>
            </div>

            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
        </div>
    );

    return (
        <div className="min-h-screen bg-black text-white pb-32">
            {/* Header */}
            {/* ... rest of the component */}
            <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 px-4 h-16 flex items-center justify-between">
                <button onClick={onBack} className="p-2 rounded-full bg-zinc-900 text-white">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="font-bold text-lg uppercase tracking-wider">
                    {step === 'shipping' ? 'Teslimat' : 'Ödeme'}
                </h1>
                <div className="w-9" />
            </div>

            <div className="p-6">
                <AnimatePresence mode="wait">
                    {step === 'shipping' ? (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="shipping"
                        >
                            {/* Use Saved Address Toggle */}
                            <div
                                onClick={() => setUseSavedAddress(!useSavedAddress)}
                                className={`p-4 rounded-xl border flex items-center justify-between mb-8 cursor-pointer transition-all ${useSavedAddress ? 'bg-orange-500/10 border-orange-500' : 'bg-zinc-900 border-zinc-800'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <MapPin className={`w-5 h-5 ${useSavedAddress ? 'text-orange-500' : 'text-zinc-500'}`} />
                                    <span className={useSavedAddress ? 'text-orange-500 font-bold' : 'text-zinc-400'}>Kayıtlı Adresimi Kullan</span>
                                </div>
                                {useSavedAddress && <Check className="w-5 h-5 text-orange-500" />}
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Adres Başlığı / Sokak</label>
                                    <input
                                        type="text"
                                        value={address.street}
                                        onChange={e => setAddress({ ...address, street: e.target.value })}
                                        disabled={useSavedAddress}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-orange-500 outline-none transition-colors disabled:opacity-50"
                                        placeholder="Örn: Bağdat Cad. No:12"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Şehir</label>
                                        <input
                                            type="text"
                                            value={address.city}
                                            onChange={e => setAddress({ ...address, city: e.target.value })}
                                            disabled={useSavedAddress}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-orange-500 outline-none transition-colors disabled:opacity-50"
                                            placeholder="İstanbul"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Posta Kodu</label>
                                        <input
                                            type="text"
                                            value={address.zip}
                                            onChange={e => setAddress({ ...address, zip: e.target.value })}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-orange-500 outline-none transition-colors"
                                            placeholder="34000"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            key="payment"
                        >
                            <CardPreview />

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Kart Numarası</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            maxLength={19}
                                            value={cardNumber}
                                            onChange={e => {
                                                const v = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
                                                setCardNumber(v);
                                            }}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 pl-12 text-white focus:border-orange-500 outline-none transition-colors font-mono"
                                            placeholder="0000 0000 0000 0000"
                                        />
                                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Kart Sahibi</label>
                                    <input
                                        type="text"
                                        value={cardName}
                                        onChange={e => setCardName(e.target.value.toUpperCase())}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-orange-500 outline-none transition-colors"
                                        placeholder="AD SOYAD"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">SKT</label>
                                        <input
                                            type="text"
                                            maxLength={5}
                                            value={expiry}
                                            onChange={e => {
                                                let v = e.target.value.replace(/\D/g, '');
                                                if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2, 4);
                                                setExpiry(v);
                                            }}
                                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:border-orange-500 outline-none transition-colors font-mono"
                                            placeholder="AA/YY"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 uppercase font-bold tracking-wider">CVC</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                maxLength={3}
                                                value={cvc}
                                                onChange={e => setCvc(e.target.value.replace(/\D/g, ''))}
                                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 pl-12 text-white focus:border-orange-500 outline-none transition-colors font-mono"
                                                placeholder="123"
                                            />
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 w-4 h-4" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Fixed Bottom Summary */}
            <div className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-white/5 p-6 pb-safe-bottom z-50">
                <div className="flex justify-between items-center mb-4 text-sm">
                    <span className="text-zinc-400">Ara Toplam</span>
                    <span className="text-white font-mono">₺{total.toLocaleString('tr-TR')}</span>
                </div>
                <div className="flex justify-between items-center mb-6 text-sm">
                    <span className="text-zinc-400">Kargo</span>
                    <span className="text-green-500 font-bold uppercase text-xs">Ücretsiz</span>
                </div>

                {step === 'shipping' ? (
                    <button
                        onClick={() => setStep('payment')}
                        className="w-full bg-white text-black h-14 rounded-xl font-bold uppercase tracking-widest active:scale-95 transition-transform"
                    >
                        Ödemeye Geç
                    </button>
                ) : (
                    <button
                        onClick={handlePlaceOrder}
                        disabled={loading}
                        className="w-full bg-[#E2FF3B] text-black h-14 rounded-xl font-bold uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(226,255,59,0.4)] hover:shadow-[0_0_30px_rgba(226,255,59,0.6)] hover:bg-white"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>₺{total.toLocaleString('tr-TR')} Öde</span>
                                <Check className="w-5 h-5" />
                            </>
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};
