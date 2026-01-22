import React, { useState } from 'react';
import { AdminSidebar } from './admin/AdminSidebar';
import { Search, Bell, RotateCcw, MoreVertical } from 'lucide-react';
import { CONFIG } from '../services/config';
import { Button } from './ui/Button';
import { ToastType } from './Toast';

// Placeholder Components for lazy loading integration later
import { AdminDashboard } from './admin/AdminDashboard';

interface AdminPanelProps {
    onLogout: () => void;
    onShowToast: (type: ToastType, message: string) => void;
    onNavigate: (view: any) => void;
}

type AdminTab = 'dashboard' | 'products' | 'orders' | 'users' | 'categories' | 'routes' | 'stories' | 'negotiations' | 'models' | 'events' | 'community' | 'paddock' | 'vlogs' | 'showcase' | 'reels' | 'ui-settings';

export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onShowToast, onNavigate }) => {
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const handleToggleApiMode = () => {
        CONFIG.toggleApiMode(!CONFIG.USE_MOCK_API);
        window.location.reload();
    };

    return (
        <div className="h-screen bg-[#09090b] text-white font-sans flex overflow-hidden">

            {/* --- SIDEBAR --- */}
            <AdminSidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isSidebarOpen={isSidebarOpen}
                onLogout={onLogout}
                onNavigate={onNavigate}
            />

            {/* --- MAIN CONTENT --- */}
            <div className="flex-1 flex flex-col min-w-0 bg-[#09090b]">

                {/* TOP BAR */}
                <header className="h-20 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-gray-400 hover:text-white">
                            <MoreVertical className="w-6 h-6" />
                        </Button>
                        <h2 className="text-2xl font-bold text-white capitalize">{activeTab}</h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button onClick={handleToggleApiMode} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                            <div className={`w-2 h-2 rounded-full ${CONFIG.USE_MOCK_API ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                            <span className="text-xs font-mono font-bold text-gray-400">{CONFIG.USE_MOCK_API ? 'MOCK' : 'LIVE'}</span>
                        </button>
                    </div>
                </header>

                {/* CONTENT AREA */}
                <div className="flex-1 overflow-y-auto p-8">
                    {activeTab === 'dashboard' && (
                        <DashboardLoader
                            onNavigate={onNavigate}
                            onShowToast={onShowToast}
                        />
                    )}

                    {activeTab === 'products' && (
                        <ProductsLoader
                            onShowToast={onShowToast}
                            searchTerm={searchTerm}
                        />
                    )}

                    {activeTab === 'orders' && (
                        <OrdersLoader
                            onShowToast={onShowToast}
                        />
                    )}

                    {activeTab === 'users' && (
                        <GenericLoader
                            fetchData={authService.getAllUsers}
                            loadingMsg="Kullanıcılar yükleniyor..."
                            errorMsg="Kullanıcılar alınamadı"
                            onShowToast={onShowToast}
                            renderItem={(data: any, handleDelete: any) => (
                                <AdminUsers users={data} searchTerm={searchTerm} handleDelete={(id) => handleDelete(authService.deleteUser, id)} />
                            )}
                        />
                    )}

                    {activeTab === 'categories' && (
                        <CategoriesLoader
                            onShowToast={onShowToast}
                        />
                    )}




                    {activeTab === 'stories' && (
                        <GenericLoader
                            fetchData={storyService.getStories}
                            loadingMsg="Hikayeler yükleniyor..."
                            errorMsg="Hikayeler alınamadı"
                            onShowToast={onShowToast}
                            renderItem={(data: any, handleDelete: any) => (
                                <AdminStories stories={data} handleDelete={(id) => handleDelete(storyService.deleteStory, id)} handleEdit={() => { }} handleAddNew={() => onShowToast('info', 'Ekleme özelliği eklenecek')} handleSave={async () => { }} />
                            )}
                        />
                    )}

                    {activeTab === 'negotiations' && (
                        <GenericLoader
                            fetchData={negotiationService.getOffers}
                            loadingMsg="Teklifler yükleniyor..."
                            errorMsg="Teklifler alınamadı"
                            onShowToast={onShowToast}
                            renderItem={(data: any, handleDelete: any) => (
                                <AdminNegotiations negotiations={data} handleNegotiationAction={() => onShowToast('info', 'İşlem henüz aktif değil')} />
                            )}
                        />
                    )}

                    {activeTab === 'models' && (
                        <GenericLoader
                            fetchData={modelService.getModels}
                            loadingMsg="Modeller yükleniyor..."
                            errorMsg="Modeller alınamadı"
                            onShowToast={onShowToast}
                            renderItem={(data: any, handleDelete: any) => (
                                <AdminModels models={data} handleDelete={(id) => handleDelete(modelService.deleteModel, id)} handleAddNew={() => onShowToast('info', 'Ekleme özelliği eklenecek')} />
                            )}
                        />
                    )}

                    {activeTab === 'events' && (
                        <GenericLoader
                            fetchData={eventService.getEvents}
                            loadingMsg="Etkinlikler yükleniyor..."
                            errorMsg="Etkinlikler alınamadı"
                            onShowToast={onShowToast}
                            renderItem={(data: any, handleDelete: any) => (
                                <AdminEvents events={data} handleDelete={(id) => handleDelete(eventService.deleteEvent, id)} handleEdit={() => { }} handleAddNew={() => onShowToast('info', 'Ekleme özelliği eklenecek')} />
                            )}
                        />
                    )}

                    {activeTab === 'community' && (
                        <GenericLoader
                            fetchData={forumService.getTopics}
                            loadingMsg="Forum konuları yükleniyor..."
                            errorMsg="Konular alınamadı"
                            onShowToast={onShowToast}
                            renderItem={(data: any, handleDelete: any) => (
                                <AdminCommunity topics={data} handleDelete={(id) => handleDelete(forumService.deleteTopic, id)} />
                            )}
                        />
                    )}

                    {activeTab === 'paddock' && (
                        <GenericLoader
                            fetchData={socialService.getFeed}
                            loadingMsg="Sosyal akış yükleniyor..."
                            errorMsg="Akış alınamadı"
                            onShowToast={onShowToast}
                            renderItem={(data: any, handleDelete: any) => (
                                <AdminPaddock posts={data} handleDelete={(id) => handleDelete(socialService.deletePost, id)} />
                            )}
                        />
                    )}

                    {activeTab === 'vlogs' && (
                        <GenericLoader
                            fetchData={vlogService.getVlogs}
                            loadingMsg="Vloglar yükleniyor..."
                            errorMsg="Vloglar alınamadı"
                            onShowToast={onShowToast}
                            renderItem={(data: any, handleDelete: any) => (
                                <AdminVlogs vlogs={data} handleDelete={(id) => handleDelete(vlogService.deleteVlog, id)} handleEdit={() => { }} handleAddNew={() => onShowToast('info', 'Ekleme özelliği eklenecek')} searchTerm={searchTerm} />
                            )}
                        />
                    )}

                    {activeTab === 'showcase' && (
                        <AdminShowcase />
                    )}

                    {activeTab === 'reels' && (
                        <AdminReelManager />
                    )}

                    {activeTab === 'ui-settings' && (
                        <AdminUISettings />
                    )}

                    {activeTab !== 'dashboard' && activeTab !== 'products' && activeTab !== 'orders' &&
                        activeTab !== 'users' && activeTab !== 'categories' && activeTab !== 'routes' && activeTab !== 'ui-settings' &&
                        !['stories', 'negotiations', 'models', 'events', 'community', 'paddock', 'vlogs', 'showcase', 'reels'].includes(activeTab) && (
                            <div className="p-20 text-center text-gray-500">
                                Bu modül henüz aktif edilmedi: <b>{activeTab}</b>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

// --- Internal Loader Components to keep main file clean ---

import { productService } from '../services/productService';
import { orderService } from '../services/orderService';
import { authService } from '../services/auth';
import { negotiationService } from '../services/negotiationService';

import { categoryService } from '../services/categoryService';
import { routeService } from '../services/routeService';
import { storyService } from '../services/storyService';
import { modelService } from '../services/modelService';
import { eventService } from '../services/eventService';
import { forumService } from '../services/forumService';
import { vlogService } from '../services/vlogService';
import { socialService } from '../services/socialService';

import { AdminProducts } from './admin/AdminProducts';
import { AdminOrders } from './admin/AdminOrders';
import { AdminUsers } from './admin/AdminUsers';
import { AdminCategories } from './admin/AdminCategories';

import { AdminRoutes } from './admin/AdminRoutes';
import { AdminStories } from './admin/AdminStories';
import { AdminNegotiations } from './admin/AdminNegotiations';
import { AdminModels } from './admin/AdminModels';
import { AdminEvents } from './admin/AdminEvents';
import { AdminCommunity } from './admin/AdminCommunity';
import { AdminPaddock } from './admin/AdminPaddock';
import { AdminShowcase } from './admin/AdminShowcase';
import { AdminVlogs } from './admin/AdminVlogs';
import { AdminReelManager } from './admin/AdminReelManager';
import { AdminUISettings } from './admin/AdminUISettings';

import { ProductModal } from './admin/modals/ProductModal';
import { CategoryModal } from './admin/modals/CategoryModal';

import { Product, Order, CategoryItem, Slide } from '../types';

// --- Generic Component for Simple Lists ---
const GenericLoader = ({ fetchData, renderItem, loadingMsg, errorMsg, onShowToast }: any) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        try {
            setLoading(true);
            const res = await fetchData();
            setData(Array.isArray(res) ? res : []);
        } catch (e) {
            console.error(e);
            onShowToast('error', errorMsg);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        load();
    }, []);

    const handleDelete = async (deleteFn: (id: any) => Promise<void>, id: any) => {
        if (!confirm('Silmek istediğinize emin misiniz?')) return;
        try {
            await deleteFn(id);
            setData(prev => prev.filter((item: any) => item._id !== id && item.id !== id));
            onShowToast('success', 'Silindi');
        } catch (e) {
            onShowToast('error', 'Silinemedi');
        }
    };

    if (loading) return <div className="text-white text-center p-10 animate-pulse">{loadingMsg}</div>;
    return renderItem(data, handleDelete, load);
};

// --- Internal Loader Components ---

const OrdersLoader = ({ onShowToast }: any) => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const data = await orderService.getAllOrders();
            setOrders(data);
        } catch (err) {
            onShowToast('error', 'Siparişler yüklenemedi');
            setError('Sipariş listesi alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadOrders();
    }, []);

    const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
        try {
            // Optimistic update
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus as any } : o));
            await orderService.updateOrderStatus(orderId, newStatus);
            onShowToast('success', 'Sipariş durumu güncellendi');
        } catch (e) {
            onShowToast('error', 'Güncelleme başarısız');
            loadOrders(); // Revert
        }
    };

    if (loading) return <div className="text-white text-center p-10 animate-pulse">Siparişler Yükleniyor...</div>;
    if (error) return <div className="text-red-500 text-center p-10">{error} <button onClick={loadOrders} className="underline ml-2">Tekrar Dene</button></div>;

    return (
        <AdminOrders
            orders={orders}
            handleOrderStatusChange={handleOrderStatusChange}
        />
    );
};

const ProductsLoader = ({ onShowToast, searchTerm }: any) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await productService.getProducts();
            setProducts(data);
        } catch (err) {
            onShowToast('error', 'Ürünler yüklenemedi');
            setError('Ürün listesi alınamadı.');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadProducts();
    }, []);

    const handleAddNew = () => {
        setEditingProduct(null);
        setIsModalOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: any) => {
        if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
        try {
            await productService.deleteProduct(id);
            setProducts(prev => prev.filter(p => p._id !== id));
            onShowToast('success', 'Ürün silindi');
        } catch (e) {
            onShowToast('error', 'Silme işlemi başarısız');
        }
    };

    const handleToggleStatus = async (product: Product, field: 'isEditorsChoice' | 'isDealOfTheDay') => {
        try {
            const updatedProduct = { ...product, [field]: !product[field] };
            // Optimistic update
            setProducts(prev => prev.map(p => p._id === product._id ? updatedProduct : p));
            await productService.updateProduct(updatedProduct);
            onShowToast('success', 'Durum güncellendi');
        } catch (e) {
            onShowToast('error', 'Güncelleme başarısız');
            loadProducts(); // Revert on error
        }
    };

    const handleSave = async (productData: any) => {
        try {
            if (editingProduct) {
                await productService.updateProduct(productData);
                onShowToast('success', 'Ürün güncellendi');
            } else {
                await productService.addProduct(productData);
                onShowToast('success', 'Ürün eklendi');
            }
            await loadProducts();
        } catch (e) {
            console.error(e);
            throw e; // Modal will catch this
        }
    };

    if (loading) return <div className="text-white text-center p-10 animate-pulse">Ürünler Yükleniyor...</div>;
    if (error) return <div className="text-red-500 text-center p-10">{error} <button onClick={loadProducts} className="underline ml-2">Tekrar Dene</button></div>;

    return (
        <>
            <AdminProducts
                products={products}
                searchTerm={searchTerm}
                handleAddNew={handleAddNew}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                handleToggleProductStatus={handleToggleStatus}
            />
            {isModalOpen && (
                <ProductModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSave}
                    editingProduct={editingProduct}
                />
            )}
        </>
    );
};

const CategoriesLoader = ({ onShowToast }: any) => {
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);

    const loadCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (err) {
            onShowToast('error', 'Kategoriler yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => {
        loadCategories();
    }, []);

    const handleAddNew = () => {
        setEditingCategory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (category: CategoryItem) => {
        setEditingCategory(category);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu kategoriyi silmek istediğinize emin misiniz?')) return;
        try {
            await categoryService.deleteCategory(id);
            setCategories(prev => prev.filter(c => c._id !== id));
            onShowToast('success', 'Kategori silindi');
        } catch (e) {
            onShowToast('error', 'Silme işlemi başarısız');
        }
    };

    const handleSave = async (categoryData: any) => {
        try {
            if (editingCategory) {
                await categoryService.updateCategory(categoryData);
                onShowToast('success', 'Kategori güncellendi');
            } else {
                await categoryService.addCategory(categoryData);
                onShowToast('success', 'Kategori eklendi');
            }
            await loadCategories();
        } catch (e) {
            console.error(e);
            onShowToast('error', 'İşlem başarısız');
        }
    };

    if (loading) return <div className="text-white text-center p-10 animate-pulse">Kategoriler Yükleniyor...</div>;

    return (
        <>
            <AdminCategories
                categories={categories}
                handleAddNew={handleAddNew}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
            />
            <CategoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                editingCategory={editingCategory}
            />
        </>
    );
};



const DashboardLoader = ({ onNavigate, onShowToast }: any) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    React.useEffect(() => {
        const loadDashboardData = async () => {
            try {
                setLoading(true);
                // Parallel fetch with error tolerance
                const results = await Promise.allSettled([
                    productService.getProducts(),
                    orderService.getAllOrders(),
                    authService.getAllUsers(),
                    negotiationService.getOffers()
                ]);

                // Helper to get value or empty array
                const getValue = (result: any) => result.status === 'fulfilled' ? result.value : [];
                const getError = (result: any, name: string) => {
                    if (result.status === 'rejected') console.error(`Failed to load ${name}:`, result.reason);
                    return result.status === 'rejected';
                };

                const [productsRes, ordersRes, usersRes, negotiationsRes] = results;

                // Log specific errors
                if (getError(productsRes, 'Products')) onShowToast('error', 'Ürünler yüklenemedi');
                if (getError(ordersRes, 'Orders')) onShowToast('error', 'Siparişler yüklenemedi');
                if (getError(usersRes, 'Users')) onShowToast('error', 'Kullanıcılar yüklenemedi');
                if (getError(negotiationsRes, 'Negotiations')) onShowToast('error', 'Teklifler yüklenemedi');

                setData({
                    products: getValue(productsRes),
                    orders: getValue(ordersRes),
                    users: getValue(usersRes),
                    negotiations: getValue(negotiationsRes)
                });
            } catch (err) {
                console.error("Critical Dashboard Error:", err);
                setError("Beklenmedik bir hata oluştu.");
                onShowToast('error', 'Dashboard verileri yüklenemedi');
            } finally {
                setLoading(false);
            }
        };
        loadDashboardData();
    }, []);

    if (loading) return <div className="text-white text-center p-10 animate-pulse">Dashboard Verileri Yükleniyor...</div>;
    if (error) return <div className="text-red-500 text-center p-10">{error}</div>;

    return (
        <AdminDashboard
            products={data.products || []}
            orders={data.orders || []}
            users={data.users || []}
            negotiations={data.negotiations || []}
            setActiveTab={onNavigate}
            handleAddNew={() => onNavigate('products')}
        />
    );
};
