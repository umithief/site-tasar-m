import React, { useState, useEffect } from 'react';
import { Home } from './components/Home';
import { Navbar } from './components/layout/Navbar';
import { ProductDetail } from './components/ProductDetail';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { AuthModal } from './components/AuthModal';
import { ProfilePage } from './components/social/ProfilePage';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { Product, User, ViewState } from './types';
import { authService } from './services/auth';
import { productService } from './services/productService';
import { AnimatePresence } from 'framer-motion';
import { SocialHub } from './components/social/SocialHub';
import { AdminPanel } from './components/AdminPanel';
import { Shop } from './components/shop/Shop';
import { Showcase } from './components/Showcase';
import { Forum } from './components/forum/Forum';
import { Events } from './components/events/Events';
import { RouteExplorer } from './components/RouteExplorer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Garage } from './components/garage/Garage';
import { ReelsPage } from './components/reels/ReelsPage';

import { RideMode } from './components/RideMode';
import { useAuthStore } from './store/authStore';

export const App: React.FC = () => {
    const [view, setView] = useState<ViewState>('home');
    const { user, logout, isAuthenticated } = useAuthStore();
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeRoute, setActiveRoute] = useState<any | null>(null); // Route type might need import or be any for now to avoid conflicts
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    useEffect(() => {
        // Initial check if needed, but Zustand persist handles hydration
        // We can check if token exists but user is null (edge case)
    }, []);

    const addToast = (type: ToastType, message: string) => {
        const newToast: ToastMessage = { id: Date.now(), type, message };
        setToasts(prev => [...prev.slice(-3), newToast]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleLogin = (user: User) => {
        // useAuthStore is already updated by AuthModal interacting with store,
        // or passing the user here is redundant if AuthModal calls store.login
        // But for safety/legacy compatibility:
        useAuthStore.getState().setUser(user);
        setIsAuthOpen(false);
        addToast('success', `Hoş geldin, ${user.name}!`);
    };

    const handleLogout = () => {
        logout();
        setView('home');
        addToast('info', 'Çıkış yapıldı.');
    };

    const navigateTo = (newView: ViewState) => {
        setView(newView);
        window.scrollTo(0, 0);
    };

    // Render Logic Helper
    const renderContent = () => {
        switch (view) {
            case 'home':
                return (
                    <Home
                        onNavigate={navigateTo}
                        products={[]}
                        onAddToCart={() => { }}
                        onProductClick={(p: any) => setSelectedProduct(p)}
                        favoriteIds={[]}
                        onToggleFavorite={() => { }}
                        onQuickView={() => { }}
                        onCompare={() => { }}
                        compareList={[]}
                        onToggleMenu={() => { }}
                    />
                );
            case 'admin':
                return user?.isAdmin ? (
                    <ErrorBoundary>
                        <AdminPanel
                            onLogout={handleLogout}
                            onShowToast={addToast}
                            onNavigate={navigateTo}
                        />
                    </ErrorBoundary>
                ) : (
                    <div className="pt-32 text-center text-gray-500">Yetkisiz erişim.</div>
                );
            case 'social-hub':
                return <SocialHub user={user} onNavigate={navigateTo} />;
            case 'routes':
                return <RouteExplorer
                    user={user}
                    onOpenAuth={() => setIsAuthOpen(true)}
                    onStartRide={(route) => {
                        setActiveRoute(route);
                        navigateTo('ride-mode');
                    }}
                />;
            case 'profile':
                if (!user) {
                    setTimeout(() => setIsAuthOpen(true), 100);
                    return null;
                }
                return <ProfilePage userId={user._id} onNavigate={navigateTo as any} />;
            case 'shop':
                return (
                    <Shop
                        onNavigate={navigateTo}
                        onAddToCart={(product) => {
                            addToast('success', `${product.name} sepete eklendi.`);
                            // In real app, update global cart state here
                        }}
                        onProductClick={(p) => setSelectedProduct(p)}
                        favoriteIds={[]}
                        onToggleFavorite={(id) => {
                            addToast('success', 'Favorilere eklendi (Demo)');
                        }}
                    />
                );
            case 'forum':
                return (
                    <Forum
                        onNavigate={navigateTo}
                        user={user}
                        onOpenAuth={() => setIsAuthOpen(true)}
                    />
                );
            case 'meetup': // Mapping 'meetup' view to Events component as per design
            case 'events': // Fallback if type suggests events
                return (
                    <Events
                        onNavigate={navigateTo}
                        user={user}
                        onOpenAuth={() => setIsAuthOpen(true)}
                    />
                );
            case 'blog':
            case 'riders':
            case 'favorites':
            case 'cart':
            case 'checkout':
            case 'product-detail':
                return (
                    <ProductDetail
                        product={selectedProduct}
                        allProducts={[]} // Pass all products if available or empty array
                        onAddToCart={(product) => addToast('success', `${product.name} sepete eklendi.`)}
                        onNavigate={navigateTo}
                        onProductClick={setSelectedProduct}
                    />
                );
            case 'ride-mode':
                return <RideMode route={activeRoute} onNavigate={navigateTo} />;
            case 'mototool':
            case 'about':
            case 'ai-assistant':
            case 'meetup':
            case 'service-finder':
            case 'valuation':
            case 'qr-generator':
            case 'vlog-map':
            case 'lifesaver':
            case 'showcase':
                return (
                    <Showcase
                        products={[]} // Pass products here, using empty array for now as Home does
                        onAddToCart={(product) => addToast('success', `${product.name} sepete eklendi.`)}
                        onProductClick={setSelectedProduct}
                        favoriteIds={[]}
                        onToggleFavorite={() => { }}
                        onQuickView={setSelectedProduct}
                        onCompare={() => { }}
                        compareList={[]}
                        onNavigate={navigateTo}
                        onToggleMenu={() => { }}
                    />
                );
            case 'reels':
                return <ReelsPage onNavigate={navigateTo} />;
            case 'explore':
            case 'create':
                return (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
                        <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                            <span className="text-2xl">🚧</span>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Yapım Aşamasında</h2>
                        <p className="text-gray-400 mb-6 max-w-md">
                            "{view}" sayfası şu anda geliştirme aşamasındadır. Çok yakında sizlerle olacak.
                        </p>
                        <button
                            onClick={() => navigateTo('home')}
                            className="px-6 py-2 bg-moto-accent text-black rounded-xl font-bold hover:bg-white transition-colors"
                        >
                            Ana Sayfaya Dön
                        </button>
                    </div>
                );
            case 'garage':
                return <Garage />;
            default:
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] text-white">
            <Navbar
                cartCount={0}
                favoritesCount={0}
                onCartClick={() => { }}
                onFavoritesClick={() => { }}
                onSearch={() => { }}
                onOpenAuth={() => setIsAuthOpen(true)}
                onNavigate={navigateTo}
                currentView={view}
                colorTheme="orange"
                onColorChange={() => { }}
                onToggleMenu={() => { }}
            />

            <main className="pt-20">
                {renderContent()}
            </main>

            <AuthModal
                isOpen={isAuthOpen}
                onClose={() => setIsAuthOpen(false)}
                onLogin={handleLogin}
                initialMode="login"
            />

            <ProductQuickViewModal
                isOpen={!!selectedProduct && view !== 'product-detail'}
                product={selectedProduct}
                onClose={() => setSelectedProduct(null)}
                onAddToCart={(product) => {
                    addToast('success', `${product.name} sepete eklendi.`);
                    setSelectedProduct(null);
                }}
                onViewDetail={(product) => navigateTo('product-detail')}
            />

            <ToastContainer toasts={toasts} onRemove={removeToast} />
        </div>
    );
};
