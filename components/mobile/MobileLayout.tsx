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

            {/* Premium Fixed-Bottom Navigation Rail - Light/Glass */}
            <nav className="fixed bottom-0 left-0 w-full h-auto min-h-[60px] bg-white/95 backdrop-blur-2xl border-t border-gray-200 z-50 pb-safe lg:hidden flex items-end justify-center shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <div className="w-full max-w-md flex items-end justify-around px-2 pb-1 relative h-14">

                    {/* 1. Home */}
                    <button
                        onClick={() => handleNavigate('home')}
                        className="relative w-14 h-14 flex items-center justify-center"
                    >
                        <motion.div whileTap={{ scale: 0.9 }}>
                            <div className={`relative flex items-center justify-center w-12 h-8 rounded-full ${isActive('home') ? '' : ''}`}>
                                {isActive('home') && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-black/5 rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Home
                                    className={`w-6 h-6 transition-colors ${isActive('home') ? 'text-black fill-black/5' : 'text-gray-400'}`}
                                    strokeWidth={isActive('home') ? 2.5 : 2}
                                />
                            </div>
                        </motion.div>
                    </button>

                    {/* 2. Explore */}
                    <button
                        onClick={() => handleNavigate('explore')}
                        className="relative w-14 h-14 flex items-center justify-center"
                    >
                        <motion.div whileTap={{ scale: 0.9 }}>
                            <div className="relative flex items-center justify-center w-12 h-8 rounded-full">
                                {isActive('explore') && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-black/5 rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <Compass
                                    className={`w-6 h-6 transition-colors ${isActive('explore') ? 'text-black fill-black/5' : 'text-gray-400'}`}
                                    strokeWidth={isActive('explore') ? 2.5 : 2}
                                />
                            </div>
                        </motion.div>
                    </button>

                    {/* 3. Center Action (Create) */}
                    <button
                        onClick={() => handleNavigate('create')}
                        className="relative w-14 h-14 flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <motion.div
                            whileTap={{ scale: 0.95 }}
                            animate={{ rotate: isActive('create') ? 90 : 0 }}
                        >
                            <PlusSquare
                                className="w-8 h-8 text-black drop-shadow-lg"
                                strokeWidth={2}
                                fill="currentColor"
                                fillOpacity={0.1}
                            />
                        </motion.div>
                    </button>

                    {/* 4. Shop */}
                    <button
                        onClick={() => handleNavigate('shop')}
                        className="relative w-14 h-14 flex items-center justify-center"
                    >
                        <motion.div whileTap={{ scale: 0.9 }}>
                            <div className="relative flex items-center justify-center w-12 h-8 rounded-full">
                                {isActive('shop') && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-black/5 rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <ShoppingBag
                                    className={`w-6 h-6 transition-colors ${isActive('shop') ? 'text-black fill-black/5' : 'text-gray-400'}`}
                                    strokeWidth={isActive('shop') ? 2.5 : 2}
                                />
                            </div>
                        </motion.div>
                    </button>

                    {/* 5. Profile */}
                    <button
                        onClick={() => handleNavigate('my-profile')}
                        className="relative w-14 h-14 flex items-center justify-center"
                    >
                        <motion.div whileTap={{ scale: 0.9 }}>
                            <div className="relative flex items-center justify-center w-12 h-8 rounded-full">
                                {(isActive('my-profile') || isActive('profile')) && (
                                    <motion.div
                                        layoutId="nav-pill"
                                        className="absolute inset-0 bg-black/5 rounded-full"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <User
                                    className={`w-6 h-6 transition-colors ${isActive('my-profile') || isActive('profile') ? 'text-black fill-black/5' : 'text-gray-400'}`}
                                    strokeWidth={isActive('my-profile') || isActive('profile') ? 2.5 : 2}
                                />
                            </div>
                        </motion.div>
                    </button>

                </div>
            </nav>
        </div>
    );
};
