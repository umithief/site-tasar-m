import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, ChevronDown, Check, Zap } from 'lucide-react';
import { ProductCategory, UserBike } from '../../types';

interface ShopSidebarProps {
    categories: string[];
    selectedCategory: string;
    onSelectCategory: (category: string) => void;
    priceRange: { min: number; max: number };
    onPriceChange: (range: { min: number; max: number }) => void;
    garageBikes: UserBike[];
    selectedBikeId: string | null;
    onSelectBike: (bikeId: string | null) => void;
}

export const ShopSidebar: React.FC<ShopSidebarProps> = ({
    categories,
    selectedCategory,
    onSelectCategory,
    priceRange,
    onPriceChange,
    garageBikes,
    selectedBikeId,
    onSelectBike
}) => {
    return (
        <aside className="w-full h-[calc(100vh-80px)] sticky top-24 overflow-y-auto pr-6 custom-scrollbar">
            {/* Header */}
            <div className="mb-10">
                <h2 className="text-3xl font-bold uppercase tracking-tighter mb-2">Filtreler</h2>
                <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest">Koleksiyonu Özelleştir</p>
            </div>

            {/* Garage Filter (The "Smart" Feature) */}
            <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                    <Zap className="w-4 h-4 text-[#E2FF3B]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">Garajın</h3>
                </div>

                <div className="space-y-3">
                    <button
                        onClick={() => onSelectBike(null)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 relative overflow-hidden group ${selectedBikeId === null
                            ? 'bg-zinc-900 border-[#E2FF3B]/50 text-white'
                            : 'bg-transparent border-white/10 text-zinc-500 hover:border-white/30 hover:text-white'
                            }`}
                    >
                        <span className="relative z-10 text-xs font-bold uppercase tracking-wider">Tüm Uyumlu Parçalar</span>
                        {selectedBikeId === null && <div className="absolute inset-0 bg-[#E2FF3B]/5" />}
                    </button>

                    {garageBikes.map(bike => (
                        <button
                            key={bike._id}
                            onClick={() => onSelectBike(selectedBikeId === bike._id ? null : bike._id)}
                            className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-300 relative overflow-hidden group ${selectedBikeId === bike._id
                                ? 'bg-zinc-900 border-[#E2FF3B] text-white shadow-[0_0_20px_rgba(226,255,59,0.1)]'
                                : 'bg-transparent border-white/10 text-zinc-500 hover:border-white/30 hover:text-white'
                                }`}
                        >
                            <div className="relative z-10 flex items-center justify-between">
                                <div>
                                    <span className="block text-[10px] uppercase text-zinc-500 mb-0.5">{bike.brand}</span>
                                    <span className="block text-sm font-bold uppercase tracking-wide">{bike.model}</span>
                                </div>
                                {selectedBikeId === bike._id && <Check className="w-4 h-4 text-[#E2FF3B]" />}
                            </div>
                        </button>
                    ))}

                    {garageBikes.length === 0 && (
                        <div className="p-4 rounded-xl border border-dashed border-white/10 text-center">
                            <p className="text-xs text-zinc-600 mb-2">Garajın boş.</p>
                            <button className="text-[10px] font-bold text-[#E2FF3B] hover:underline">Motor Ekle</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Categories */}
            <div className="mb-12">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6">Kategoriler</h3>
                <div className="space-y-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => onSelectCategory(cat)}
                            className={`w-full flex items-center justify-between py-2 text-sm transition-colors group ${selectedCategory === cat ? 'text-white' : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            <span className={`uppercase tracking-widest text-xs font-medium ${selectedCategory === cat ? 'border-b border-[#E2FF3B] pb-0.5' : ''}`}>
                                {cat === 'ALL' ? 'Tümü' : cat}
                            </span>
                            {selectedCategory === cat && (
                                <motion.span layoutId="activeDot" className="w-1.5 h-1.5 rounded-full bg-[#E2FF3B]" />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Range (Simplified) */}
            <div className="mb-12">
                <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-6">Fiyat Aralığı</h3>
                <div className="space-y-4">
                    <div className="flex justify-between text-xs font-mono text-zinc-400">
                        <span>₺0</span>
                        <span>₺100.000+</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="100000"
                        step="1000"
                        className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#E2FF3B]"
                    />
                </div>
            </div>
        </aside>
    );
};
