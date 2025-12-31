// Main Application Component
import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, ProductCategory, User, AuthMode, Route as RouteType, ViewState, ColorTheme } from './types';
import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { CartDrawer } from './components/layout/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { UserProfile } from './components/social/UserProfile';
import { ProfilePage } from './components/social/ProfilePage';
import { MyProfile } from './components/social/MyProfile';
import { PublicProfile } from './components/PublicProfile'; // Keeping for reference if needed, but ProfilePage replaces it for viewing others
import { About } from './components/About';
import { Forum } from './components/Forum';
import { AdminPanel } from './components/AdminPanel';
import { ProductQuickViewModal } from './components/ProductQuickViewModal';
import { ToastType, ToastContainer, ToastMessage } from './components/Toast';
import { RideMode } from './components/RideMode';
import { MotoTool } from './components/MotoTool';
import { RouteExplorer } from './components/RouteExplorer';
import { MobileOnboarding } from './components/mobile/MobileOnboarding';
import { MobileRoutes } from './components/mobile/MobileRoutes';
import { MobileAuth } from './components/mobile/MobileAuth';
import { MotoMeetup } from './components/MotoMeetup';
import { FlyToCart } from './components/FlyToCart';
import { Blog } from './components/Blog';
import { ServiceFinder } from './components/ServiceFinder';
import { IntroAnimation } from './components/IntroAnimation';
import { OnboardingTour } from './components/OnboardingTour';
import { CompareBar } from './components/CompareBar';
import { CompareModal } from './components/CompareModal';
import { ScrollProgress } from './components/ScrollProgress';
import { ProModal } from './components/ProModal';
import { FeedbackModal } from './components/FeedbackModal';
import { MotoValuation } from './components/MotoValuation';
import { ThemeModal } from './components/ThemeModal';
import { HelmetQRGenerator } from './components/HelmetQRGenerator';
import { MotoVlogMap } from './components/MotoVlogMap';
import { LifeSaver } from './components/LifeSaver';
import { LivingBackground } from './components/LivingBackground';
import { RidersDirectory } from './components/RidersDirectory';
import { SocialHub } from './components/social/SocialHub';
import { authService } from './services/auth';
import { orderService } from './services/orderService';
import { productService } from './services/productService';
import { statsService } from './services/statsService';
import { tourService } from './services/tourService';
import { recordingService } from './services/recordingService';
import { notify } from './services/notificationService';
import { gamificationService } from './services/gamificationService';
import { useAuthStore } from './store/authStore';
import { useAppSounds } from './hooks/useAppSounds';
import { ArrowUp, Zap, Instagram, Twitter, Youtube, Facebook, MapPin, Phone, Mail } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLivingTime } from './hooks/useLivingTime';

// Import Components
import { Home } from './components/Home';
import { Showcase } from './components/Showcase';
import { AuthPage } from './components/AuthPage';
import { Shop } from './components/Shop';
import { MobileShop } from './components/mobile/MobileShop';
import { Favorites } from './components/Favorites';
import { AIAssistantPage } from './components/AIAssistantPage';
import { ProductDetail } from './components/ProductDetail';
import { SocketProvider } from './context/SocketContext';
import { MobileLayout } from './components/mobile/MobileLayout';
import { MobileExplore } from './components/mobile/MobileExplore';

=======
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
>>>>>>> restore-2025-12-25
import { ReelsPage } from './components/reels/ReelsPage';
import { MobileProductDetail } from './components/mobile/MobileProductDetail';
import { CartBottomSheet } from './components/mobile/CartBottomSheet';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderTracking } from './components/checkout/OrderTracking';

import { RideMode } from './components/RideMode';
import { useAuthStore } from './store/authStore';

