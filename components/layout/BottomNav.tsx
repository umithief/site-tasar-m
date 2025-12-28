import React, { useEffect, useState } from 'react';
import { Home, Search, Plus, Film, User, Zap, ShoppingBag, Map as MapIcon } from 'lucide-react';
import { ViewState, User as UserType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageProvider';

interface SidebarProps {
    currentView: ViewState;
    onNavigate: (view: ViewState) => void;
    cartCount: number;
    isOpen: boolean;
    onClose: () => void;
    user: UserType | null;
    onOpenAuth: () => void;
    onOpenFeedback: () => void;
    onToggle: () => void;
    onOpenThemeModal?: () => void;
}

export const BottomNav: React.FC<SidebarProps> = ({
    currentView,
    onNavigate,
    user,
    onOpenAuth
}) => {

    // Determine which tab is technically "active" for highlighting
    // If the user is on 'shop' or 'product-detail', we might highlight 'search' (explore) or similar logic if desired.
    // For now, simple mapping.
    const getActiveTab = () => {
        if (currentView === 'home') return 'home';
        if (currentView === 'shop' || currentView === 'explore' || currentView === 'product-detail') return 'shop';
        if (currentView === 'routes' || currentView === 'ride-mode') return 'routes';
        if (currentView === 'profile' || currentView === 'my-profile' || currentView === 'auth') return 'profile';
        // 'create' is a modal/action, usually doesn't stay highlighted unless it's a dedicated view
        return currentView;
    };

    const activeTab = getActiveTab();

    const navItems = [
        { id: 'home', icon: Home, label: 'Home', view: 'home' },
        { id: 'shop', icon: ShoppingBag, label: 'Shop', view: 'shop' },
        { id: 'create', icon: Plus, label: 'Create', isFab: true },
        { id: 'routes', icon: MapIcon, label: 'Routes', view: 'routes' },
        { id: 'profile', icon: User, label: 'Profile', view: user ? 'profile' : 'auth' },
    ];

    const [isFabOpen, setIsFabOpen] = useState(false);

    const handleNavClick = (item: any) => {
        if (item.id === 'create') {
            setIsFabOpen(!isFabOpen);
        } else if (item.id === 'profile') {
            if (user) onNavigate('profile');
            else onOpenAuth();
            setIsFabOpen(false);
        } else {
            onNavigate(item.view);
            setIsFabOpen(false);
        }
    };

    const fabItems = [
        { id: 'ride', label: 'Sürüş Modu', icon: MapIcon, color: 'bg-green-500', view: 'ride-mode' },
        { id: 'reels', label: 'Reels', icon: Film, color: 'bg-pink-500', view: 'reels' },
        { id: 'post', label: 'Yeni Gönderi', icon: Plus, color: 'bg-blue-500', view: 'social-hub' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[140]">
            {/* Create Menu Backdrop */}
            <AnimatePresence>
                {isFabOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsFabOpen(false)}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[-1]"
                    />
                )}
            </AnimatePresence>

            {/* Create Menu Items */}
            <AnimatePresence>
                {isFabOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="absolute bottom-24 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-50 w-full max-w-[200px]"
                    >
                        {[
                            { id: 'ride-mode', label: 'Sürüş Modu', icon: MapIcon, color: 'text-moto-accent', view: 'ride-mode' },
                            { id: 'reels', label: 'Reels', icon: Film, color: 'text-pink-500', view: 'reels' },
                            { id: 'post', label: 'Yeni Gönderi', icon: Plus, color: 'text-blue-400', view: 'social-hub' }
                        ].map((item, index) => (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onNavigate(item.view as any);
                                    setIsFabOpen(false);
                                }}
                                className="w-full bg-[#1A1A17]/90 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-4 shadow-xl active:scale-95 transition-transform"
                            >
                                <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center ${item.color}`}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                <span className="text-white font-bold text-lg">{item.label}</span>
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Glassmorphism Background */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-xl border-t border-white/10" />

            <div className="relative flex justify-between items-end h-16 px-4">
                {navItems.map((item) => {
                    const isActive = activeTab === item.id;

                    // FAB (Center Item)
                    if (item.isFab) {
                        return (
                            <div key={item.id} className="relative -top-6 flex justify-center w-[20%]">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleNavClick(item)}
                                    animate={{ rotate: isFabOpen ? 45 : 0 }}
                                    className={`w-14 h-14 rounded-full ${isFabOpen ? 'bg-red-500 border-red-900' : 'bg-moto-accent border-black'} text-white flex items-center justify-center shadow-[0_0_20px_rgba(0,0,0,0.5)] border-4 z-50 transition-colors duration-300`}
                                >
                                    <Plus className="w-8 h-8" strokeWidth={3} />
                                </motion.button>
                            </div>
                        )
                    }

                    // Standard Icon
                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item)}
                            className="flex-1 flex flex-col items-center justify-center h-full w-[20%] relative group"
                        >
                            <motion.div
                                animate={isActive ? { scale: 1.2, y: -4 } : { scale: 1, y: 0 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                                className="relative p-2"
                            >
                                <item.icon
                                    className={`w-6 h-6 transition-colors duration-300 ${isActive
                                        ? 'text-moto-accent stroke-[2.5px] drop-shadow-[0_0_8px_var(--moto-accent)]'
                                        : 'text-gray-400'
                                        }`}
                                />

                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabDot"
                                        className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-moto-accent rounded-full shadow-[0_0_8px_currentColor]"
                                    />
                                )}
                            </motion.div>
                        </button>
                    )
                })}
            </div>
        </div>
    );
};
