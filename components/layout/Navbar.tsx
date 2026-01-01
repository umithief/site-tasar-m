import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, ShoppingBag, Bell, User as UserIcon,
    Settings, LogOut, Menu, Zap, ChevronDown, Warehouse, ShieldCheck
} from 'lucide-react';
import { ViewState, User as UserType, ColorTheme } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { useSocket } from '../../hooks/useSocket';
import { useLanguage } from '../../contexts/LanguageProvider';
import { SearchOverlay } from './SearchOverlay';
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
    onToggleMenu?: () => void; // Used for Mobile Menu
    onToggleSidebar?: () => void; // New prop for Desktop Sidebar
}

export const Navbar: React.FC<NavbarProps> = ({
    cartCount,
    onCartClick,
    onOpenAuth,
    onNavigate,
    currentView,
    onToggleMenu,
    onToggleSidebar,
    onSearch
}) => {
    const { user, logout, isAuthenticated } = useAuthStore();
    const { socket } = useSocket();
    const { t } = useLanguage();

    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [notifications, setNotifications] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery);
        }
    };

    return (
        <header className="fixed top-0 left-0 w-full h-16 bg-[#0f0f0f] border-b border-white/5 z-[999] flex items-center justify-between px-4 lg:px-6">

            {/* Left: Menu & Logo */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 -ml-2 rounded-full hover:bg-white/10 text-white transition-colors hidden lg:block"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => onNavigate('home')}
                >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-orange-500">
                        <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <span className="font-display font-bold text-xl text-white tracking-tight relative -top-0.5">
                        MOTOVIBE
                    </span>
                </div>
            </div>

            {/* Center: Search Bar */}
            <div className="hidden md:flex flex-1 max-w-[720px] mx-10">
                <form onSubmit={handleSearchSubmit} className="w-full flex">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Ara"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-10 bg-[#121212] border border-[#303030] rounded-l-full px-4 text-white placeholder-zinc-500 focus:outline-none focus:border-[#1c62b9] focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)] transition-all ease-in-out duration-200"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hidden sm:block pointer-events-none">
                            {/* Potential Keyboard shortcut hint here */}
                        </div>
                    </div>
                    <button type="submit" className="h-10 px-6 bg-[#222222] border border-l-0 border-[#303030] rounded-r-full hover:bg-[#303030] transition-colors flex items-center justify-center">
                        <Search className="w-5 h-5 text-zinc-400" />
                    </button>
                </form>
                <button className="ml-4 w-10 h-10 rounded-full bg-[#181818] hover:bg-[#303030] flex items-center justify-center transition-colors shadow-sm">
                    <span className="sr-only">Voice Search</span>
                    <svg viewBox="0 0 24 24" height="24" width="24" className="block w-5 h-5 fill-white"><path d="M12 3c-1.66 0-3 1.34-3 3v8c0 1.66 1.34 3 3 3s3-1.34 3-3V6c0-1.66-1.34-3-3-3zm0 13.5c-2.48 0-4.5-2.02-4.5-4.5v-0.5c0-0.28-0.22-0.5-0.5-0.5s-0.5 0.22-0.5 0.5v0.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5v-0.5c0-0.28-0.22-0.5-0.5-0.5s-0.5 0.22-0.5 0.5v0.5c0 2.48-2.02 4.5-4.5 4.5zm0 5.5c-0.28 0-0.5-0.22-0.5-0.5s0.22-0.5 0.5-0.5 0.5 0.22 0.5 0.5-0.22 0.5-0.5 0.5z"></path><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"></path><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"></path></svg>
                </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1 sm:gap-2">

                {/* Mobile Search Toggle */}
                <button className="md:hidden p-2 rounded-full hover:bg-white/10 text-white">
                    <Search className="w-6 h-6" />
                </button>

                <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white relative transition-colors">
                    <Bell className="w-6 h-6" strokeWidth={1.5} />
                    {notifications > 0 && (
                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-[#cc0000] rounded-full border-2 border-[#0f0f0f]" />
                    )}
                </button>

                <button
                    onClick={onCartClick}
                    className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 text-white relative transition-colors"
                >
                    <ShoppingBag className="w-6 h-6" strokeWidth={1.5} />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-[#cc0000] text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full border-2 border-[#0f0f0f]">
                            {cartCount}
                        </span>
                    )}
                </button>

                {isAuthenticated && user ? (
                    <div className="relative ml-2">
                        <button
                            onClick={() => setIsProfileOpen(!isProfileOpen)}
                            className="flex items-center gap-2 pl-1 pr-0 py-1 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <UserAvatar name={user.name} src={user.avatar} size={32} className="rounded-full" />
                        </button>

                        <AnimatePresence>
                            {isProfileOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute top-full right-0 mt-2 w-72 bg-[#282828] border border-white/5 rounded-xl shadow-2xl overflow-hidden z-[110]"
                                >
                                    <div className="p-4 border-b border-white/10 flex items-center gap-3">
                                        <UserAvatar name={user.name} src={user.avatar} size={40} className="rounded-full" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-white font-medium truncate">{user.name}</p>
                                            <p className="text-zinc-400 text-sm truncate">@{user.username || 'user'}</p>
                                        </div>
                                    </div>

                                    <div className="py-2">
                                        {user.isAdmin && (
                                            <button onClick={() => { onNavigate('admin'); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
                                                <ShieldCheck className="w-5 h-5" /> Admin Panel
                                            </button>
                                        )}
                                        {/* Removed Profile/Garage links requested by user */}
                                        <button onClick={() => { onNavigate('settings' as any); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
                                            <Settings className="w-5 h-5" /> Ayarlar
                                        </button>
                                    </div>

                                    <div className="border-t border-white/10 py-2">
                                        <button onClick={() => { logout(); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10">
                                            <LogOut className="w-5 h-5" /> Oturumu kapat
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <button
                        onClick={onOpenAuth}
                        className="ml-2 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 flex items-center gap-2 text-blue-400 font-medium text-sm transition-colors"
                    >
                        <UserIcon className="w-5 h-5 border rounded-full border-blue-400 p-0.5" />
                        Oturum aç
                    </button>
                )}
            </div>
        </header>
    );
};