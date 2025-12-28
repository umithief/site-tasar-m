import React, { useEffect, useState } from 'react';
import { Home, Search, Plus, Film, User, Zap, ShoppingBag } from 'lucide-react';
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
        if (currentView === 'shop' || currentView === 'explore') return 'shop';
        if (currentView === 'reels') return 'reels';
        if (currentView === 'profile' || currentView === 'my-profile' || currentView === 'auth') return 'profile';
        // 'create' is a modal/action, usually doesn't stay highlighted unless it's a dedicated view
        return currentView;
    };

    const activeTab = getActiveTab();

    const navItems = [
        { id: 'home', icon: Home, label: 'Home', view: 'home' },
        { id: 'shop', icon: ShoppingBag, label: 'Shop', view: 'shop' },
        { id: 'create', icon: Plus, label: 'Create', isFab: true },
        { id: 'reels', icon: Film, label: 'Reels', view: 'reels' },
        { id: 'profile', icon: User, label: 'Profile', view: user ? 'profile' : 'auth' },
    ];

    const handleNavClick = (item: any) => {
        if (item.id === 'create') {
            onNavigate('ride-mode'); // Or 'create' view if it exists, user mentioned 'Create (Center FAB)'
        } else if (item.id === 'profile') {
            if (user) onNavigate('profile');
            else onOpenAuth();
        } else {
            onNavigate(item.view);
        }
    };

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-[140]">
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
                                    className="w-14 h-14 rounded-full bg-moto-accent text-white flex items-center justify-center shadow-[0_0_20px_var(--moto-accent)] border-4 border-black z-10"
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
