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
            initial={{ opacity: 0, x: -20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -50, scale: 0.9 }}
            whileHover={{ x: 10, backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
            className="group relative flex gap-4 md:gap-6 p-4 md:p-6 rounded-3xl bg-white/5 border border-white/5 backdrop-blur-md transition-colors"
        >
            {/* Thumbnail */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-center p-2 shrink-0 overflow-hidden">
                <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
            </div>

            {/* Details */}
            <div className="flex-1 flex flex-col justify-between py-1">
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-white font-bold text-lg md:text-xl leading-tight mb-2 max-w-[80%]">{item.name}</h3>
                        <div className="md:hidden">
                            <button
                                onClick={() => onRemove(item._id)}
                                className="text-gray-500 hover:text-[#FF3E3E] transition-colors p-2"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-500 font-mono uppercase tracking-wider">
                        <span className="bg-white/5 px-2 py-1 rounded border border-white/5">Size: M</span>
                        <span className="bg-white/5 px-2 py-1 rounded border border-white/5">Color: Black</span>
                    </div>
                </div>

                <div className="flex items-end justify-between mt-4">
                    <div className="flex items-center gap-4 md:gap-8">
                        <span className="text-[#E2FF3B] font-mono font-bold text-xl md:text-2xl drop-shadow-[0_0_10px_rgba(226,255,59,0.2)]">
                            ${price.toLocaleString()}
                        </span>

                        {/* Custom Quantity Stepper */}
                        <div className="flex items-center h-10 bg-black/40 rounded-xl border border-white/10 overflow-hidden">
                            <button
                                onClick={() => onUpdateQuantity(item._id, -1)}
                                className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors active:scale-90"
                            >
                                <Minus size={16} />
                            </button>
                            <span className="w-8 text-center text-sm font-bold text-white font-mono">{item.quantity}</span>
                            <button
                                onClick={() => onUpdateQuantity(item._id, 1)}
                                className="w-10 h-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors active:scale-90"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => onRemove(item._id)}
                        className="hidden md:flex items-center gap-2 text-gray-500 hover:text-[#FF3E3E] hover:bg-[#FF3E3E]/10 px-4 py-2 rounded-xl transition-all font-bold text-xs uppercase tracking-widest group/trash"
                    >
                        <Trash2 size={16} className="group-hover/trash:animate-bounce" />
                        <span>Remove</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
};
