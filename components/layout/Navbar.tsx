import React, { useState, useEffect, useRef } from 'react';
import { Search, ShoppingBag, Zap, LogIn, X, ChevronDown, Bell, Warehouse, Settings, LogOut, Menu, User as UserIcon, Heart, Globe, ShieldCheck } from 'lucide-react';
import { ViewState, User as UserType, ColorTheme, Product } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from '../ui/UserAvatar';
import { productService } from '../../services/productService';
import { useLanguage } from '../../contexts/LanguageProvider';

interface NavbarProps {
  cartCount: number;
  favoritesCount: number;
  onCartClick: () => void;
  onFavoritesClick: () => void;
  onSearch: (query: string) => void;
  user: UserType | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigate: (view: ViewState, data?: any) => void;
  currentView: ViewState;
  colorTheme?: ColorTheme;
  onColorChange?: (theme: ColorTheme) => void;
  onToggleMenu?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  cartCount, 
  onCartClick, 
  onOpenAuth, 
  onNavigate, 
  user, 
  currentView,
  onLogout,
  onToggleMenu
}) => {
  const { t, language, setLanguage } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  
  const searchInputRef = useRef<HTMLInputElement>(null);
  const navbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
      productService.getProducts().then(setAllProducts);
  }, []);

  useEffect(() => {
      if (isSearchActive && searchInputRef.current) {
          setTimeout(() => searchInputRef.current?.focus(), 100);
      }
  }, [isSearchActive]);

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
          if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
              setIsSearchActive(false);
              setIsProfileMenuOpen(false);
          }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
          document.removeEventListener('mousedown', handleClickOutside);
      };
  }, []);

  const filteredProducts = allProducts.filter(p => 
      p.name.toLowerCase().includes(productQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(productQuery.toLowerCase())
  ).slice(0, 5); 

  const navItems = [
      { id: 'home', label: t('nav.home') },
      { id: 'shop', label: t('nav.shop') },
      { id: 'routes', label: t('nav.routes') },
      { id: 'forum', label: t('nav.community') }, 
      { id: 'meetup', label: t('nav.events') },
  ];

  const toggleLanguage = () => {
      setLanguage(language === 'tr' ? 'en' : 'tr');
  };

  return (
    <>
        {/* --- DESKTOP ISLAND NAVBAR --- */}
        <div className="hidden md:flex fixed top-0 left-0 right-0 z-50 justify-center pointer-events-none pt-6 px-4">
            <motion.div 
                ref={navbarRef}
                initial={{ y: -100, opacity: 0 }}
                animate={{ 
                    y: 0, 
                    opacity: 1,
                    width: isSearchActive ? '850px' : isScrolled ? '75%' : '90%',
                }}
                transition={{ type: "spring", stiffness: 200, damping: 25 }}
                className={`pointer-events-auto relative bg-white/90 backdrop-blur-2xl border border-white/40 rounded-full shadow-2xl flex items-center justify-between px-3 py-3 transition-all duration-500`}
            >
                {/* 1. LEFT: LOGO */}
                <button 
                    onClick={() => onNavigate('home')} 
                    className="flex items-center gap-3 pl-4 pr-4 group shrink-0"
                >
                    <div className="w-10 h-10 bg-moto-accent rounded-xl flex items-center justify-center shadow-lg shadow-moto-accent/30 group-hover:scale-110 transition-transform">
                        <Zap className="w-6 h-6 text-white fill-white" />
                    </div>
                    {!isSearchActive && (
                        <motion.span 
                            initial={{ opacity: 0, width: 0 }} 
                            animate={{ opacity: 1, width: 'auto' }}
                            className="font-display font-black text-2xl text-gray-900 tracking-tight whitespace-nowrap overflow-hidden"
                        >
                            MOTO<span className="text-moto-accent font-bold italic">VIBE</span>
                        </motion.span>
                    )}
                </button>

                {/* 2. CENTER: NAVIGATION */}
                <div className="flex-1 flex justify-center items-center px-6 relative h-12">
                    <AnimatePresence mode="wait">
                        {isSearchActive ? (
                            <motion.div 
                                key="search-bar"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="w-full relative flex items-center"
                            >
                                <Search className="absolute left-0 w-5 h-5 text-moto-accent" />
                                <input 
                                    ref={searchInputRef}
                                    type="text" 
                                    placeholder={t('nav.search_placeholder')} 
                                    className="w-full bg-transparent border-none outline-none text-gray-900 placeholder-gray-400 text-base pl-10 font-medium h-full"
                                    value={productQuery}
                                    onChange={(e) => setProductQuery(e.target.value)}
                                />
                                <button onClick={() => { setIsSearchActive(false); setProductQuery(''); }} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>

                                {/* Dropdown */}
                                {productQuery && (
                                    <motion.div 
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="absolute top-14 left-0 right-0 bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden z-50 p-3"
                                    >
                                        {filteredProducts.length > 0 ? filteredProducts.map(product => (
                                            <button 
                                                key={product.id} 
                                                onClick={() => { onNavigate('product-detail', product); setIsSearchActive(false); }} 
                                                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-2xl transition-colors text-left group"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0 p-1 border border-gray-200">
                                                    <img src={product.image} className="w-full h-full object-contain" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-base font-bold text-gray-900 truncate group-hover:text-moto-accent">{product.name}</div>
                                                    <div className="text-sm text-gray-500 font-mono">₺{product.price.toLocaleString()}</div>
                                                </div>
                                            </button>
                                        )) : <div className="p-6 text-center text-gray-500 text-sm font-medium">Sonuç bulunamadı.</div>}
                                    </motion.div>
                                )}
                            </motion.div>
                        ) : (
                            <motion.nav 
                                key="nav-links"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex items-center gap-2"
                            >
                                {navItems.map((item) => {
                                    const isActive = currentView === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => onNavigate(item.id as ViewState)}
                                            className={`relative px-5 py-2.5 rounded-full text-sm font-bold uppercase tracking-wide transition-all ${
                                                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                        >
                                            {isActive && (
                                                <motion.div 
                                                    layoutId="island-nav-active"
                                                    className="absolute inset-0 bg-[#121212] rounded-full shadow-lg"
                                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                                />
                                            )}
                                            <span className="relative z-10">{item.label}</span>
                                        </button>
                                    );
                                })}
                            </motion.nav>
                        )}
                    </AnimatePresence>
                </div>

                {/* 3. RIGHT: ACTIONS */}
                <div className="flex items-center gap-3 pr-2">
                    
                    {!isSearchActive && (
                        <button 
                            onClick={() => setIsSearchActive(true)}
                            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    )}

                    <button 
                        onClick={toggleLanguage}
                        className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors font-black text-sm"
                    >
                        {language === 'tr' ? 'TR' : 'EN'}
                    </button>

                    <div className="w-[2px] h-6 bg-gray-200 mx-1 rounded-full"></div>

                    <button 
                        onClick={onCartClick} 
                        className="relative w-11 h-11 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-900 transition-colors group"
                    >
                        <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        {cartCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-moto-accent rounded-full shadow-sm border-2 border-white"></span>
                        )}
                    </button>

                    <div className="relative">
                        {user ? (
                            <button 
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="flex items-center gap-2 pl-2 rounded-full hover:bg-gray-100 transition-colors pr-1 py-1 border border-transparent hover:border-gray-200"
                            >
                                <UserAvatar name={user.name} size={36} className="ring-2 ring-gray-200" />
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                        ) : (
                            <button 
                                onClick={onOpenAuth} 
                                className="w-11 h-11 flex items-center justify-center rounded-full bg-[#121212] text-white hover:bg-black transition-colors shadow-xl hover:shadow-2xl hover:scale-105 transform duration-200"
                            >
                                <LogIn className="w-5 h-5" />
                            </button>
                        )}

                        <AnimatePresence>
                            {isProfileMenuOpen && user && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-4 w-64 bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden z-50 p-2"
                                >
                                    <div className="p-4 mb-2 bg-gray-50 rounded-2xl mx-1 border border-gray-100">
                                        <p className="text-[10px] text-moto-accent font-black uppercase tracking-widest mb-1">{user.rank}</p>
                                        <p className="text-base font-bold text-gray-900 truncate">{user.name}</p>
                                    </div>
                                    
                                    <div className="space-y-1">
                                        {user.isAdmin && (
                                            <button onClick={() => { onNavigate('admin'); setIsProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition-colors">
                                                <ShieldCheck className="w-5 h-5" /> Admin Panel
                                            </button>
                                        )}
                                        <button onClick={() => { onNavigate('profile'); setIsProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                                            <UserIcon className="w-5 h-5" /> {t('nav.profile')}
                                        </button>
                                        <button onClick={() => { onNavigate('profile'); setIsProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                                            <Warehouse className="w-5 h-5" /> {t('nav.garage')}
                                        </button>
                                        <button onClick={() => { onNavigate('settings' as any); setIsProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors">
                                            <Settings className="w-5 h-5" /> {t('nav.settings')}
                                        </button>
                                    </div>
                                    
                                    <div className="h-[1px] bg-gray-100 my-2 mx-2"></div>
                                    
                                    <button onClick={() => { onLogout(); setIsProfileMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors">
                                        <LogOut className="w-5 h-5" /> {t('nav.logout')}
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>

        {/* --- MOBILE NAVBAR (Sticky Top) --- */}
        <div className={`md:hidden fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-gray-200 px-4 h-20 flex items-center justify-between transition-transform duration-300 shadow-sm ${currentView === 'home' ? '-translate-y-full' : 'translate-y-0'}`}>
             <button onClick={() => onNavigate('home')} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-moto-accent rounded-xl flex items-center justify-center shadow-lg shadow-moto-accent/20">
                    <Zap className="w-6 h-6 text-white fill-white" />
                </div>
                <span className="font-display font-black text-2xl text-gray-900 tracking-tight">MOTO<span className="text-moto-accent">VIBE</span></span>
             </button>

             <div className="flex items-center gap-2">
                <button 
                    onClick={toggleLanguage}
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:scale-95 transition-transform text-sm font-black"
                >
                    {language === 'tr' ? 'TR' : 'EN'}
                </button>
                <button 
                    onClick={() => onNavigate('shop')}
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 active:scale-95 transition-transform hover:bg-gray-200"
                >
                    <Search className="w-5 h-5" />
                </button>
                <button 
                    onClick={onToggleMenu}
                    className="w-11 h-11 flex items-center justify-center rounded-full bg-[#121212] text-white active:scale-95 transition-transform shadow-lg hover:shadow-xl"
                >
                    <Menu className="w-5 h-5" />
                </button>
             </div>
        </div>
    </>
  );
};