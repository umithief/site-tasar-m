import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
    Search, ShoppingBag, Bell, User as UserIcon,
    Settings, LogOut, LayoutGrid, Compass, ShoppingCart,
    Zap, ChevronDown, Warehouse, ShieldCheck
} from 'lucide-react';
import { ViewState, User as UserType, ColorTheme } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import { useLanguage } from '../../contexts/LanguageProvider';
import { SearchOverlay } from './SearchOverlay';
import { Magnetic } from '../ui/Magnetic';
import { UserAvatar } from '../ui/UserAvatar';

interface NavbarProps {
    cartCount: number;
    favoritesCount: number;
    onCartClick: () => void;
    onFavoritesClick: () => void;
    onSearch: (query: string) => void;
    onOpenAuth: () => void;
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
    currentView,
    onToggleMenu,
    onSearch
}) => {
    const { user, logout, isAuthenticated } = useAuthStore();
    const { socket } = useSocket();
    const { t } = useLanguage();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState(0);

    const { scrollY } = useScroll();

    // Dynamic transforms based on view
    const isFeed = currentView === 'home';

    const navbarWidth = useTransform(
        scrollY,
        [0, 100],
        ['90%', isFeed ? '100%' : '75%']
    );

    const navbarTop = useTransform(
        scrollY,
        [0, 100],
        ['1.5rem', isFeed ? '0rem' : '1.5rem']
    );

    const navbarRadius = useTransform(
        scrollY,
        [0, 100],
        ['9999px', isFeed ? '0px' : '9999px']
    );

    const navbarBorder = useTransform(
        scrollY,
        [0, 100],
        ['1px solid rgba(255,255,255,0.1)', isFeed ? '0px solid rgba(0,0,0,0)' : '1px solid rgba(255,255,255,0.1)']
    );

    const navbarOpacity = useTransform(scrollY, [0, 100], [1, 0.95]);
    const navbarBlur = useTransform(scrollY, [0, 100], [24, 32]);
    const navbarBg = useTransform(
        scrollY,
        [0, 100],
        ['rgba(255, 255, 255, 0.05)', isFeed ? '#050505' : 'rgba(18, 18, 18, 0.9)']
    );

    useEffect(() => {
        if (socket) {
            const handleNotification = () => setNotifications(prev => prev + 1);
            socket.on('new_message', handleNotification);
            socket.on('new_follower', handleNotification);
            return () => {
                socket.off('new_message', handleNotification);
                socket.off('new_follower', handleNotification);
            };
        }
    }, [socket]);

    const navItems = [
        { id: 'home', label: t('nav.home') || 'HOME', icon: LayoutGrid },
        { id: 'showcase', label: 'VİTRİN', icon: Zap },
        { id: 'shop', label: t('nav.shop') || 'SHOP', icon: ShoppingCart },
        { id: 'routes', label: t('nav.routes') || 'ROUTES', icon: Compass },
        { id: 'meetup', label: t('nav.events') || 'EVENTS', icon: Compass },
        { id: 'forum', label: t('nav.forum') || 'COMMUNITY', icon: LayoutGrid },
        { id: 'social-hub', label: 'HUB', icon: Compass }, // Keeping HUB for now or removing it? User said "Home" should be feed. HUB IS feed. So maybe remove HUB item if Home IS Hub?
        // Actually, if Home is the Feed, we don't need "HUB" anymore as a separate item.
        // But let's keep it for now to avoid confusion or just hide it?
        // "Home" now renders SocialHub. "HUB" also renders SocialHub.
        // Removing "HUB" item seems correct to avoid duplication.
    ];

    const activeIndex = navItems.findIndex(item => item.id === currentView);
    const itemWidth = 90; // Fixed width for each nav item to ensure alignment

    return (
        <>
            <motion.header
                style={{
                    width: navbarWidth,
                    top: navbarTop,
                    borderRadius: navbarRadius,
                    border: navbarBorder,
                    opacity: navbarOpacity,
                    backdropFilter: `blur(${navbarBlur}px)`,
                    backgroundColor: navbarBg
                }}
                initial={{ y: -100, x: '-50%' }}
                animate={{ y: 0, x: '-50%' }}
                className="fixed z-[999] h-16 shadow-[0_8px_32px_rgba(0,0,0,0.5),0_0_15px_rgba(249,115,22,0.1)] flex items-center justify-between px-8 transition-all duration-500"
            >
                {/* Neon Glow Accent */}
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/0 via-orange-500/5 to-orange-500/0 pointer-events-none" />

                {/* Left: Logo */}
                <div
                    className="flex items-center gap-3 cursor-pointer group"
                    onClick={() => onNavigate('home')}
                >
                    <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(249,115,22,0.5)] group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5 text-black fill-black" />
                    </div>
                    <span className="hidden md:block font-display font-black text-xl text-white tracking-[0.15em] uppercase">
                        MOTO<span className="text-orange-500">VIBE</span>
                    </span>
                </div>

                {/* Center: Navigation */}
                <nav className="hidden lg:flex items-center gap-0.5 relative h-10 px-1 bg-black/20 rounded-full border border-white/5">
                    {/* Sliding Hover Indicator (Active) */}
                    <AnimatePresence>
                        {activeIndex !== -1 && (
                            <motion.div
                                layoutId="nav-active-bg"
                                className="absolute bg-white/10 rounded-full h-8"
                                initial={false}
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                style={{
                                    width: `${itemWidth}px`,
                                    left: `${activeIndex * (itemWidth + 2) + 4}px`
                                }}
                            />
                        )}
                    </AnimatePresence>

                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => onNavigate(item.id as ViewState)}
                            className={`relative h-8 flex items-center justify-center text-[9px] font-black tracking-widest uppercase transition-colors group ${currentView === item.id ? 'text-white' : 'text-white/40 hover:text-white'
                                }`}
                            style={{ width: `${itemWidth}px` }}
                        >
                            <span className="relative z-10">{item.label}</span>
                            {currentView === item.id && (
                                <motion.div
                                    layoutId="nav-dot"
                                    className="absolute -bottom-1 w-1 h-1 bg-orange-500 rounded-full"
                                />
                            )}
                        </button>
                    ))}
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-2">
                    {/* Search */}
                    <Magnetic strength={0.2}>
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <Search className="w-5 h-5" />
                        </button>
                    </Magnetic>

                    {/* Notifications */}
                    <Magnetic strength={0.3}>
                        <button className="relative w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all">
                            <Bell className="w-5 h-5" />
                            {notifications > 0 && (
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-orange-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                            )}
                        </button>
                    </Magnetic>

                    <div className="w-[1px] h-6 bg-white/10 mx-2" />

                    {/* Cart */}
                    <Magnetic strength={0.2}>
                        <button
                            onClick={onCartClick}
                            className="relative w-10 h-10 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/5 transition-all"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-orange-500 text-black text-[8px] font-black w-4 h-4 flex items-center justify-center rounded-full shadow-lg">
                                    {cartCount}
                                </span>
                            )}
                        </button>
                    </Magnetic>

                    {/* User Profile / Auth */}
                    {isAuthenticated && user ? (
                        <div className="relative ml-2">
                            <button
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                                className="flex items-center gap-2 p-1 rounded-full border border-white/10 hover:border-orange-500/50 bg-white/5 transition-all group"
                            >
                                <div className="relative">
                                    <UserAvatar name={user.name} size={32} className="rounded-full" />
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#121212] shadow-sm" />
                                </div>
                                <ChevronDown className={`w-4 h-4 text-white/40 group-hover:text-white transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                            </button>

                            <AnimatePresence>
                                {isProfileOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full right-0 mt-4 w-60 bg-[#121212]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-[110] p-1"
                                    >
                                        <div className="p-4 mb-1 bg-white/5 rounded-xl border border-white/5">
                                            <p className="text-[9px] text-orange-500 font-black uppercase tracking-[0.2em] mb-1">{user.rank || 'MEMBER'}</p>
                                            <p className="text-sm font-bold text-white truncate">{user.name}</p>
                                        </div>

                                        <div className="space-y-0.5">
                                            {user.isAdmin && (
                                                <button onClick={() => { onNavigate('admin'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-xl transition-colors">
                                                    <ShieldCheck className="w-4 h-4" /> ADMIN PANEL
                                                </button>
                                            )}
                                            <button onClick={() => { onNavigate('profile'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors uppercase tracking-wider">
                                                <UserIcon className="w-4 h-4" /> My Profile
                                            </button>
                                            <button onClick={() => { onNavigate('profile'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors uppercase tracking-wider">
                                                <Warehouse className="w-4 h-4" /> My Garage
                                            </button>
                                            <button onClick={() => { onNavigate('settings' as any); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-colors uppercase tracking-wider">
                                                <Settings className="w-4 h-4" /> Settings
                                            </button>
                                        </div>

                                        <div className="h-[1px] bg-white/5 my-1 mx-2" />

                                        <button onClick={() => { logout(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-colors uppercase tracking-wider">
                                            <LogOut className="w-4 h-4" /> Logout
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onOpenAuth}
                            className="ml-2 relative group"
                        >
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-orange-600 to-orange-400 rounded-full blur-[2px] opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="relative px-6 py-2 bg-black rounded-full border border-white/10 flex items-center gap-2">
                                <span className="text-[10px] font-black text-white tracking-[0.2em] uppercase">Join Club</span>
                            </div>
                        </motion.button>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        onClick={onToggleMenu}
                        className="lg:hidden w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-white"
                    >
                        <LayoutGrid className="w-5 h-5" />
                    </button>
                </div>
            </motion.header>

            {/* Search Overlay Implementation */}
            <SearchOverlay
                isOpen={isSearchOpen}
                onClose={() => setIsSearchOpen(false)}
                onSearch={onSearch}
            />
        </>
    );
};