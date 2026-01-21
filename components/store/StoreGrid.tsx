import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, Loader2 } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { StoreSidebar } from './StoreSidebar';
import { Product } from '../../types';
import { productService } from '../../services/productService';
import { useUIStore } from '../../store/useUIStore';

interface StoreGridProps {
    onAddToCart: (product: Product) => void;
    onProductClick: (product: Product) => void;
    onOpenCart: () => void;
    cartCount: number;
}

export const StoreGrid: React.FC<StoreGridProps> = ({
    onAddToCart,
    onProductClick,
    onOpenCart,
    cartCount
}) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = React.useMemo(() => Array.from(new Set(products.map(p => p.category))), [products]);
    const brands = React.useMemo(() => Array.from(new Set(products.map(p => p.brand))), [products]);

    const filteredProducts = React.useMemo(() => products.filter(p => {
        const matchCategory = selectedCategory ? p.category === selectedCategory : true;
        const matchBrand = selectedBrands.length > 0 ? selectedBrands.includes(p.brand) : true;
        const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.brand.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCategory && matchBrand && matchSearch;
    }), [products, selectedCategory, selectedBrands, searchQuery]);

    const toggleBrand = (brand: string) => {
        if (selectedBrands.includes(brand)) {
            setSelectedBrands(prev => prev.filter(b => b !== brand));
        } else {
            setSelectedBrands(prev => [...prev, brand]);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white p-4 lg:p-8 font-sans">

            {/* Top Bar */}
            <header className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
                <div>
                    <h1 className="text-4xl lg:text-5xl font-black italic uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                        Gear<span className="text-[#E2FF3B]">Lab</span>.
                    </h1>
                    <p className="text-gray-400 mt-2 font-mono text-sm tracking-widest">GELİŞMİŞ TAKTİKSEL EKİPMAN // V.2.0</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    {/* Cart Button */}
                    <button
                        onClick={onOpenCart}
                        className="relative p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
                    >
                        <ShoppingCart className="text-gray-300 group-hover:text-[#E2FF3B] transition-colors" size={20} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#E2FF3B] text-[10px] font-bold text-black animate-pulse">
                                {cartCount}
                            </span>
                        )}
                    </button>

                    <div className="relative flex-1 md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                        <input
                            type="text"
                            placeholder="Ekipman Ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-[#111] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-[#E2FF3B] focus:ring-1 focus:ring-[#E2FF3B] transition-all"
                        />
                    </div>
                </div>
            </header>

            <div className="flex flex-col lg:flex-row gap-12">

                {/* Sidebar */}
                <StoreSidebar
                    categories={categories}
                    selectedCategory={selectedCategory}
                    onSelectCategory={setSelectedCategory}
                    brands={brands}
                    selectedBrands={selectedBrands}
                    onToggleBrand={toggleBrand}
                    priceRange={[0, 1000]}
                    onPriceChange={() => { }}
                />

                {/* Main Grid */}
                <div className="flex-1">
                    {loading ? (
                        <div className="h-96 flex items-center justify-center">
                            <Loader2 className="w-12 h-12 text-[#E2FF3B] animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 auto-rows-fr">
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map((product, index) => {
                                    // Bento Grid Logic: First item or every 7th item spans 2 columns on desktop if space permits
                                    const isFeatured = index === 0 || index % 7 === 0;
                                    const spanClass = isFeatured ? 'md:col-span-2 xl:col-span-2' : 'col-span-1';

                                    return (
                                        <motion.div
                                            layout
                                            key={product._id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3, delay: index * 0.05 }}
                                            className={spanClass}
                                        >
                                            <ProductCard
                                                product={product}
                                                onAddToCart={onAddToCart}
                                                onProductClick={onProductClick}
                                            />
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}

                    {!loading && filteredProducts.length === 0 && (
                        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
                            <p className="text-gray-400 font-mono">ARAMANIZLA EŞLEŞEN EKİPMAN BULUNAMADI.</p>
                            <button
                                onClick={() => { setSelectedCategory(null); setSelectedBrands([]); setSearchQuery(''); }}
                                className="mt-4 text-[#E2FF3B] underline hover:text-white"
                            >
                                FİLTRELERİ SIFIRLA
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};
