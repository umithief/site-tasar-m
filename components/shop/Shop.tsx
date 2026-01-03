import React, { useState, useEffect } from 'react';
import { Product, FilterState } from '../../types';
import { ProductCard } from './ProductCard';
import { ShopFilters } from './ShopFilters';
import { productService } from '../../services/productService';
import { useLanguage } from '../../contexts/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { Filter } from 'lucide-react';

interface ShopProps {
    onNavigate: (view: any) => void;
    onAddToCart: (product: Product) => void;
    onProductClick: (product: Product) => void;
    favoriteIds: string[];
    onToggleFavorite: (id: string, e: React.MouseEvent) => void;
}

export const Shop: React.FC<ShopProps> = ({
    onNavigate,
    onAddToCart,
    onProductClick,
    favoriteIds,
    onToggleFavorite
}) => {
    const { t } = useLanguage();
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

    // Initial Filter State
    const [filters, setFilters] = useState<FilterState>({
        search: '',
        categories: [],
        minPrice: 0,
        maxPrice: 100000,
        brands: [],
        sortBy: 'featured'
    });

    // Derive unique categories from products
    const [availableCategories, setAvailableCategories] = useState<string[]>([]);

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        setLoading(true);
        try {
            const data = await productService.getProducts();
            setProducts(data);
            setFilteredProducts(data);

            // Extract unique categories
            const categories = Array.from(new Set(data.map(p => p.category)));
            setAvailableCategories(categories);
        } catch (error) {
            console.error('Failed to load products:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    useEffect(() => {
        let result = [...products];

        // Search
        if (filters.search) {
            const query = filters.search.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.brand.toLowerCase().includes(query)
            );
        }

        // Category
        if (filters.categories.length > 0) {
            result = result.filter(p => filters.categories.includes(p.category));
        }

        // Price
        result = result.filter(p => {
            const price = p.discountPrice || p.price;
            return price >= filters.minPrice && price <= filters.maxPrice;
        });

        // Sort
        switch (filters.sortBy) {
            case 'price-asc':
                result.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
                break;
            case 'price-desc':
                result.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
                break;
            case 'rating':
                result.sort((a, b) => b.rating - a.rating);
                break;
            default: // featured
                // Could implement logic for featured items, for now just original order or by rating
                result.sort((a, b) => (b.rating || 0) * (b.stock > 0 ? 1 : 0) - (a.rating || 0));
                break;
        }

        setFilteredProducts(result);
    }, [filters, products]);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">

                {/* Mobile Filter Toggle */}
                <button
                    className="lg:hidden flex items-center justify-center gap-2 bg-white dark:bg-[#1A1A1C] p-3 rounded-lg border border-gray-200 dark:border-white/10 text-zinc-900 dark:text-white font-medium shadow-sm"
                    onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                >
                    <Filter size={20} />
                    {t('shop.filters')}
                </button>

                {/* Sidebar Filters (Desktop) */}
                <aside className={`hidden lg:block`}>
                    <ShopFilters
                        filters={filters}
                        onChange={setFilters}
                        categories={availableCategories}
                        onClear={() => setFilters({
                            search: '',
                            categories: [],
                            minPrice: 0,
                            maxPrice: 100000,
                            brands: [],
                            sortBy: 'featured'
                        })}
                    />
                </aside>

                {/* Mobile Filter Drawer */}
                <AnimatePresence>
                    {isMobileFiltersOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="lg:hidden bg-white dark:bg-[#121214] p-6 rounded-xl border border-gray-200 dark:border-white/10 mb-6 shadow-xl"
                        >
                            <ShopFilters
                                filters={filters}
                                onChange={setFilters}
                                categories={availableCategories}
                                onClear={() => setFilters({
                                    search: '',
                                    categories: [],
                                    minPrice: 0,
                                    maxPrice: 100000,
                                    brands: [],
                                    sortBy: 'featured'
                                })}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Product Grid */}
                <div className="flex-1">
                    {/* Header Stats */}
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold font-display">
                            {filters.categories.length > 0
                                ? filters.categories.join(', ')
                                : t('shop.all_products')}
                        </h2>
                        <span className="text-gray-400 text-sm">
                            {filteredProducts.length} {t('common.search_placeholder').includes('Ürün') ? 'Ürün' : 'Product'}
                        </span>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => (
                                <div key={i} className="bg-gray-200 dark:bg-[#121214] rounded-xl aspect-[4/5] animate-pulse" />
                            ))}
                        </div>
                    ) : filteredProducts.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4 text-3xl">
                                🔍
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">{t('shop.no_results')}</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                                Arama kriterlerinize uygun ürün bulunamadı. Filtreleri temizlemeyi deneyin.
                            </p>
                            <button
                                onClick={() => setFilters({
                                    search: '',
                                    categories: [],
                                    minPrice: 0,
                                    maxPrice: 100000,
                                    brands: [],
                                    sortBy: 'featured'
                                })}
                                className="mt-6 px-6 py-2 bg-moto-accent text-black rounded-lg font-bold hover:bg-white transition-colors"
                            >
                                {t('shop.clear_filters')}
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6">
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map(product => (
                                    <ProductCard
                                        key={product._id}
                                        product={product}
                                        onAddToCart={onAddToCart}
                                        onProductClick={onProductClick}
                                        isFavorite={favoriteIds.includes(product._id)}
                                        onToggleFavorite={onToggleFavorite}
                                    />
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
