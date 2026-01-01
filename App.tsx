// Main Application Component
import React, { useState, useEffect, useRef } from 'react';
import { Product, CartItem, ProductCategory, User, AuthMode, Route as RouteType, ViewState, ColorTheme } from './types';
import { Navbar } from './components/layout/Navbar';
import { MotovibeSidebar } from './components/layout/MotovibeSidebar';
import { BottomNav } from './components/layout/BottomNav';
import { CartDrawer } from './components/layout/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { PaymentModal } from './components/PaymentModal';
import { UserProfile } from './components/social/UserProfile';
import { ProfilePage } from './components/social/ProfilePage';
import { MyProfile } from './components/social/MyProfile';
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
import { ReelsPage } from './components/reels/ReelsPage';
import { MobileProductDetail } from './components/mobile/MobileProductDetail';
import { CartBottomSheet } from './components/mobile/CartBottomSheet';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { OrderTracking } from './components/checkout/OrderTracking';
import { Garage } from './components/garage/Garage';

export const App: React.FC = () => {
    const [view, setView] = useState<ViewState>('home');
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
    const [showScrollTop, setShowScrollTop] = useState(false);

    const [bootState, setBootState] = useState<'idle' | 'complete'>('idle');
    const [showTour, setShowTour] = useState(false);

    const [user, setUser] = useState<User | null>(null);
    const [viewingUser, setViewingUser] = useState<User | null>(null);

    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [authMode, setAuthMode] = useState<AuthMode>('login');
    const [activeRoute, setActiveRoute] = useState<RouteType | null>(null);
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const [isPaymentOpen, setIsPaymentOpen] = useState(false);
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const [colorTheme, setColorTheme] = useState<ColorTheme>('orange');
    const [isProModalOpen, setIsProModalOpen] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    const [socialHubData, setSocialHubData] = useState<any>(null); // Placeholder for initial data

    const { playSuccess } = useAppSounds();
    const [flyingItems, setFlyingItems] = useState<{ id: number; image: string; startRect: DOMRect; targetRect: DOMRect }[]>([]);
    const [animKey, setAnimKey] = useState(0);

    // Initial Data Fetching
    useEffect(() => {
        const loadInitialData = async () => {
            const allProducts = await productService.getProducts();
            setProducts(allProducts);

            const storedFavorites = localStorage.getItem('mv_favorites');
            if (storedFavorites) setFavoriteIds(JSON.parse(storedFavorites));

            const currentUser = await authService.getCurrentUser();
            if (currentUser) setUser(currentUser);

            // Check if tour should show
            if (!tourService.hasCompletedTour()) {
                // setShowTour(true); // Disable for now or only if user explicitly asks
            }

            // Start recording session
            recordingService.startSession(currentUser?._id || 'guest', currentUser?.name || 'Ziyaretçi');
        };
        loadInitialData();

        const handleScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            recordingService.stopSession();
        };
    }, []);

    const addToast = (type: ToastType, message: string) => {
        const newToast: ToastMessage = { id: Date.now(), type, message };
        setToasts(prev => [...prev.slice(-3), newToast]);
    };

    const removeToast = (id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleLogin = (user: User) => {
        setUser(user);
        setIsAuthOpen(false);
        addToast('success', `Hoş geldin, ${user.name}!`);
        useAuthStore.getState().setUser(user); // Sync store
    };

    const handleLogout = () => {
        authService.logout();
        setUser(null);
        setView('home');
        addToast('info', 'Çıkış yapıldı.');
        useAuthStore.getState().logout(); // Sync store
    };

    const navigateTo = (newView: ViewState, data?: any) => {
        if (data && newView === 'product-detail') {
            setSelectedProduct(data);
        }
        setView(newView);
        window.scrollTo(0, 0);
    };

    const addToCart = (product: Product, event?: React.MouseEvent) => {
        playSuccess();

        if (event) {
            const img = document.createElement('img');
            img.src = product.image;
            const startRect = (event.target as HTMLElement).closest('.group')?.querySelector('img')?.getBoundingClientRect();
            const cartIcon = document.getElementById('tour-cart') || document.querySelector('[data-cart-icon]'); // Fallback
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

    const handleCheckout = async () => {
        if (!user) {
            setIsCartOpen(false);
            navigateTo('auth');
            return;
        }
        setIsCartOpen(false);
        navigateTo('checkout');
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
            items: cartItems,
            total: total,
            totalPrice: total,
            shippingAddress: { address: 'TBD', city: 'TBD', postalCode: '00000', country: 'Turkey' },
            paymentMethod: 'Credit Card'
        });
        setCartItems([]);
        setIsPaymentOpen(false);
        playSuccess();
        addToast('success', 'Siparişiniz başarıyla alındı!');
        navigateTo('profile');
    };

    const handleViewProfile = async (userId: string) => {
        if (!userId) return;

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

    const handleIntroComplete = () => {
        setBootState('complete');
        // Check local storage if tour was seen
        const tourSeen = localStorage.getItem('mv_tour_seen');
        if (!tourSeen && !isMobile) {
            setTimeout(() => setShowTour(true), 1000);
        }
    };

    const handleTourComplete = () => {
        setShowTour(false);
        tourService.markTourComplete();
    };

    // Quick View Helper
    const setQuickViewProduct = (product: Product | null) => {
        setSelectedProduct(product);
    };

    const renderView = () => {
        switch (view) {
            case 'home': return <Home onNavigate={navigateTo} products={products} onAddToCart={addToCart} onProductClick={(p: any) => navigateTo('product-detail', p)} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} onToggleMenu={() => setIsMobileMenuOpen(true)} />;
            case 'showcase': return <Showcase products={products} onAddToCart={addToCart} onProductClick={(p) => navigateTo('product-detail', p)} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} onNavigate={navigateTo} onToggleMenu={() => setIsMobileMenuOpen(true)} />;
            case 'shop': return isMobileMenuOpen || window.innerWidth < 768 ? <MobileShop initialCategory={initialShopCategory} onNavigate={navigateTo} /> : <Shop products={products} onAddToCart={addToCart} onProductClick={(p) => navigateTo('product-detail', p)} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} onNavigate={navigateTo} initialCategory={initialShopCategory} />;
            case 'auth': return isMobile ? (
                <MobileAuth
                    onClose={() => navigateTo('home')}
                    onSuccess={(user) => {
                        if (user) {
                            setUser(user);
                            addToast('success', `Hoş geldin, ${user.name}`);
                            if (!user.garage || user.garage.length === 0) {
                                navigateTo('onboarding');
                            } else {
                                navigateTo('home');
                            }
                        } else {
                            // Fallback
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
                        }
                    }}
                />
            ) : (
                <AuthPage onNavigate={navigateTo} onLoginSuccess={async (user) => {
                    if (user) {
                        setUser(user);
                        addToast('success', `Hoş geldin, ${user.name}`);
                        navigateTo('home');
                    } else {
                        const u = await authService.getCurrentUser();
                        if (u) {
                            setUser(u);
                            addToast('success', `Hoş geldin, ${u.name}`);
                            navigateTo('home');
                        }
                    }
                }} />
            );
            case 'product-detail': return isMobile ?
                <MobileProductDetail product={selectedProduct} onAddToCart={addToCart} onNavigate={navigateTo} onOpenCart={() => setIsCartOpen(true)} /> :
                <ProductDetail product={selectedProduct} allProducts={products} onAddToCart={addToCart} onNavigate={navigateTo} onProductClick={(p) => navigateTo('product-detail', p)} />;
            case 'favorites': return <Favorites products={products} favoriteIds={favoriteIds} onAddToCart={addToCart} onProductClick={(p) => navigateTo('product-detail', p)} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} onNavigate={navigateTo} />;

            case 'meetup':
            case 'events': return <MotoMeetup user={user} onOpenAuth={() => navigateTo('auth')} onNavigate={navigateTo} />;
            case 'service-finder': return <ServiceFinder onNavigate={navigateTo} />;
            case 'ride-mode': return <RideMode route={activeRoute} onNavigate={navigateTo} />;
            case 'mototool': return <MotoTool onNavigate={navigateTo} />;
            case 'valuation': return <MotoValuation onNavigate={navigateTo} />;
            case 'qr-generator': return <HelmetQRGenerator onNavigate={navigateTo} />;
            case 'vlog-map': return <MotoVlogMap onNavigate={navigateTo} onAddToCart={addToCart} onProductClick={(p) => navigateTo('product-detail', p)} user={user} />;
            case 'lifesaver': return <LifeSaver onClose={() => navigateTo('home')} />;
            case 'profile': return user ? <UserProfile user={user} onLogout={handleLogout} onUpdateUser={setUser} onNavigate={navigateTo} colorTheme={colorTheme} onColorChange={setColorTheme} /> : <div className="pt-32 text-center text-gray-500">Lütfen giriş yapın.</div>;
            case 'my-profile': return user ? <MyProfile /> : <div className="pt-32 text-center text-gray-500">Lütfen giriş yapın.</div>;
            case 'public-profile': return viewingUser ? <ProfilePage userId={viewingUser._id} onNavigate={navigateTo} onBack={() => navigateTo('riders')} /> : <div className="pt-32 text-center text-gray-500">Kullanıcı yüklenemedi.</div>;
            case 'admin': return user?.isAdmin ? <AdminPanel onLogout={handleLogout} onShowToast={addToast} onNavigate={navigateTo} /> : <div className="pt-32 text-center text-gray-500">Yetkisiz erişim.</div>;
            case 'onboarding': return <MobileOnboarding onNavigate={navigateTo} />;
            case 'blog': return <Blog onNavigate={navigateTo} />;
            case 'about': return <About onNavigate={navigateTo} />;
            case 'ai-assistant': return <AIAssistantPage />;
            case 'forum': return <Forum user={user} onOpenAuth={() => navigateTo('auth')} onViewProfile={handleViewProfile} onOpenPro={() => setIsProModalOpen(true)} />;
            case 'social-hub': return <SocialHub user={user} onNavigate={navigateTo} onLogout={handleLogout} onUpdateUser={setUser} initialData={socialHubData} />;
            case 'riders': return <RidersDirectory onViewProfile={handleViewProfile} onNavigate={navigateTo} />;
            case 'reels': return <ReelsPage onNavigate={navigateTo} />;
            case 'explore': return <MobileExplore onNavigate={navigateTo} />;
            case 'create': return <RideMode route={activeRoute} onNavigate={navigateTo} />; // Placeholder
            case 'garage': return <Garage />;
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
                ) : <Home onNavigate={navigateTo} products={products} onAddToCart={addToCart} onProductClick={(p: any) => navigateTo('product-detail', p)} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} onToggleMenu={() => setIsMobileMenuOpen(true)} />;
            case 'routes':
                return <RouteExplorer
                    user={user}
                    onOpenAuth={() => setIsAuthOpen(true)}
                    onStartRide={(route) => {
                        setActiveRoute(route);
                        navigateTo('ride-mode');
                    }}
                />;
            default: return <Home onNavigate={navigateTo} products={products} onAddToCart={addToCart} onProductClick={(p: any) => navigateTo('product-detail', p)} favoriteIds={favoriteIds} onToggleFavorite={toggleFavorite} onQuickView={setQuickViewProduct} onToggleMenu={() => setIsMobileMenuOpen(true)} />;
        }
    };

    if (bootState === 'idle') {
        return <IntroAnimation onComplete={handleIntroComplete} />;
    }

    const isFullScreenMode = view === 'ride-mode' || view === 'mototool' || view === 'admin' || view === 'meetup' || view === 'events' || view === 'valuation' || view === 'qr-generator' || view === 'vlog-map' || view === 'lifesaver' || view === 'reels' || view === 'auth';

    return (
        <SocketProvider>
            <div key={animKey} className={`flex flex-col min-h-[100dvh] bg-black text-gray-100 transition-colors duration-1000 ${isFullScreenMode ? 'overflow-hidden h-screen bg-black text-white' : ''}`}>

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
                            onSuccess={(user) => {
                                setIsAuthOpen(false);
                                if (user) {
                                    setUser(user);
                                    addToast('success', `Hoş geldin, ${user.name}`);
                                    navigateTo('home'); // Or stay on current page? Usually close modal is enough, but user might expect refresh
                                } else {
                                    authService.getCurrentUser().then(u => {
                                        if (u) {
                                            setUser(u);
                                            addToast('success', `Hoş geldin, ${u.name}`);
                                            navigateTo('home');
                                        }
                                    });
                                }
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
                        {/* Desktop Header & Sidebar */}
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
                                colorTheme={colorTheme}
                                onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                            />

                            <MotovibeSidebar
                                activeView={view}
                                onNavigate={navigateTo}
                                isExpanded={isSidebarOpen}
                                onToggleExpand={() => setIsSidebarOpen(!isSidebarOpen)}
                            />
                        </div>

                        {/* Main Content Area - Adjusted for Sidebar */}
                        <main
                            className={`min-h-screen pt-20 transition-all duration-300 ${!isMobile
                                ? (isSidebarOpen ? 'md:pl-[260px]' : 'md:pl-[80px]')
                                : 'pt-20 pb-20' /* Mobile Padding */
                                }`}
                        >
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={view}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="px-4 md:px-8 max-w-[1600px] mx-auto"
                                >
                                    {renderView()}
                                </motion.div>
                            </AnimatePresence>
                        </main>



                    </MobileLayout>
                )}

                <ProModal
                    isOpen={isProModalOpen}
                    onClose={() => setIsProModalOpen(false)}
                    onUpgrade={async () => {
                        // Dummy upgrade handler
                        await new Promise(r => setTimeout(r, 1000));
                        addToast('success', 'Tebrikler! Pro üyeliğe geçiş yapıldı.');
                        setIsProModalOpen(false);
                    }}
                />
                <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} user={user} />

                <ProductQuickViewModal
                    isOpen={!!selectedProduct && view !== 'product-detail'}
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onAddToCart={(product) => {
                        addToast('success', `${product.name} sepete eklendi.`);
                        addToCart(product);
                        setSelectedProduct(null);
                        if (isMobile) setIsCartOpen(true);
                    }}
                    onViewDetail={(product) => {
                        setSelectedProduct(null);
                        navigateTo('product-detail', product);
                    }}
                />


            </div>
        </SocketProvider>
    );
};

export default App;
