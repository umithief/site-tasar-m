import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItem as CartItemType } from '../../../types';

interface CartItemProps {
    item: CartItemType;
    onUpdateQuantity: (id: string, delta: number) => void;
    onRemove: (id: string) => void;
}

export const CartItem: React.FC<CartItemProps> = ({ item, onUpdateQuantity, onRemove }) => {
    const price = item.discountPrice || item.price;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="group relative flex gap-4 p-4 rounded-3xl bg-[#0F0F0F] border border-white/5 hover:border-[#E2FF3B]/30 transition-all"
        >
            {/* Thumbnail */}
            <div className="w-24 h-24 rounded-2xl bg-black border border-white/5 flex items-center justify-center p-2 shrink-0">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain" />
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-white font-bold leading-tight mb-1">{item.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 font-mono uppercase tracking-wider">
                        <span>Size: M</span> {/* Placeholder, should come from item */}
                        <span>•</span>
                        <span>Color: Black</span>
                    </div>
                </div>

                <div className="flex items-end justify-between">
                    <div className="flex items-center gap-4">
                        <span className="text-[#E2FF3B] font-mono font-bold text-lg">
                            ${price.toLocaleString()}
                        </span>

                        {/* Quantity Selector */}
                        <div className="flex items-center h-8 bg-white/5 rounded-lg border border-white/10">
                            <button
                                onClick={() => onUpdateQuantity(item._id, -1)}
                                className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                                <Minus size={14} />
                            </button>
                            <span className="w-6 text-center text-sm font-bold text-white">{item.quantity}</span>
                            <button
                                onClick={() => onUpdateQuantity(item._id, 1)}
                                className="w-8 h-full flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                            >
                                <Plus size={14} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => onRemove(item._id)}
                        className="text-gray-500 hover:text-red-500 transition-colors p-2"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
