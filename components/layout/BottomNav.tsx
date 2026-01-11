import React, { useEffect, useState } from 'react';
import { Home, Search, Plus, Film, User, Zap, ShoppingBag, Map as MapIcon, Compass, Navigation, ShoppingCart, Wrench, Menu } from 'lucide-react';
import { ViewState, User as UserType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageProvider';
import { MobileSideMenu } from './MobileSideMenu';

interface SidebarProps {
    currentView: ViewState;
    onNavigate: (view: ViewState) => void;
    isOpen: boolean; // Managed by parent or internal? We'll manage internal for menu
    onClose: () => void;
    user: UserType | null;
    onOpenAuth: () => void;
    onOpenFeedback: () => void;
    onToggle: () => void;
    cartCount: number;
}

export const BottomNav: React.FC<SidebarProps> = ({
    currentView,
    onNavigate,
    user,
    onOpenAuth,
    cartCount
}) => {

    const getActiveTab = () => {
        if (currentView === 'home') return 'home';
        if (currentView === 'shop' || currentView === 'product-detail') return 'shop';
        if (currentView === 'explore') return 'explore';
        // Profile logic
        return currentView;
    };

    const activeTab = getActiveTab();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isFabOpen, setIsFabOpen] = useState(false); // For "Create" modal if needed, or we might drop it for menu? Keeping Fab logic for center button

    // Nav Items - Fixed Layout
    const navItems = [
        { id: 'home', icon: Home, label: 'Ana Sayfa', view: 'home' },
        { id: 'explore', icon: Compass, label: 'Keşfet', view: 'explore' },
        { id: 'create', icon: Plus, label: 'Oluştur', isFab: true }, // Center FAB
        { id: 'shop', icon: ShoppingBag, label: 'Mağaza', view: 'shop' },
        { id: 'menu', icon: Menu, label: 'Menü', isMenu: true }, // New Menu Trigger
    ];


    const handleNavClick = (item: any) => {
        if (item.id === 'create') {
            // Handle Create Action (Modal or View)
            // For now, let's keep the existing "Fab" logic or just navigate to create
            onNavigate('create'); // Or social-hub create mode
        } else if (item.isMenu) {
            setIsMenuOpen(true);
        } else {
            onNavigate(item.view);
        }
    };

    return (
        <>
            {/* Side Menu Component */}
            <MobileSideMenu
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onNavigate={onNavigate}
            />

            {/* Fixed Bottom Bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[140] bg-black border-t border-white/10 pb-safe-bottom">
                {/* Glass Reflection Top */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />

                <div className="flex items-end justify-between px-2 h-[60px] pb-2 relative">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;

                        // Center FAB (Lifted)
                        if (item.isFab) {
                            return (
                                <div key={item.id} className="relative -top-5">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleNavClick(item)}
                                        className="w-14 h-14 rounded-full bg-[#E2FF3B] text-black flex items-center justify-center shadow-[0_0_20px_rgba(226,255,59,0.4)] border-4 border-black"
                                    >
                                        <Plus className="w-7 h-7" strokeWidth={3} />
                                    </motion.button>
                                </div>
                            );
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className="flex-1 flex flex-col items-center justify-center gap-1 py-1 active:scale-95 transition-transform"
                            >
                                <div className={`relative p-1.5 rounded-xl transition-colors ${isActive ? 'bg-white/10' : 'bg-transparent'}`}>
                                    <item.icon
                                        className={`w-6 h-6 ${isActive ? 'text-[#E2FF3B]' : 'text-zinc-500'}`}
                                        strokeWidth={isActive ? 2.5 : 2}
                                    />
                                    {/* Badge for Menu if needed */}
                                    {item.id === 'shop' && cartCount > 0 && (
                                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] flex items-center justify-center text-white font-bold border-2 border-black">
                                            {cartCount}
                                        </div>
                                    )}
                                </div>
                                <span className={`text-[10px] font-medium ${isActive ? 'text-white' : 'text-zinc-600'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
};
