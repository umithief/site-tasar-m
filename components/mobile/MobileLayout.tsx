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
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0">
            {/* Mobile Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-gray-100 z-50 flex items-center justify-between px-4 lg:hidden">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsDrawerOpen(true)}
                        className="p-2 -ml-2 text-gray-700 hover:bg-gray-50 rounded-full transition-colors"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <span className="text-xl font-display font-black italic tracking-tighter text-gray-900">
                        MOTO<span className="text-blue-600">VIBE</span>
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <button onClick={() => handleNavigate('notifications')} className="p-2 relative text-gray-700 hover:bg-gray-50 rounded-full transition-colors">
                        <Bell className="w-6 h-6" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                        )}
                    </button>
                </div>
            </header>

            {/* Mobile Drawer */}
            <DashboardDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                user={user || authUser}
            />

            {/* Main Content */}
            <main className="pt-16 lg:pt-0 min-h-screen bg-transparent">
                {children}
            </main>

            {/* Bottom Navigation Bar */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 pb-safe z-50 lg:hidden shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                <div className="flex items-center justify-around h-16 px-2">
                    <button
                        onClick={() => handleNavigate('home')}
                        className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('home') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <div className="relative p-1.5">
                            <Home className={`w-6 h-6 ${isActive('home') ? 'fill-current' : ''}`} strokeWidth={isActive('home') ? 2.5 : 2} />
                            {isActive('home') && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-blue-50 rounded-xl -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </div>
                        <span className="text-[10px] font-bold">Akış</span>
                    </button>

                    <button
                        onClick={() => handleNavigate('explore')}
                        className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('explore') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <div className="relative p-1.5">
                            <Compass className={`w-6 h-6 ${isActive('explore') ? 'fill-current' : ''}`} strokeWidth={isActive('explore') ? 2.5 : 2} />
                            {isActive('explore') && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-blue-50 rounded-xl -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </div>
                        <span className="text-[10px] font-bold">Keşfet</span>
                    </button>

                    <button
                        onClick={() => handleNavigate('create')}
                        className="relative -top-6"
                    >
                        <div className="w-14 h-14 rounded-full bg-gray-900 flex items-center justify-center shadow-lg shadow-gray-300 transform transition-transform active:scale-95 border-4 border-gray-50">
                            <PlusSquare className="w-6 h-6 text-white" />
                        </div>
                    </button>

                    <button
                        onClick={() => handleNavigate('shop')}
                        className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('shop') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <div className="relative p-1.5">
                            <ShoppingBag className={`w-6 h-6 ${isActive('shop') ? 'fill-current' : ''}`} strokeWidth={isActive('shop') ? 2.5 : 2} />
                            {isActive('shop') && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-blue-50 rounded-xl -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </div>
                        <span className="text-[10px] font-bold">Mağaza</span>
                    </button>

                    <button
                        onClick={() => handleNavigate('my-profile')}
                        className={`relative flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${isActive('my-profile') || isActive('profile') ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
                    >
                        <div className="relative p-1.5">
                            <User className={`w-6 h-6 ${isActive('my-profile') || isActive('profile') ? 'fill-current' : ''}`} strokeWidth={isActive('my-profile') || isActive('profile') ? 2.5 : 2} />
                            {(isActive('my-profile') || isActive('profile')) && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-blue-50 rounded-xl -z-10"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </div>
                        <span className="text-[10px] font-bold">Profil</span>
                    </button>
                </div>
            </nav>
        </div>
    );
};
