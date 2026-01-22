import React, { useEffect, useState } from 'react';
import { Home, Compass, PlusSquare, ShoppingBag, User, Bell, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useNotificationStore } from '../../store/useNotificationStore';
import { AnimatePresence, motion } from 'framer-motion';
import { DashboardDrawer } from '../dashboard/DashboardDrawer';

interface MobileLayoutProps {
    children?: React.ReactNode;
    currentView?: string;
    onNavigate?: (view: any) => void;
    user?: any;
    cartCount?: number;
    onOpenAuth?: () => void;
    onOpenFeedback?: () => void;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children, currentView, onNavigate, user, cartCount }) => {
    const { user: authUser } = useAuthStore();
    const { unreadCount, fetchNotifications } = useNotificationStore();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    useEffect(() => {
        // fetchNotifications();
        // const interval = setInterval(fetchNotifications, 30000);
        // return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleNavigate = (view: string) => {
        if (onNavigate) {
            onNavigate(view);
        }
    };

    const isActive = (view: string) => {
        return currentView === view;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black pb-20 md:pb-0 transition-colors duration-300">
            {/* Mobile Header Removed as per user request */}
            {/* <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 dark:bg-black/90 backdrop-blur-md border-b border-gray-100 dark:border-white/10 z-50 flex items-center justify-between px-4 lg:hidden transition-colors">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="p-2 -ml-2 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="text-xl font-display font-black italic tracking-tighter text-gray-900 dark:text-white">
                        MOTO<span className="text-moto-accent">VIBE</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => handleNavigate('notifications')} className="p-2 relative text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 rounded-full transition-colors">
                        <Bell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-black animate-pulse" />
                        )}
                    </button>
                </div>
            </header> */}

            {/* Mobile Drawer */}
            <DashboardDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                user={user || authUser}
            />

            {/* Main Content */}
            <main className="pt-0 lg:pt-0 min-h-screen bg-transparent">
                {children}
            </main>

            {/* Bottom Navigation Bar - Floating / Native Feel */}
            <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
                <nav className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/20 overflow-hidden">
                    <div className="flex items-center justify-around h-16 px-1">
                        <button
                            onClick={() => handleNavigate('home')}
                            className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-95 ${isActive('home') ? 'text-moto-accent' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            <div className="relative p-2 rounded-xl">
                                <Home className={`w-6 h-6 ${isActive('home') ? 'fill-current' : ''}`} strokeWidth={isActive('home') ? 2.5 : 2} />
                                {isActive('home') && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        className="absolute inset-0 bg-moto-accent/15 rounded-xl -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </div>
                        </button>

                        <button
                            onClick={() => handleNavigate('explore')}
                            className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-95 ${isActive('explore') ? 'text-moto-accent' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            <div className="relative p-2 rounded-xl">
                                <Compass className={`w-6 h-6 ${isActive('explore') ? 'fill-current' : ''}`} strokeWidth={isActive('explore') ? 2.5 : 2} />
                                {isActive('explore') && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        className="absolute inset-0 bg-moto-accent/15 rounded-xl -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </div>
                        </button>

                        <button
                            onClick={() => handleNavigate('create')}
                            className="relative -top-5 active:scale-90 transition-transform"
                        >
                            <div className="w-14 h-14 rounded-2xl bg-moto-accent flex items-center justify-center shadow-lg shadow-moto-accent/30 rotate-45 border-4 border-[#050505]">
                                <PlusSquare className="w-7 h-7 text-black -rotate-45" strokeWidth={2.5} />
                            </div>
                        </button>

                        <button
                            onClick={() => handleNavigate('shop')}
                            className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-95 ${isActive('shop') ? 'text-moto-accent' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            <div className="relative p-2 rounded-xl">
                                <ShoppingBag className={`w-6 h-6 ${isActive('shop') ? 'fill-current' : ''}`} strokeWidth={isActive('shop') ? 2.5 : 2} />
                                {isActive('shop') && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        className="absolute inset-0 bg-moto-accent/15 rounded-xl -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </div>
                        </button>

                        <button
                            onClick={() => handleNavigate('my-profile')}
                            className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-all active:scale-95 ${isActive('my-profile') || isActive('profile') ? 'text-moto-accent' : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'}`}
                        >
                            <div className="relative p-2 rounded-xl">
                                <User className={`w-6 h-6 ${isActive('my-profile') || isActive('profile') ? 'fill-current' : ''}`} strokeWidth={isActive('my-profile') || isActive('profile') ? 2.5 : 2} />
                                {(isActive('my-profile') || isActive('profile')) && (
                                    <motion.div
                                        layoutId="nav-bg"
                                        className="absolute inset-0 bg-moto-accent/15 rounded-xl -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </div>
                        </button>
                    </div>
                </nav>
            </div>
        </div>
    );
};
