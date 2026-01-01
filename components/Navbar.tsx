
import React, { useState, useEffect } from 'react';
import { Search, ShoppingBag, Zap, Menu, X, User as UserIcon } from 'lucide-react';
import { ViewState, User as UserType, ColorTheme } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './ui/UserAvatar';
import { Button } from './ui/Button';

interface NavbarProps {
    cartCount: number;
    favoritesCount: number;
    onCartClick: () => void;
    onFavoritesClick: () => void;
    onSearch: (query: string) => void;
    user: UserType | null;
    onOpenAuth: () => void;
    onLogout: () => void;
    theme?: 'dark' | 'light';
    onToggleTheme?: () => void;
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
    onSearch,
    user,
    currentView,
    onToggleMenu
}) => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSearch(searchQuery);
    };

    const navItems = [
        { id: 'home', label: 'Ana Sayfa' },
        { id: 'shop', label: 'Koleksiyon' },
        { id: 'routes', label: 'Rotalar' },
        { id: 'forum', label: 'Topluluk' },
        { id: 'meetup', label: 'Etkinlikler' },
    ];

    return (
        <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="fixed top-0 left-0 right-0 z-[100] px-4 pt-4 md:px-8 md:pt-6 pointer-events-none"
        >
            <div className={`
            pointer-events-auto mx-auto max-w-[1800px] 
            bg-[#121212]/90 backdrop-blur-xl border border-white/10 
            rounded-[2rem] shadow-2xl transition-all duration-300
            ${isScrolled ? 'py-3 px-6' : 'py-4 px-8'}
        `}>
                <div className="flex items-center justify-between">

                    {/* 1. LOGO */}
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate('home')}>
                        <div className="w-10 h-10 bg-moto-accent rounded-xl flex items-center justify-center shadow-lg shadow-moto-accent/20 group-hover:scale-105 transition-transform text-black">
                            <Zap className="w-6 h-6 fill-current" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-display font-black text-white leading-none tracking-tight">
                                MOTO<span className="text-moto-accent">VIBE</span>
                            </span>
                        </div>
                    </div>

                    {/* 2. CENTER NAVIGATION (Hidden on Mobile) */}
                    <div className="hidden lg:flex items-center gap-2">
                        {navItems.map((item) => (
                            <Button
                                key={item.id}
                                onClick={() => onNavigate(item.id as ViewState)}
                                variant={currentView === item.id ? 'glass' : 'ghost'}
                                className={currentView === item.id ? '!bg-white !text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'text-gray-400 hover:text-white'}
                                size="sm"
                            >
                                {item.label}
                            </Button>
                        ))}
                    </div>

                    {/* 3. RIGHT ACTIONS */}
                    <div className="flex items-center gap-3 md:gap-4">

                        {/* Search Input (Desktop) */}
                        <form
                            onSubmit={handleSearchSubmit}
                            className="hidden md:flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 w-64 focus-within:border-moto-accent/50 focus-within:bg-white/10 transition-all"
                        >
                            <Search className="w-4 h-4 text-gray-400 mr-3" />
                            <input
                                type="text"
                                placeholder="Ekipman ara..."
                                className="bg-transparent border-none outline-none text-sm text-white placeholder-gray-500 w-full"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button type="button" onClick={() => setSearchQuery('')} className="p-1 hover:text-white text-gray-500">
                                    <X className="w-3 h-3" />
                                </button>
                            )}
                        </form>

                        {/* Search Icon (Mobile) */}
                        <div className="md:hidden">
                            <Button
                                onClick={() => onNavigate('shop')}
                                variant="icon-glass"
                                size="icon"
                            >
                                <Search className="w-5 h-5" />
                            </Button>
                        </div>

                        {/* Circular Cart Button */}
                        <div className="relative">
                            <Button
                                id="tour-cart"
                                onClick={onCartClick}
                                variant="primary"
                                className="rounded-full !p-0 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-white text-black hover:bg-gray-200 shadow-lg"
                            >
                                <ShoppingBag className="w-5 h-5" fill="currentColor" />
                            </Button>
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#121212] z-20 pointer-events-none">
                                    {cartCount}
                                </span>
                            )}
                        </div>

                        {/* User Profile */}
                        {user ? (
                            <div
                                className="hidden md:block rounded-full border-2 border-transparent"
                            >
                                <UserAvatar name={user.name} size={40} />
                            </div>
                        ) : (
                            <Button
                                onClick={onOpenAuth}
                                variant="primary"
                                className="hidden md:flex gap-2"
                                size="sm"
                                leftIcon={<div className="p-0.5 bg-black rounded-full text-white"><UserIcon className="w-3 h-3" /></div>}
                            >
                                Giriş Yap
                            </Button>
                        )}

                        {/* Mobile Menu Toggle */}
                        <Button
                            onClick={onToggleMenu}
                            variant="icon-glass"
                            size="icon"
                            className="lg:hidden"
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
