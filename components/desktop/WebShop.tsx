import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Product, ProductCategory, UserBike } from '../../types';
import { productService } from '../../services/productService';
import { garageService } from '../../services/garageService';
import { ShopSidebar } from './ShopSidebar';
import { DesktopProductCard } from './DesktopProductCard';
import { QuickViewDrawer } from './QuickViewDrawer';
import { useAuthStore } from '../../store/authStore';

interface WebShopProps {
    products: Product[];
    onAddToCart: (product: Product) => void;
    onToggleFavorite: (product: Product) => void;
    favoriteIds: string[];
    onCartClick?: () => void;
    onNavigate?: (view: any) => void;
}

export const WebShop: React.FC<WebShopProps> = ({
    products,
    onAddToCart,
    onToggleFavorite,
    favoriteIds,
    onCartClick,
    onNavigate
}) => {
    // const [products, setProducts] = useState<Product[]>([]); // Removed: Using prop
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Filter State
    const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
    const [selectedBikeId, setSelectedBikeId] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 100000 });

    // Garage
    const [garageBikes, setGarageBikes] = useState<UserBike[]>([]);

    // Quick View
    const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

    const { user } = useAuthStore();

    useEffect(() => {
        loadData();
    }, [user]);

    useEffect(() => {
        filterProducts();
    }, [products, selectedCategory, selectedBikeId, priceRange]);

    const loadData = async () => {
        // Only loading needed for garage data now
        // setIsLoading(true); // Don't block UI for garage data if we have products

        try {
            const garageData = user ? await garageService.getGarage() : [];
            setGarageBikes(garageData);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        // Category Filter
        if (selectedCategory !== 'ALL') {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Bike Compatibility Filter (Mock logic for now, assumes 'compatibleBikes' array in product)
        if (selectedBikeId) {
            const selectedBike = garageBikes.find(b => b._id === selectedBikeId);
            if (selectedBike) {
                // In a real app, we check if product is compatible with bike model
                // checking if product.compatibleBikes includes bike.model
                filtered = filtered.filter(p =>
                    p.compatibleBikes?.some(model => model.includes(selectedBike.model)) ||
                    // Fallback for demo: randomly show some items as compatible if data missing
                    (!p.compatibleBikes && Math.random() > 0.5)
                );
            }
        }

        // Price Filter
        filtered = filtered.filter(p => p.price >= priceRange.min && p.price <= priceRange.max);

        setFilteredProducts(filtered);
    };

    const categories = ['ALL', ...Object.values(ProductCategory)];

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans">
            <div className="flex">
                {/* 20% Sidebar - Sticky */}
                <div className="w-1/5 min-w-[300px] border-r border-white/5 p-8 hidden xl:block">
                    <ShopSidebar
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                        priceRange={priceRange}
                        onPriceChange={setPriceRange}
                        garageBikes={garageBikes}
                        selectedBikeId={selectedBikeId}
                        onSelectBike={setSelectedBikeId}
                    />
                </div>

                {/* 80% Product Stage */}
                <div className="flex-1 p-8 xl:p-12">
                    {/* Header */}
                    <div className="mb-12 flex justify-between items-end">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-2">
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-500">Premium</span> Selection
                            </h1>
                            <p className="text-zinc-500 font-mono text-sm uppercase tracking-widest">
                                {filteredProducts.length} Premium Parça Listelendi
                            </p>
                        </div>

                        {/* Top Right Actions (Moved from Global Navbar) */}
                        <div className="flex items-center gap-4">
                            {/* Simple Cart access */}
                            <button
                                onClick={onCartClick}
                                className="relative bg-[#111] border border-white/10 p-3 rounded-full hover:bg-white hover:text-black transition-all group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-black"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                            </button>
                            {/* Profile/Home */}
                            <button
                                onClick={() => onNavigate && onNavigate('social-hub')}
                                className="bg-[#111] border border-white/10 p-3 rounded-full hover:bg-white hover:text-black transition-all group"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                            </button>
                        </div>

                        {/* Sort or additional tools can go here */}
                    </div>

                    {/* Grid */}
                    {isLoading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="aspect-[4/5] bg-zinc-900/30 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <motion.div
                            layout
                            className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 gap-y-12"
                        >
                            {filteredProducts.map((product, index) => (
                                <motion.div
                                    key={product._id}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05, duration: 0.5 }}
                                >
                                    <DesktopProductCard
                                        product={product}
                                        onAddToCart={onAddToCart}
                                        onQuickView={() => setQuickViewProduct(product)}
                                        onToggleFavorite={onToggleFavorite}
                                        isFavorite={favoriteIds.includes(product._id)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Quick View Drawer */}
            <QuickViewDrawer
                product={quickViewProduct}
                isOpen={!!quickViewProduct}
                onClose={() => setQuickViewProduct(null)}
                onAddToCart={onAddToCart}
            />
        </div>
    );
};
