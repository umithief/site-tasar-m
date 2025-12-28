
import React from 'react';
import { CartItem, User } from '../../types';
import { MobileBottomSheet } from './MobileBottomSheet';
import { Minus, Plus, Trash2, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageProvider';

interface CartBottomSheetProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartItem[];
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemoveItem: (id: string) => void;
    onCheckout: () => void;
    user: User | null;
}

export const CartBottomSheet: React.FC<CartBottomSheetProps> = ({
    isOpen,
    onClose,
    items,
    onUpdateQuantity,
    onRemoveItem,
    onCheckout,
    user
}) => {
    const { t } = useLanguage();

    const subTotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discountRate = user?.rank === 'Yol Kaptanı' ? 0.05 : 0;
    const discountAmount = subTotal * discountRate;
    const total = subTotal - discountAmount;

    return (
        <MobileBottomSheet
            isOpen={isOpen}
            onClose={onClose}
            title={t('cart.title')}
            height="h-auto max-h-[85vh]"
        >
            <div className="flex flex-col h-full">
                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-500 opacity-60">
                            <p className="text-sm">Sepetiniz boş.</p>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item._id} className="flex gap-4 p-3 bg-white/5 border border-white/5 rounded-2xl">
                                <div className="w-20 h-20 bg-zinc-900 rounded-xl overflow-hidden shrink-0">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-white text-sm font-bold line-clamp-2">{item.name}</h4>
                                        <button onClick={() => onRemoveItem(item._id)} className="text-zinc-500 hover:text-red-500 p-1">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center bg-black/50 rounded-lg h-8 border border-white/5">
                                            <button
                                                onClick={() => onUpdateQuantity(item._id, -1)}
                                                disabled={item.quantity <= 1}
                                                className="w-8 h-full flex items-center justify-center text-zinc-400 disabled:opacity-30"
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-white text-xs font-bold w-6 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => onUpdateQuantity(item._id, 1)}
                                                className="w-8 h-full flex items-center justify-center text-zinc-400"
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <span className="text-moto-accent font-mono font-bold">
                                            ₺{(item.price * item.quantity).toLocaleString('tr-TR')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sticky Checkout Footer */}
                {items.length > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-[#0a0a0a] border-t border-white/10 pb-safe-bottom">
                        <div className="flex justify-between items-end mb-4 px-2">
                            <span className="text-zinc-400 text-xs font-medium">{t('cart.total').toUpperCase()}</span>
                            <div className="flex flex-col items-end">
                                {discountAmount > 0 && (
                                    <span className="text-xs text-green-500 mb-0.5">- ₺{discountAmount.toLocaleString('tr-TR')} (Yol Kaptanı)</span>
                                )}
                                <span className="text-2xl font-bold text-white tracking-tight">
                                    ₺{total.toLocaleString('tr-TR')}
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={onCheckout}
                            className="w-full h-14 bg-moto-accent text-white rounded-xl font-bold text-base tracking-wide flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg shadow-moto-accent/20"
                        >
                            {t('cart.checkout')} <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </MobileBottomSheet>
    );
};
