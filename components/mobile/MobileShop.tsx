import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, ShoppingBag, Filter } from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from './ProductCard';

const CATEGORIES = ["Tümü", "Performans", "Ekipman", "Bakım", "Aksesuar"];

const MobileShop = () => {
    const { data: products, isLoading } = useProducts();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState("Tümü");

    const filteredProducts = products?.filter((product) => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = activeCategory === "Tümü" || product.category === activeCategory;
        return matchesSearch && matchesCategory;
    }) || [];

    return (
        <div className="min-h-screen bg-black pb-24 text-white">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-black/80 backdrop-blur-xl border-b border-white/5 px-4 pt-12 pb-4">
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold tracking-tighter italic">MOTO<span className="text-orange-500">SHOP</span></h1>
                    <div className="relative">
                        <ShoppingBag className="text-white" size={24} />
                        {/* Badge can be added here linking to Cart */}
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Parça veya SKU ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-orange-500/50 transition-colors placeholder:text-zinc-600"
                    />
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat
                                    ? 'bg-orange-600 text-white shadow-[0_0_15px_-5px_orange]'
                                    : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            <div className="p-4">
                {isLoading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {filteredProducts.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}

                {!isLoading && filteredProducts.length === 0 && (
                    <div className="text-center py-20 text-zinc-500">
                        <p>Ürün bulunamadı.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MobileShop;
