import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingBag, Filter, Heart, ArrowRight } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { ProductCategory } from '../../types';

// New Categories compatible with design
const CATEGORIES = [
    { id: 'ALL', label: 'Tümü' },
    { id: 'HELMETS', label: 'Kasklar' },
    { id: 'JACKETS', label: 'Montlar' },
    { id: 'GLOVES', label: 'Eldivenler' },
    { id: 'ACCESSORIES', label: 'Aksesuarlar' }
];

interface MobileShopProps {
    onNavigate: (view: any, data?: any) => void;
    initialCategory?: ProductCategory | 'ALL';
    cartCount?: number;
}

export const MobileShop: React.FC<MobileShopProps> = ({ onNavigate, initialCategory = 'ALL', cartCount = 0 }) => {
    const { data: products, isLoading } = useProducts();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string>(initialCategory);

    // Filter logic (using mock category mapping for demo)
    const filteredProducts = products?.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        // Simple mapping for demo purposes since backend categories might differ
        let matchesCategory = activeCategory === 'ALL';
        if (!matchesCategory) {
            // Rough check, ideally backend categories align with UI constants
            matchesCategory = true;
        }
        return matchesSearch && matchesCategory;
    }) || [];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans pb-32">

            {/* 1. Header (Floating Search & Filter) */}
            <div className="sticky top-0 z-30 px-4 pt-4 pb-2 bg-[#050505]/80 backdrop-blur-md">
                <div className="relative flex items-center gap-3">
                    {/* Search Bar */}
                    <div className="flex-1 relative h-12">
                        <div className="absolute inset-0 bg-white/10 rounded-full backdrop-blur-sm border border-white/5 flex items-center px-4 transition-all focus-within:bg-white/15 focus-within:border-white/20">
                            <Search className="w-5 h-5 text-gray-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Ekipman ara..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-transparent border-none outline-none text-white text-sm placeholder-gray-400 h-full"
                            />
                        </div>
                    </div>

                    {/* Filter Button */}
                    <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/5 flex items-center justify-center relative active:scale-95 transition-transform">
                        <Filter className="w-5 h-5 text-white" />
                        <div className="absolute top-3 right-3 w-2 h-2 bg-[#E2FF3B] rounded-full border border-black" />
                    </button>
                </div>

                {/* 2. Categories (Pill-Shaped Glass Tabs) */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar mt-4 pb-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.id)}
                            className={`relative px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === cat.id
                                ? 'bg-[#E2FF3B] text-black border-[#E2FF3B]'
                                : 'bg-transparent text-white border-white/10 hover:bg-white/5'
                                }`}
                        >
                            {activeCategory === cat.id && (
                                <motion.div
                                    layoutId="activeCategoryTab"
                                    className="absolute inset-0 bg-[#E2FF3B] rounded-full -z-10"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <span className="relative z-10">{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="px-4 space-y-6 mt-4">

                {/* 3. Featured "Hero" Item (The Drop) */}
                {!searchQuery && activeCategory === 'ALL' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative w-full aspect-[4/5] rounded-[32px] overflow-hidden group cursor-pointer"
                        onClick={() => onNavigate('product-detail', filteredProducts[0])} // Mock navigation
                    >
                        <img
                            src="https://images.unsplash.com/photo-1622185135505-2d795043dfeb?q=80&w=1964&auto=format&fit=crop"
                            alt="Featured"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />

                        <div className="absolute top-4 left-4 px-3 py-1 bg-[#E2FF3B] text-black text-[10px] font-black uppercase tracking-wider rounded-md">
                            YENİ SEZON
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6">
                            <h2 className="text-3xl font-black text-white leading-none mb-2">AGV Pista GP RR</h2>
                            <p className="text-[#E2FF3B] text-xl font-bold">₺42.000</p>
                        </div>
                    </motion.div>
                )}

                {/* 4. The Product Grid (Main List) */}
                <div className="grid grid-cols-2 gap-4">
                    {isLoading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] bg-white/5 rounded-[24px] animate-pulse" />
                        ))
                    ) : (
                        filteredProducts.map((product) => (
                            <motion.div
                                key={product._id}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onNavigate('product-detail', product)}
                                className="bg-[#1A1A1A] rounded-[24px] overflow-hidden relative group"
                            >
                                {/* Image Area */}
                                <div className="aspect-[3/4] w-full relative bg-white/5">
                                    <img
                                        src={(product as any).images?.[0] || product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover"
                                    />
                                    {/* Wishlist Button */}
                                    <button className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/30 backdrop-blur-md flex items-center justify-center text-white hover:bg-[#E2FF3B] hover:text-black transition-colors">
                                        <Heart className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Details Area */}
                                <div className="p-4 bg-gradient-to-t from-[#1A1A1A] to-[#1A1A1A]/90 absolute bottom-0 left-0 right-0">
                                    <div className="flex justify-between items-end">
                                        <div className="flex-1 min-w-0 pr-2">
                                            <h3 className="text-white font-bold text-sm truncate leading-tight mb-1">{product.name}</h3>
                                            <p className="text-gray-400 text-xs font-medium">₺{product.price.toLocaleString('tr-TR')}</p>
                                        </div>
                                        <button className="w-8 h-8 rounded-full bg-white flex items-center justify-center shrink-0 active:scale-90 transition-transform">
                                            <ArrowRight className="w-4 h-4 text-black" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>

                {!isLoading && filteredProducts.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p>Ürün bulunamadı.</p>
                    </div>
                )}
            </div>

            {/* 5. Floating Cart Indicator */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100]"
                    >
                        <button
                            onClick={() => onNavigate('cart')}
                            className="bg-black border border-white/10 shadow-2xl shadow-black/50 px-6 py-3 rounded-full flex items-center gap-3 active:scale-95 transition-transform"
                        >
                            <div className="w-2 h-2 rounded-full bg-[#E2FF3B] animate-pulse" />
                            <span className="text-sm font-bold text-white">Sepet ({cartCount})</span>
                            <span className="text-sm text-gray-500 font-medium">•</span>
                            <span className="text-sm font-bold text-[#E2FF3B]">₺{(60500).toLocaleString('tr-TR')}</span>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
