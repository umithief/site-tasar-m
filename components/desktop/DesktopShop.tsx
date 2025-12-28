import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter, Search, ChevronDown, Grid, List as ListIcon } from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { DesktopProductCard } from './DesktopProductCard';
import { productService } from '../../services/productService';
import { useAuthStore } from '../../store/authStore';

interface DesktopShopProps {
    onAddToCart: (product: Product) => void;
    onQuickView: (product: Product) => void;
    onToggleFavorite: (product: Product) => void;
    favoriteIds: string[];
}

export const DesktopShop: React.FC<DesktopShopProps> = ({
    onAddToCart,
    onQuickView,
    onToggleFavorite,
    favoriteIds
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, selectedCategory, searchQuery]);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (selectedCategory !== 'ALL') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q)
            );
        }

        setFilteredProducts(filtered);
    };

    const categories = ['ALL', ...Object.values(ProductCategory)];

    return (
        <div className="w-full">
            {/* Header & Filters */}
            <div className="mb-10 sticky top-0 bg-black/80 backdrop-blur-xl py-6 z-30 border-b border-white/5 -mx-8 px-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-1">The Collection</h1>
                        <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">Premium Gear for Modern Riders</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search gear..."
                                className="bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 pl-10 w-64 text-sm text-white focus:border-orange-500 outline-none transition-all focus:w-80"
                            />
                            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        </div>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat as any)}
                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider border transition-all whitespace-nowrap
                            ${selectedCategory === cat
                                    ? 'bg-white text-black border-white'
                                    : 'bg-transparent text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-white'}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center h-96">
                    <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-32 text-zinc-500">
                    <p className="text-xl font-bold mb-2">No gear found.</p>
                    <p className="text-sm">Try adjusting your filters.</p>
                </div>
            ) : (
                <motion.div
                    layout
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
                >
                    <AnimatePresence>
                        {filteredProducts.map((product) => (
                            <DesktopProductCard
                                key={product._id}
                                product={product}
                                onAddToCart={onAddToCart}
                                onQuickView={onQuickView}
                                isFavorite={favoriteIds.includes(product._id)}
                                onToggleFavorite={onToggleFavorite}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}
        </div>
    );
};
