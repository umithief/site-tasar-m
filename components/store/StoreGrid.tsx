import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, ChevronDown, Check,
    ArrowRight, Heart, Plus, ShoppingBag
} from 'lucide-react';
import { Product, ProductCategory } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { productService } from '../../services/productService';
import { useCartStore } from '../../store/useCartStore';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';



const FILTERS = {
    categories: [
        { id: ProductCategory.HELMET, label: 'Kask' },
        { id: ProductCategory.JACKET, label: 'Mont' },
        { id: ProductCategory.GLOVES, label: 'Eldiven' },
        { id: ProductCategory.BOOTS, label: 'Bot' },
        { id: ProductCategory.PANTS, label: 'Pantolon' },
        { id: ProductCategory.ACCESSORY, label: 'Aksesuar' }
    ],
    brands: ['Dainese', 'Alpinestars', 'Shoei', 'AGV', 'Revit', 'Spidi']
};

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
    cartCount = 0
}) => {
    const { user } = useAuthStore();
    // We can still use local store for logic if needed, but props are passed from App often
    // However, the prompt design requested specific cart widget logic.
    // We'll use the prop for cartCount to stay synced with App.tsx

    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Filters
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [priceRange, setPriceRange] = useState(50000);

    // UI State
    const [isCartExpanded, setIsCartExpanded] = useState(false);
    const [accordionState, setAccordionState] = useState({
        categories: true,
        brands: true,
        price: true
    });

    // Initial Load
    useEffect(() => {
        loadProducts();
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = products;

        if (selectedCategory) {
            result = result.filter(p => p.category === selectedCategory);
        }

        if (selectedBrand) {
            result = result.filter(p => p.brand === selectedBrand);
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.name.toLowerCase().includes(q) ||
                p.brand?.toLowerCase().includes(q)
            );
        }

        result = result.filter(p => p.price <= priceRange);

        setFilteredProducts(result);
    }, [products, selectedCategory, selectedBrand, searchQuery, priceRange]);

    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const data = await productService.getProducts();
            setProducts(data);
        } catch (error) {
            console.error("Failed to load products", error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleAccordion = (section: keyof typeof accordionState) => {
        setAccordionState(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const handleAddToCart = (product: Product) => {
        onAddToCart(product);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-[#E2FF3B] selection:text-black relative overflow-x-hidden">

            {/* Background Texture with Heavy Blur */}
            <div className="fixed inset-0 pointer-events-none opacity-20 z-0">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
                <div className="absolute inset-0 bg-[#050505]/90 backdrop-blur-3xl" />
            </div>

            {/* Main Layout Container */}
            <div className="relative z-10 max-w-[1920px] mx-auto p-6 lg:p-10 flex gap-8">

                {/* 2. Left Sidebar: The "Filter Cockpit" */}
                {/* Fixed width, sticky position */}
                <aside className="hidden lg:block w-70 flex-shrink-0">
                    <div className="sticky top-24 h-[85vh] bg-[#0F1012]/60 backdrop-blur-xl border border-white/5 rounded-[32px] p-6 flex flex-col shadow-2xl overflow-hidden">

                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
                            <h2 className="font-bold tracking-widest text-sm text-gray-400 font-display">FİLTRELER</h2>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => { setSelectedCategory(null); setSelectedBrand(null); setSearchQuery(''); }}
                                className="text-xs text-[#E2FF3B] hover:text-white transition-colors font-medium"
                            >
                                Temizle
                            </motion.button>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-8 pr-2">

                            {/* Search Input in Sidebar */}
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <input
                                    type="text"
                                    placeholder="Ürün ara..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-[#E2FF3B]/50 transition-colors placeholder:text-gray-600"
                                />
                            </div>

                            {/* Categories Accordion */}
                            <div>
                                <h3
                                    onClick={() => toggleAccordion('categories')}
                                    className="font-bold text-white mb-4 flex items-center justify-between cursor-pointer group select-none"
                                >
                                    <span>Kategoriler</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 group-hover:text-white transition-transform ${accordionState.categories ? 'rotate-180' : ''}`} />
                                </h3>
                                <AnimatePresence>
                                    {accordionState.categories && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-2 overflow-hidden"
                                        >
                                            {FILTERS.categories.map((cat) => (
                                                <label key={cat.id} className="flex items-center gap-3 cursor-pointer group py-1">
                                                    <div
                                                        onClick={() => setSelectedCategory(selectedCategory === cat.id ? null : cat.id)}
                                                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedCategory === cat.id ? 'bg-[#E2FF3B] border-[#E2FF3B]' : 'border-white/20 group-hover:border-white'}`}
                                                    >
                                                        {selectedCategory === cat.id && <Check className="w-3 h-3 text-black" />}
                                                    </div>
                                                    <span className={`text-sm transition-colors ${selectedCategory === cat.id ? 'text-white font-bold' : 'text-gray-400 group-hover:text-white'}`}>
                                                        {cat.label}
                                                    </span>
                                                </label>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Brands Accordion */}
                            <div>
                                <h3
                                    onClick={() => toggleAccordion('brands')}
                                    className="font-bold text-white mb-4 flex items-center justify-between cursor-pointer group select-none"
                                >
                                    <span>Markalar</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 group-hover:text-white transition-transform ${accordionState.brands ? 'rotate-180' : ''}`} />
                                </h3>
                                <AnimatePresence>
                                    {accordionState.brands && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="space-y-2 overflow-hidden"
                                        >
                                            {FILTERS.brands.map((brand) => (
                                                <label key={brand} className="flex items-center gap-3 cursor-pointer group py-1">
                                                    <div
                                                        onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                                                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selectedBrand === brand ? 'bg-[#E2FF3B] border-[#E2FF3B]' : 'border-white/20 group-hover:border-white'}`}
                                                    >
                                                        {selectedBrand === brand && <Check className="w-3 h-3 text-black" />}
                                                    </div>
                                                    <span className={`text-sm transition-colors ${selectedBrand === brand ? 'text-white font-bold' : 'text-gray-400 group-hover:text-white'}`}>
                                                        {brand}
                                                    </span>
                                                </label>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Price Range Accordion */}
                            <div>
                                <h3
                                    onClick={() => toggleAccordion('price')}
                                    className="font-bold text-white mb-6 flex items-center justify-between cursor-pointer group select-none"
                                >
                                    <span>Fiyat Aralığı</span>
                                    <ChevronDown className={`w-4 h-4 text-gray-500 group-hover:text-white transition-transform ${accordionState.price ? 'rotate-180' : ''}`} />
                                </h3>
                                <AnimatePresence>
                                    {accordionState.price && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden px-1"
                                        >
                                            <input
                                                type="range"
                                                min="0"
                                                max="100000"
                                                step="1000"
                                                value={priceRange}
                                                onChange={(e) => setPriceRange(Number(e.target.value))}
                                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#E2FF3B]"
                                            />
                                            <div className="flex justify-between text-xs text-gray-400 font-mono mt-4">
                                                <span>₺0</span>
                                                <span className="text-[#E2FF3B] font-bold">₺{priceRange.toLocaleString('tr-TR')}</span>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                        </div>
                    </div>
                </aside>

                {/* Right Content Showcase */}
                <main className="flex-1 space-y-10 min-w-0">




                    {/* 4. Product Grid (The Gear Rack) */}
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="aspect-[3/4] rounded-3xl bg-white/5 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-32">
                            <AnimatePresence>
                                {filteredProducts.map((product, index) => (
                                    <motion.div
                                        key={product._id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        layoutId={product._id}
                                        className="group relative bg-[#1A1A1A]/40 backdrop-blur-md border border-white/5 rounded-3xl overflow-hidden hover:border-white/20 transition-all hover:bg-[#1A1A1A]/60 hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] flex flex-col"
                                    >
                                        {/* Wishlist Button */}
                                        <button
                                            onClick={(e) => {
                                                // Ideally call onToggleFavorite props if we added it, but it wasn't in StoreGridProps
                                                // Skipping for now or local
                                                e.stopPropagation();
                                            }}
                                            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/5 flex items-center justify-center text-white/50 hover:text-white hover:bg-[#E2FF3B] hover:text-black hover:border-transparent transition-all active:scale-90"
                                        >
                                            <Heart className="w-5 h-5" />
                                        </button>

                                        {/* Discount Badge */}
                                        {product.discountPrice && (
                                            <div className="absolute top-4 left-4 z-20 px-3 py-1 bg-[#E2FF3B] text-black text-[10px] font-black uppercase rounded-lg tracking-wider shadow-lg">
                                                İNDİRİM
                                            </div>
                                        )}

                                        {/* Image Area - Floating in center */}
                                        <div className="relative aspect-[4/5] p-8 flex items-center justify-center overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                            <LazyLoadImage
                                                src={product.image || product.images?.[0] || 'https://via.placeholder.com/400x500'}
                                                alt={product.name}
                                                className="w-full h-full object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.4)] transition-all duration-700 group-hover:scale-110 group-hover:-rotate-2 group-hover:-translate-y-2 origin-bottom"
                                                effect="blur"
                                                wrapperClassName="w-full h-full"
                                                width="100%"
                                                height="100%"
                                            />

                                            {/* Quick View Button (Fade In) */}
                                            <div className="absolute inset-x-0 bottom-8 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onProductClick(product);
                                                    }}
                                                    className="px-6 py-2.5 bg-white/10 backdrop-blur-xl border border-white/20 text-white text-xs font-bold uppercase tracking-wider rounded-full hover:bg-white hover:text-black transition-colors shadow-xl"
                                                >
                                                    Göz At
                                                </button>
                                            </div>
                                        </div>

                                        {/* Info Area (Bottom) */}
                                        <div className="p-6 pt-0 mt-auto">
                                            <div className="mb-4">
                                                <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-1.5">{product.brand || 'Marka'}</p>
                                                <h3 className="text-lg font-bold text-white leading-tight group-hover:text-[#E2FF3B] transition-colors truncate">
                                                    {product.name}
                                                </h3>
                                            </div>

                                            <div className="flex items-center justify-between border-t border-white/5 pt-4">
                                                <div className="flex flex-col">
                                                    {product.discountPrice ? (
                                                        <>
                                                            <span className="text-gray-500 text-xs line-through decoration-red-500 decoration-2">
                                                                ₺{product.price.toLocaleString('tr-TR')}
                                                            </span>
                                                            <span className="text-white font-bold text-lg">
                                                                ₺{product.discountPrice.toLocaleString('tr-TR')}
                                                            </span>
                                                        </>
                                                    ) : (
                                                        <span className="text-white font-bold text-lg">
                                                            ₺{product.price.toLocaleString('tr-TR')}
                                                        </span>
                                                    )}
                                                </div>

                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleAddToCart(product);
                                                    }}
                                                    className="w-10 h-10 rounded-full bg-[#E2FF3B] flex items-center justify-center text-black hover:bg-white transition-colors shadow-[0_0_20px_rgba(226,255,59,0.2)]"
                                                >
                                                    <Plus className="w-5 h-5" strokeWidth={3} />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </main>
            </div>

            {/* 5. Floating Cart Widget */}
            <AnimatePresence>
                {cartCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 right-8 z-50 flex flex-col items-end gap-2"
                        onHoverStart={() => setIsCartExpanded(true)}
                        onHoverEnd={() => setIsCartExpanded(false)}
                    >
                        <motion.button
                            layout
                            onClick={onOpenCart}
                            className="bg-[#0F1012]/80 backdrop-blur-2xl border border-[#E2FF3B]/50 rounded-full h-16 flex items-center overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.6)] group relative"
                            animate={{ width: isCartExpanded ? 240 : 64 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                            {/* Glowing effect */}
                            <div className="absolute inset-0 bg-[#E2FF3B]/5 group-hover:bg-[#E2FF3B]/10 transition-colors" />

                            <div className="absolute left-0 w-16 h-16 flex items-center justify-center z-10">
                                <ShoppingBag className="w-6 h-6 text-[#E2FF3B]" strokeWidth={2.5} />
                                <div className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full border-2 border-[#0F1012] flex items-center justify-center">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                </div>
                            </div>

                            <div className="pl-16 pr-8 whitespace-nowrap z-10 flex flex-col items-start leading-tight">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Sepet Özeti</span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-lg text-white font-black tracking-tight shrink-0">
                                        Sepete Git
                                    </span>
                                    <span className="text-xs text-gray-500 font-bold">({cartCount} Ürün)</span>
                                </div>
                            </div>
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};