export const App: React.FC = () => {
    const [view, setView] = useState<ViewState>('home');
<<<<<<< HEAD
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize(); // Check init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [lastOrderId, setLastOrderId] = useState<string | null>(null);
    const [initialShopCategory, setInitialShopCategory] = useState<ProductCategory | 'ALL'>('ALL');

    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [compareList, setCompareList] = useState<Product[]>([]);
    const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);

    const [showScrollTop, setShowScrollTop] = useState(false);

    const [bootState, setBootState] = useState<'idle' | 'complete'>('idle');
    const [showTour, setShowTour] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);

=======
    const { user, logout, isAuthenticated } = useAuthStore();
>>>>>>> restore-2025-12-25
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

<<<<<<< HEAD
    const addToCart = (product: Product, event?: React.MouseEvent) => {
        playSuccess();

        if (event) {
            const img = document.createElement('img');
            img.src = product.image;
            const startRect = (event.target as HTMLElement).closest('.group')?.querySelector('img')?.getBoundingClientRect();
            const cartIcon = document.getElementById('tour-cart');
            const targetRect = cartIcon?.getBoundingClientRect();

            if (startRect && targetRect) {
                setFlyingItems(prev => [...prev, { id: Date.now(), image: product.image, startRect, targetRect }]);
            }
        }

        setCartItems(prev => {
            const existing = prev.find(item => item._id === product._id);
            if (existing) {
                return prev.map(item => item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item);
            }
            return [...prev, { ...product, quantity: 1 }];
        });

        statsService.trackEvent('add_to_cart', { productId: product._id, productName: product.name, userId: user?._id });
        addToast('success', 'Ürün sepete eklendi');
    };

    const updateQuantity = (id: string, delta: number) => {
        setCartItems(prev => prev.map(item => {
            if (item._id === id) {
                const newQuantity = Math.max(0, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }).filter(item => item.quantity > 0));
    };

    const toggleFavorite = (product: Product) => {
        setFavoriteIds(prev => {
            const newIds = prev.includes(product._id) ? prev.filter(id => id !== product._id) : [...prev, product._id];
            localStorage.setItem('mv_favorites', JSON.stringify(newIds));
            return newIds;
        });
        addToast('info', favoriteIds.includes(product._id) ? 'Favorilerden çıkarıldı' : 'Favorilere eklendi');
    };

    const toggleCompare = (product: Product) => {
        setCompareList(prev => {
            const exists = prev.find(p => p._id === product._id);
            if (exists) {
                return prev.filter(p => p._id !== product._id);
            } else {
                if (prev.length >= 3) {
                    addToast('info', 'En fazla 3 ürün karşılaştırabilirsiniz.');
                    return prev;
                }
                return [...prev, product];
            }
        });
    };

    const handleCheckout = async () => {
        if (!user) {
            setIsCartOpen(false);
            navigateTo('auth');
            return;
        }
        setIsCartOpen(false);
        // setIsPaymentOpen(true); // Old logic
        navigateTo('checkout'); // New logic
        statsService.trackEvent('checkout_start', { userId: user._id });
    };

    const handlePaymentComplete = async () => {
        let total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (user?.rank === 'Yol Kaptanı') {
            total = total * 0.95;
        }

        await orderService.createOrder({
            user: user!,
            orderItems: cartItems,
            items: cartItems, // Backward compatibility or specific field? Backend expects 'orderItems' in controller logic I wrote, but service might structure it.
            // My service implementation just passes orderData to backend.
            // Backend controller expects: { orderItems, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice }
            // Let's pass a structure close to that.
            totalPrice: total,
            shippingAddress: { address: 'TBD', city: 'TBD', postalCode: '00000', country: 'Turkey' }, // Placeholder for old flow
            paymentMethod: 'Credit Card'
        });
        setCartItems([]);
        setIsPaymentOpen(false);
        playSuccess();
        addToast('success', 'Siparişiniz başarıyla alındı!');
        navigateTo('profile');
    };

    const handleStartRide = (route: RouteType | null) => {
        setActiveRoute(route);
        navigateTo('ride-mode');
    };

    const handleViewProfile = async (userId: string) => {
        if (!userId) return;

        // Ensure robust comparison (handle number vs string if overlapping)
        if (user && String(user._id) === String(userId)) {
            navigateTo('profile');
            return;
        }

        const targetUser = await authService.getUserById(userId);
        if (targetUser) {
            setViewingUser(targetUser);
            navigateTo('public-profile');
        } else {
            notify.error('Kullanıcı profili yüklenemedi.');
        }
    };

    const renderView = () => {
        switch (view) {
            case 'home': return <Home onNavigate={navigateTo} />;
            case 'showcase': return <Showcase products={products} onAddToCart={addToCart} onProductClick={(p) => navigateTo('product-detail', p)} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} onCompare={toggleCompare} compareList={compareList} onNavigate={navigateTo} onToggleMenu={() => setIsMobileMenuOpen(true)} />;
            case 'shop': return isMobileMenuOpen || window.innerWidth < 768 ? <MobileShop initialCategory={initialShopCategory} onNavigate={navigateTo} /> : <Shop products={products} onAddToCart={addToCart} onProductClick={(p) => navigateTo('product-detail', p)} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} onCompare={toggleCompare} compareList={compareList} onNavigate={navigateTo} initialCategory={initialShopCategory} />;
            case 'auth': return isMobile ? (
                <MobileAuth
                    onClose={() => navigateTo('home')}
                    onSuccess={() => {
                        authService.getCurrentUser().then(u => {
                            if (u) {
                                setUser(u);
                                addToast('success', `Hoş geldin, ${u.name}`);
                                if (!u.garage || u.garage.length === 0) {
                                    navigateTo('onboarding');
                                } else {
                                    navigateTo('home');
                                }
                            }
                        });
                    }}
                />
            ) : (
                <AuthPage onNavigate={navigateTo} onLoginSuccess={async () => {
                    const u = await authService.getCurrentUser();
                    if (u) {
                        setUser(u);
                        addToast('success', `Hoş geldin, ${u.name}`);
                        navigateTo('home');
                    }
                }} />
            );
            case 'product-detail': return isMobile ?
                <MobileProductDetail product={selectedProduct} onAddToCart={addToCart} onNavigate={navigateTo} onOpenCart={() => setIsCartOpen(true)} /> :
                <ProductDetail product={selectedProduct} allProducts={products} onAddToCart={addToCart} onNavigate={navigateTo} onProductClick={(p) => navigateTo('product-detail', p)} onCompare={toggleCompare} isCompared={compareList.some(p => p._id === selectedProduct?._id)} />;
            case 'favorites': return <Favorites products={products} favoriteIds={favoriteIds} onAddToCart={addToCart} onProductClick={(p) => navigateTo('product-detail', p)} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} onNavigate={navigateTo} />;

            case 'meetup': return <MotoMeetup user={user} onOpenAuth={() => navigateTo('auth')} onNavigate={navigateTo} />;
            case 'service-finder': return <ServiceFinder onNavigate={navigateTo} />;
            case 'ride-mode': return <RideMode route={activeRoute} onNavigate={navigateTo} />;
            case 'mototool': return <MotoTool onNavigate={navigateTo} />;
            case 'valuation': return <MotoValuation onNavigate={navigateTo} />;
            case 'qr-generator': return <HelmetQRGenerator onNavigate={navigateTo} />;
            case 'vlog-map': return <MotoVlogMap onNavigate={navigateTo} onAddToCart={addToCart} onProductClick={(p) => navigateTo('product-detail', p)} user={user} />;
            case 'lifesaver': return <LifeSaver onClose={() => navigateTo('home')} />;
            case 'profile': return user ? <UserProfile user={user} onLogout={() => { authService.logout(); setUser(null); navigateTo('home'); }} onUpdateUser={setUser} onNavigate={navigateTo} colorTheme={colorTheme} onColorChange={setColorTheme} /> : <div className="pt-32 text-center text-gray-500">Lütfen giriş yapın.</div>;
            case 'my-profile': return user ? <MyProfile /> : <div className="pt-32 text-center text-gray-500">Lütfen giriş yapın.</div>;
            case 'public-profile': return viewingUser ? <ProfilePage userId={viewingUser._id} onNavigate={navigateTo} onBack={() => navigateTo('riders')} /> : <div className="pt-32 text-center text-gray-500">Kullanıcı yüklenemedi.</div>;
            case 'admin': return user?.isAdmin ? <AdminPanel onLogout={() => { authService.logout(); setUser(null); navigateTo('home'); }} onShowToast={addToast} onNavigate={navigateTo} /> : <div className="pt-32 text-center text-gray-500">Yetkisiz erişim.</div>;
            case 'onboarding': return <MobileOnboarding onNavigate={navigateTo} />;
            case 'blog': return <Blog onNavigate={navigateTo} />;
            case 'about': return <About onNavigate={navigateTo} />;
            case 'ai-assistant': return <AIAssistantPage />;
            case 'forum': return <Forum user={user} onOpenAuth={() => navigateTo('auth')} onViewProfile={handleViewProfile} onOpenPro={() => setIsProModalOpen(true)} />;
            case 'social-hub': return <SocialHub user={user} onNavigate={navigateTo} onLogout={handleLogout} onUpdateUser={setUser} initialData={socialHubData} />;
            case 'riders': return <RidersDirectory onViewProfile={handleViewProfile} onNavigate={navigateTo} />;
            case 'reels': return <ReelsPage />;
            case 'explore': return <MobileExplore onNavigate={navigateTo} />;
            case 'create': return <RideMode route={activeRoute} onNavigate={navigateTo} />; // Placeholder
            case 'garage': return user ? <MyProfile /> : <div className="pt-32 text-center text-gray-500">Lütfen giriş yapın.</div>;
            case 'checkout':
                return (
                    <CheckoutPage
                        items={cartItems}
                        total={cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (user?.rank === 'Yol Kaptanı' ? 0.95 : 1)}
                        onBack={() => navigateTo('cart')}
                        onSuccess={(orderId) => {
                            setLastOrderId(orderId);
                            setCartItems([]);
                            addToast('success', 'Siparişiniz başarıyla alındı!');
                            navigateTo('order-tracking');
                        }}
                        onToast={addToast}
                    />
                );
            case 'order-tracking':
                return lastOrderId ? (
                    <OrderTracking
                        orderId={lastOrderId}
                        onClose={() => navigateTo('home')}
                    />
                ) : <Home products={products} onAddToCart={addToCart} onProductClick={(p: any) => navigateTo('product-detail', p)} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} onCompare={toggleCompare} compareList={compareList} onNavigate={navigateTo} onToggleMenu={() => setIsMobileMenuOpen(true)} />;
            default: return <Home products={products} onAddToCart={addToCart} onProductClick={(p: any) => navigateTo('product-detail', p)} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} onCompare={toggleCompare} compareList={compareList} onNavigate={navigateTo} onToggleMenu={() => setIsMobileMenuOpen(true)} />;
        }
    };

    if (bootState === 'idle') {
        return <IntroAnimation onComplete={handleIntroComplete} />;
    }

    const isFullScreenMode = view === 'ride-mode' || view === 'mototool' || view === 'admin' || view === 'meetup' || view === 'valuation' || view === 'qr-generator' || view === 'vlog-map' || view === 'lifesaver' || view === 'reels' || view === 'auth';

    return (
        <SocketProvider>
            <div key={animKey} className={`flex flex-col min-h-[100dvh] bg-[#f9fafb] text-gray-900 transition-colors duration-1000 ${isFullScreenMode ? 'overflow-hidden h-screen bg-black text-white' : ''}`}>

                <div className="bg-noise opacity-5"></div>

                {!isFullScreenMode && <LivingBackground />}

                {!isFullScreenMode && <ScrollProgress />}

                {/* Global Toast Container */}
                <ToastContainer toasts={toasts} onRemove={removeToast} />

                <AnimatePresence>
                    {flyingItems.map(item => (
                        <FlyToCart
                            key={item.id}
                            image={item.image}
                            startRect={item.startRect}
                            targetRect={item.targetRect}
                            onComplete={() => setFlyingItems(prev => prev.filter(i => i.id !== item.id))}
                        />
                    ))}

                    {showTour && <OnboardingTour onComplete={handleTourComplete} />}
                </AnimatePresence>

                {isMobile ? (
                    isAuthOpen && (
                        <MobileAuth
                            onClose={() => setIsAuthOpen(false)}
                            onSuccess={() => {
                                setIsAuthOpen(false);
                                authService.getCurrentUser().then(u => {
                                    if (u) {
                                        setUser(u);
                                        addToast('success', `Hoş geldin, ${u.name}`);
                                        navigateTo('home');
                                    }
                                });
                            }}
                        />
                    )
                ) : (
                    <AuthModal
                        isOpen={isAuthOpen}
                        onClose={() => setIsAuthOpen(false)}
                        initialMode={authMode}
                        onLogin={(u) => { setUser(u); setIsAuthOpen(false); addToast('success', `Hoş geldin, ${u.name}`); }}
                    />
                )}

                {isMobile ? (
                    <CartBottomSheet
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                        items={cartItems}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={(id) => setCartItems(prev => prev.filter(item => item._id !== id))}
                        onCheckout={handleCheckout}
                        user={user}
                    />
                ) : (
                    <CartDrawer
                        isOpen={isCartOpen}
                        onClose={() => setIsCartOpen(false)}
                        items={cartItems}
                        onUpdateQuantity={updateQuantity}
                        onRemoveItem={(id) => setCartItems(prev => prev.filter(item => item._id !== id))}
                        onCheckout={handleCheckout}
                        user={user}
                    />
                )}

                <PaymentModal
                    isOpen={isPaymentOpen}
                    onClose={() => setIsPaymentOpen(false)}
                    totalAmount={cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0) * (user?.rank === 'Yol Kaptanı' ? 0.95 : 1)}
                    items={cartItems}
                    user={user}
                    onPaymentComplete={handlePaymentComplete}
                />

                <ThemeModal
                    isOpen={isThemeModalOpen}
                    onClose={() => setIsThemeModalOpen(false)}
                    currentTheme={colorTheme}
                    onThemeChange={setColorTheme}
                />

                {isFullScreenMode ? (
                    <main className="w-full h-full relative z-10 bg-black">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={view}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                                className="w-full h-full"
                            >
                                {renderView()}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                ) : (
                    <MobileLayout
                        currentView={view}
                        onNavigate={navigateTo}
                        user={user}
                        cartCount={cartItems.reduce((a, b) => a + b.quantity, 0)}
                        onOpenAuth={() => setIsAuthOpen(true)}
                        onOpenFeedback={() => setIsFeedbackOpen(true)}
                        onToggleTheme={() => setIsThemeModalOpen(true)}
                    >
                        <div className="hidden md:block">
                            <Navbar
                                cartCount={cartItems.reduce((a, b) => a + b.quantity, 0)}
                                favoritesCount={favoriteIds.length}
                                onCartClick={() => setIsCartOpen(true)}
                                onFavoritesClick={() => navigateTo('favorites')}
                                onSearch={(query) => navigateTo('shop', query)}
                                onOpenAuth={() => navigateTo('auth')}
                                onNavigate={navigateTo}
                                currentView={view}
                                colorTheme={colorTheme} // Passed to standard Navbar if needed (future proofing)
                                onToggleMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            />
=======
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
>>>>>>> restore-2025-12-25
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
