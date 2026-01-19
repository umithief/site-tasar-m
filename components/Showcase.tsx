
import React, { useEffect, useState } from 'react';
import LiquidSlider from './LiquidSlider';
import { CategoryGrid } from './CategoryGrid';
import { ProductCard } from './ProductCard';
import { PopularProducts } from './PopularProducts';
import { FeaturesSection } from './FeaturesSection';
import { DealOfTheDay } from './DealOfTheDay';
import { Product, ProductCategory, ViewState, User } from '../types';
import { Award, Sparkles, ArrowRight, Search, Bell, Calculator, Film, Sun, Moon, Menu, X, HeartPulse, Siren } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './ui/UserAvatar';
import { Button } from './ui/Button';
import { authService } from '../services/auth';
import { useLivingTime } from '../hooks/useLivingTime';
import { WeatherWidget } from './WeatherWidget';
import { BrandTicker } from './BrandTicker';
import { useLanguage } from '../contexts/LanguageProvider';
import ProductCatalog from './ProductCatalog';
import { CinemaShowcase } from './CinemaShowcase';
import { ErrorBoundary } from './ErrorBoundary';


interface ShowcaseProps {
    products: Product[];
    onAddToCart: (product: Product, event?: React.MouseEvent) => void;
    onProductClick: (product: Product) => void;
    favoriteIds: string[];
    onToggleFavorite: (product: Product) => void;
    onQuickView: (product: Product) => void;
    onNavigate: (view: ViewState, data?: any) => void;
    onToggleMenu: () => void;
    onCartClick?: () => void;
}

