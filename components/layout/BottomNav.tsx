import React from 'react';
import { Home, Compass, Plus, Film, Warehouse, Menu, User, Zap } from 'lucide-react';
import { ViewState, User as UserType } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from '../ui/UserAvatar';
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
    onToggle
}) => {
    const { t } = useLanguage();

    const navItems = [
        { id: 'home', icon: Home, label: 'Home' },
        { id: 'explore', icon: Compass, label: 'Explore' }, // Mapped to a suitable view later
        { id: 'create', icon: Plus, label: 'Add', isFab: true }, // Action to open create menu
        { id: 'reels', icon: Film, label: 'Reels' },
        { id: 'garage', icon: Warehouse, label: 'Garage' },
    ];

    return (
        <>
            {/* --- MOBILE BOTTOM NAV --- */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-[140] pb-safe-bottom">
                {/* Blurry Background */}
                <div className="absolute inset-0 bg-black/90 backdrop-blur-lg border-t border-white/10"></div>

                <div className="relative flex justify-between items-end h-[65px] px-2 pb-1">
                    {navItems.map((item) => {
                        const isActive = currentView === item.id;

                        if (item.isFab) {
                            return (
                                <div key={item.id} className="relative -top-5 flex justify-center w-[20%]">
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => onNavigate('create' as ViewState)} // Toggle create menu
                                        className="w-14 h-14 rounded-full bg-gradient-to-tr from-moto-accent to-orange-600 text-black flex items-center justify-center shadow-[0_0_20px_rgba(255,87,34,0.4)] border-4 border-black z-10"
                                    >
                                        <Plus className="w-8 h-8" strokeWidth={3} />
                                    </motion.button>
                                </div>
                            )
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id as ViewState)}
                                className={`flex-1 flex flex-col items-center justify-center gap-1 h-full w-[20%] transition-colors duration-300 relative group`}
                            >
                                <div className={`relative p-1.5 transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                                    <item.icon
                                        className={`w-6 h-6 transition-all duration-300 ${isActive ? 'text-moto-accent stroke-[2.5px]' : 'text-gray-500'}`}
                                    />
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 bg-moto-accent rounded-full shadow-[0_0_10px_currentColor]"
                                        />
                                    )}
                                </div>
                            </button>
                        )
                    })}
                </div>
            </div>
        </>
    );
};
