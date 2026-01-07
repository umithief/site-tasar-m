import React from 'react';
import { motion } from 'framer-motion';
import { Filter, SlidersHorizontal, Check } from 'lucide-react';

interface StoreSidebarProps {
    categories: string[];
    selectedCategory: string | null;
    onSelectCategory: (category: string | null) => void;
    brands: string[];
    selectedBrands: string[];
    onToggleBrand: (brand: string) => void;
    priceRange: [number, number];
    onPriceChange: (range: [number, number]) => void;
}

export const StoreSidebar: React.FC<StoreSidebarProps> = ({
    categories,
    selectedCategory,
    onSelectCategory,
    brands,
    selectedBrands,
    onToggleBrand
}) => {
    return (
        <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-64 flex-shrink-0 space-y-8"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-6 text-[#E2FF3B]">
                <SlidersHorizontal size={20} />
                <span className="font-bold uppercase tracking-widest text-sm">Tactical Filters</span>
            </div>

            {/* Categories */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 border-l-2 border-[#E2FF3B]">Equipment Type</h3>
                <div className="flex flex-col gap-1">
                    <button
                        onClick={() => onSelectCategory(null)}
                        className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${selectedCategory === null
                                ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-white'
                                : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                            }`}
                    >
                        All Equipment
                    </button>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => onSelectCategory(category)}
                            className={`text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${selectedCategory === category
                                    ? 'bg-[#E2FF3B]/10 border-[#E2FF3B] text-white shadow-[0_0_15px_rgba(226,255,59,0.1)]'
                                    : 'bg-transparent border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Brands */}
            <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-2 border-l-2 border-[#E2FF3B]">Manufacturer</h3>
                <div className="flex flex-col gap-2">
                    {brands.map(brand => (
                        <label key={brand} className="flex items-center gap-3 cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${selectedBrands.includes(brand)
                                    ? 'bg-[#E2FF3B] border-[#E2FF3B] text-black'
                                    : 'border-gray-600 bg-transparent group-hover:border-white'
                                }`}>
                                {selectedBrands.includes(brand) && <Check size={12} strokeWidth={4} />}
                            </div>
                            <span className={`text-sm ${selectedBrands.includes(brand) ? 'text-white font-bold' : 'text-gray-400 group-hover:text-white'}`}>
                                {brand}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Design Element */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/5 mt-8">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-mono mb-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                    SYSTEM STATUS: ONLINE
                </div>
                <div className="h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-[#E2FF3B] w-[70%]" />
                </div>
            </div>

        </motion.aside>
    );
};