export const Showcase: React.FC<ShowcaseProps> = ({
    products,
    onAddToCart,
    onProductClick,
    favoriteIds,
    onToggleFavorite,
    onQuickView,
    onNavigate,
    onToggleMenu,
    onCartClick
}) => {
    const { t } = useLanguage();
    const [user, setUser] = useState<User | null>(null);
    const [greeting, setGreeting] = useState('');
    const { isNight, phase } = useLivingTime();
    const [smartProducts, setSmartProducts] = useState<Product[]>(products);

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchText, setSearchText] = useState('');

    useEffect(() => {
        authService.getCurrentUser().then(setUser);

        if (phase === 'morning') setGreeting(t('home.morning'));
        else if (phase === 'day') setGreeting(t('home.day'));
        else if (phase === 'evening') setGreeting(t('home.evening'));
        else setGreeting(t('home.night'));

        setSmartProducts(products);

    }, [isNight, phase, products, t]);

    const editorsChoiceProducts = products.filter(p => p.isEditorsChoice);
    const dealOfTheDayProduct = products.find(p => p.isDealOfTheDay) || products[0];

    const displayProducts = editorsChoiceProducts.length > 0
        ? editorsChoiceProducts.slice(0, 4)
        : products.slice(0, 4);

    const handleCategorySelect = (category: ProductCategory) => {
        onNavigate('shop', category);
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onNavigate('shop', searchText);
    };

    return (
        <>
            <LiquidSlider />



            {/* Mobile Top Bar (Enhanced Visibility) */}
            <div className="md:hidden pt-safe-top pb-3 px-4 bg-white/95 backdrop-blur-xl sticky top-0 z-30 border-b border-gray-200/50 shadow-sm transition-colors duration-500 h-20 flex flex-col justify-center">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div onClick={() => onNavigate(user ? 'profile' : 'auth' as any)} className="relative cursor-pointer group">
                            {user ? (
                                <UserAvatar name={user.name || 'User'} size={48} className="border-2 border-white dark:border-zinc-800 shadow-md" />
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-zinc-800 flex items-center justify-center border-2 border-white dark:border-zinc-700 shadow-sm">
                                    <span className="text-sm font-bold text-gray-500 dark:text-gray-400">?</span>
                                </div>
                            )}
                            <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1 mb-0.5">
                                <Sun className="w-3 h-3 text-yellow-500" />
                                {greeting}
                            </p>
                            <h2 className="text-lg font-black text-gray-900 dark:text-white leading-none tracking-tight">{user && user.name ? user.name.split(' ')[0] : t('home.guest')}</h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={onCartClick}
                            className="bg-black text-white rounded-full w-10 h-10 p-0 flex items-center justify-center hover:bg-moto-accent hover:text-black transition-colors"
                            variant="ghost"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" /><path d="M3 6h18" /><path d="M16 10a4 4 0 0 1-8 0" /></svg>
                        </Button>
                    </div>
                </div>

                <AnimatePresence>
                    {isSearchOpen && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden mt-2"
                        >
                            <form onSubmit={handleSearchSubmit} className="mb-2">
                                <div className="relative">
                                    <input
                                        autoFocus
                                        type="text"
                                        placeholder={t('common.search_placeholder')}
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        className="w-full h-14 bg-gray-100 rounded-2xl border-2 border-transparent focus:border-moto-accent pl-5 pr-14 text-base font-bold outline-none transition-all text-gray-900 placeholder-gray-500"
                                    />
                                    <Button type="submit" variant="ghost" className="absolute right-0 top-0 h-full w-14 text-gray-500 hover:text-moto-accent rounded-r-2xl">
                                        <ArrowRight className="w-6 h-6" />
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="hidden">
                    <WeatherWidget variant="minimal" className="bg-gray-100 text-gray-900" />
                </div>
            </div>

            {/* <Stories onNavigate={onNavigate} /> */}
            <ErrorBoundary name="CinemaShowcase">
                <CinemaShowcase />
            </ErrorBoundary>


            {dealOfTheDayProduct && (
                <DealOfTheDay
                    product={dealOfTheDayProduct}
                    onAddToCart={(p) => onAddToCart(p)}
                    onClick={onProductClick}
                />
            )}

            <CategoryGrid onCategorySelect={handleCategorySelect} />

            <ProductCatalog />

            <PopularProducts
                products={smartProducts}
                onAddToCart={onAddToCart}
                onProductClick={onProductClick}
                favoriteIds={favoriteIds}
                onToggleFavorite={onToggleFavorite}
                onQuickView={onQuickView}
                onViewAll={() => onNavigate('shop')}
            />

            <div className="px-4 md:px-8 py-8 md:py-16 relative z-10 space-y-8 md:space-y-16">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => onNavigate('vlog-map')}
                    className="max-w-[1800px] mx-auto bg-[#0a0a0a] border border-white/10 rounded-[2rem] overflow-hidden cursor-pointer group shadow-2xl relative"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none"></div>
                    <img src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1600&auto=format&fit=crop" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000" alt="Vlog Map" />

                    <div className="relative z-20 p-8 md:p-16 flex flex-col justify-center min-h-[400px]">
                        <div className="flex items-center gap-3 text-red-500 font-bold tracking-[0.3em] text-xs uppercase mb-4">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> CANLI HARİTA
                        </div>
                        <h3 className="text-4xl md:text-7xl font-display font-black text-white mb-6 leading-[0.9]">
                            ROTA <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">KEŞFET</span>
                        </h3>
                        <p className="text-gray-400 text-base md:text-xl max-w-lg mb-8 leading-relaxed">
                            {t('home.vlog_desc')}
                        </p>

                        <div className="flex items-center gap-4">
                            <Button
                                onClick={(e) => { e.stopPropagation(); onNavigate('vlog-map'); }}
                                className="bg-white text-black px-8 py-6 rounded-xl font-bold text-sm tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl hover:shadow-red-600/20"
                                variant="primary"
                            >
                                {t('home.open_map')}
                            </Button>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    onClick={() => onNavigate('valuation')}
                    className="max-w-[1800px] mx-auto bg-gradient-to-br from-[#111] to-black border border-white/10 rounded-[2rem] p-8 md:p-16 relative overflow-hidden cursor-pointer hover:border-moto-accent/50 transition-all group shadow-2xl"
                >
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-moto-accent/5 rounded-full blur-[120px] pointer-events-none"></div>

                    <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-moto-accent uppercase tracking-[0.3em] mb-4">
                                <Sparkles className="w-4 h-4" /> AI VALUATION
                            </div>
                            <h3 className="text-3xl md:text-6xl font-display font-black text-white mb-4 leading-none">
                                {t('home.valuation')}
                            </h3>
                            <p className="text-gray-400 text-sm md:text-lg max-w-xl leading-relaxed">
                                {t('home.valuation_desc')}
                            </p>
                        </div>

                        <div className="w-16 h-16 md:w-24 md:h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-moto-accent group-hover:text-black group-hover:scale-110 transition-all duration-500">
                            <Calculator className="w-8 h-8 md:w-10 md:h-10" />
                        </div>
                    </div>
                </motion.div>
            </div>

            <section className="relative py-8 md:py-24 overflow-hidden border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-black">
                <div className="absolute top-0 right-0 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-moto-accent/5 rounded-full blur-[80px] md:blur-[120px] pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

                <div className="max-w-[1800px] mx-auto px-4 lg:px-8 relative z-10">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-8 mb-6 md:mb-16">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <div className="flex items-center gap-2 text-moto-accent font-bold tracking-widest text-[10px] md:text-xs uppercase mb-1 md:mb-3 animate-pulse">
                                <Award className="w-3 h-3 md:w-4 md:h-4" />
                                <span>Curated Selection</span>
                            </div>
                            <h2 className="text-2xl md:text-7xl font-display font-black text-gray-900 dark:text-white leading-[0.9] tracking-tight">
                                {t('home.editors_choice').split(' ')[0]} <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-moto-accent via-[#E2FF3B] to-moto-accent bg-[length:200%_auto] animate-shine">
                                    {t('home.editors_choice').split(' ').slice(1).join(' ')}
                                </span>
                            </h2>
                        </motion.div>

                        <Button
                            onClick={() => onNavigate('shop')}
                            className="group flex items-center gap-3 text-gray-900 text-xs font-bold uppercase tracking-widest w-fit hover:text-moto-accent hover:bg-transparent"
                            variant="ghost"
                        >
                            {t('common.view_all')}
                            <div className="w-8 h-[2px] bg-black dark:bg-white group-hover:bg-moto-accent transition-colors"></div>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Button>
                    </div>

                    <div className="flex overflow-x-auto gap-3 pb-4 -mx-4 px-4 md:mx-0 md:px-0 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-8 snap-x snap-mandatory no-scrollbar">
                        {displayProducts.map((product, idx) => (
                            <motion.div
                                key={product._id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                className="relative min-w-[170px] sm:min-w-[280px] md:min-w-0 snap-center"
                            >
                                {idx === 0 && (
                                    <div className="absolute -top-2 -left-2 z-20 bg-black text-white text-[8px] md:text-[9px] font-bold px-2 md:px-3 py-1 rounded-full border border-moto-accent flex items-center gap-1 shadow-lg shadow-moto-accent/20 rotate-[-5deg] animate-pulse">
                                        <Sparkles className="w-3 h-3 text-moto-accent" /> #1
                                    </div>
                                )}

                                <ProductCard
                                    product={product}
                                    onAddToCart={onAddToCart}
                                    onClick={() => onProductClick(product)}
                                    onQuickView={onQuickView}
                                    isFavorite={favoriteIds.includes(product._id)}
                                    onToggleFavorite={onToggleFavorite}
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            <FeaturesSection />
            <BrandTicker />
        </>
    );
};
