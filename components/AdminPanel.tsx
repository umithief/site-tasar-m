
import React, { useState, useEffect } from 'react';
import { Search, Bell, RotateCcw, Plus, Edit2, X, MoreVertical, Zap } from 'lucide-react';
import { Order, Product, ProductCategory, User, Slide, CategoryItem, Route, Story, NegotiationOffer, Model3DItem } from '../types';
import { Button } from './ui/Button';
import { AdminSidebar } from './admin/AdminSidebar';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminProducts } from './admin/AdminProducts';
import { AdminCategories } from './admin/AdminCategories';
import { AdminSlider } from './admin/AdminSlider';
import { AdminRoutes } from './admin/AdminRoutes';
import { AdminStories } from './admin/AdminStories';
import { AdminOrders } from './admin/AdminOrders';
import { AdminUsers } from './admin/AdminUsers';
import { AdminNegotiations } from './admin/AdminNegotiations';
import { AdminModels } from './admin/AdminModels';
import { productService } from '../services/productService';
import { sliderService } from '../services/sliderService';
import { categoryService } from '../services/categoryService';
import { routeService } from '../services/routeService';
import { storyService } from '../services/storyService';
import { negotiationService } from '../services/negotiationService';
import { orderService } from '../services/orderService';
import { authService } from '../services/auth';
import { modelService } from '../services/modelService';
import { ToastType } from './Toast';
import { CONFIG } from '../services/config';
import { useLanguage } from '../contexts/LanguageProvider';
import { motion, AnimatePresence } from 'framer-motion';

// FilePond
// @ts-ignore
import { FilePond, registerPlugin } from 'react-filepond';
// @ts-ignore
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
// @ts-ignore
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
// @ts-ignore
import FilePondPluginImageCrop from 'filepond-plugin-image-crop';
// @ts-ignore
import FilePondPluginImageResize from 'filepond-plugin-image-resize';
// @ts-ignore
import FilePondPluginImageTransform from 'filepond-plugin-image-transform';
import { storageService } from '../services/storageService';

registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginFileValidateType,
    FilePondPluginImageCrop,
    FilePondPluginImageResize,
    FilePondPluginImageTransform
);

interface AdminPanelProps {
    onLogout: () => void;
    onShowToast: (type: ToastType, message: string) => void;
    onNavigate: (view: any) => void;
}

type AdminTab = 'dashboard' | 'products' | 'orders' | 'users' | 'slider' | 'categories' | 'routes' | 'stories' | 'negotiations' | 'models';



export const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout, onShowToast, onNavigate }) => {
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const [products, setProducts] = useState<Product[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [slides, setSlides] = useState<Slide[]>([]);
    const [categories, setCategories] = useState<CategoryItem[]>([]);
    const [routes, setRoutes] = useState<Route[]>([]);
    const [stories, setStories] = useState<Story[]>([]);
    const [negotiations, setNegotiations] = useState<NegotiationOffer[]>([]);
    const [models, setModels] = useState<Model3DItem[]>([]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);
    const [formData, setFormData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);

    const [searchTerm, setSearchTerm] = useState('');

    const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
    const [modelSource, setModelSource] = useState<'upload' | 'url'>('upload');

    const [files, setFiles] = useState<any[]>([]);
    const [modelFiles, setModelFiles] = useState<any[]>([]);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        const [p, s, c, r, st, n, o, u, m] = await Promise.all([
            productService.getProducts(),
            sliderService.getSlides(),
            categoryService.getCategories(),
            routeService.getRoutes(),
            storyService.getStories(),
            negotiationService.getOffers(),
            orderService.getAllOrders(),
            authService.getAllUsers(),
            modelService.getModels()
        ]);
        setProducts(p);
        setSlides(s);
        setCategories(c);
        setRoutes(r);
        setStories(st);
        setNegotiations(n);
        setOrders(o);
        setUsers(u);
        setModels(m);
    };

    const handleEdit = (item: any) => {
        setEditingItem(item);
        const itemWithImages = {
            ...item,
            images: item.images || (item.image ? [item.image] : [])
        };
        setFormData(itemWithImages);
        setFiles([]);
        setModelFiles([]);

        setImageSource(item.image && item.image.startsWith('http') && !item.image.includes('motovibe-api.onrender.com') && !item.image.includes('minio') ? 'url' : 'upload');

        const hasModelUrl = item.model3d && item.model3d.startsWith('http');
        setModelSource(hasModelUrl ? 'url' : 'upload');

        setIsModalOpen(true);
    };

    const handleAddNew = () => {
        setEditingItem(null);
        setFiles([]);
        setModelFiles([]);
        setImageSource('upload');
        setModelSource('upload');

        if (activeTab === 'products') setFormData({ name: '', price: 0, category: 'Aksesuar', image: '', images: [], description: '', stock: 10, features: [], isNegotiable: false, model3d: '', isEditorsChoice: false, isDealOfTheDay: false });
        else if (activeTab === 'stories') setFormData({ label: '', image: '', color: 'border-orange-500' });
        else if (activeTab === 'categories') setFormData({ name: '', type: 'Aksesuar', image: '', desc: '', count: '0 Model', className: 'col-span-1 row-span-1' });
        else if (activeTab === 'slider') setFormData({ title: '', subtitle: '', image: '', cta: 'İNCELE', action: 'shop', type: 'image', videoUrl: '' });
        else if (activeTab === 'routes') setFormData({ title: '', location: '', difficulty: 'Orta', distance: '', duration: '', image: '', tags: [] });
        else if (activeTab === 'models') setFormData({ name: '', url: '', poster: '', category: 'Genel' });

        setIsModalOpen(true);
    };

    const handleDelete = async (id: any) => {
        if (!confirm('Bu kaydı silmek istediğine emin misin?')) return;

        try {
            if (activeTab === 'products') { await productService.deleteProduct(id); setProducts(products.filter(p => p.id !== id)); }
            else if (activeTab === 'stories') { await storyService.deleteStory(id); setStories(stories.filter(s => s.id !== id)); }
            else if (activeTab === 'categories') { await categoryService.deleteCategory(id); setCategories(categories.filter(c => c.id !== id)); }
            else if (activeTab === 'slider') { await sliderService.deleteSlide(id); setSlides(slides.filter(s => s.id !== id)); }
            else if (activeTab === 'routes') { await routeService.deleteRoute(id); setRoutes(routes.filter(r => r.id !== id)); }
            else if (activeTab === 'users') { await authService.deleteUser(id); setUsers(users.filter(u => u.id !== id)); }
            else if (activeTab === 'models') { await modelService.deleteModel(id); setModels(models.filter(m => m.id !== id)); }

            onShowToast('success', 'Kayıt silindi.');
        } catch (e) {
            onShowToast('error', 'Silme işlemi başarısız.');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            let finalData = { ...formData };
            delete finalData.tempUrlInput;
            delete finalData.tempModelUrlInput;

            if (activeTab === 'products') {
                if (finalData.images && finalData.images.length > 0) {
                    finalData.image = finalData.images[0];
                }
            }

            if (activeTab === 'products') {
                if (editingItem) await productService.updateProduct(finalData);
                else await productService.addProduct(finalData);
            } else if (activeTab === 'stories') {
                if (editingItem) await storyService.updateStory(finalData);
                else await storyService.addStory(finalData);
            } else if (activeTab === 'categories') {
                if (editingItem) await categoryService.updateCategory(finalData);
                else await categoryService.addCategory(finalData);
            } else if (activeTab === 'slider') {
                if (editingItem) await sliderService.updateSlide(finalData);
                else await sliderService.addSlide(finalData);
            } else if (activeTab === 'routes') {
                if (editingItem) await routeService.updateRoute(finalData);
                else await routeService.addRoute(finalData);
            } else if (activeTab === 'models') {
                if (editingItem) await modelService.updateModel(finalData);
                else await modelService.addModel(finalData);
            }

            await loadAllData();
            setIsModalOpen(false);
            onShowToast('success', 'Başarıyla kaydedildi.');
        } catch (e) {
            onShowToast('error', 'Kaydetme hatası oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    // Helper Handlers
    const handleRemoveImage = (urlToRemove: string) => {
        setFormData((prev: any) => ({
            ...prev,
            images: prev.images.filter((url: string) => url !== urlToRemove),
            image: prev.image === urlToRemove ? (prev.images.length > 1 ? prev.images[1] : '') : prev.image
        }));
    };

    const handleAddUrlImage = () => {
        const url = formData.tempUrlInput;
        if (!url) return;
        setFormData((prev: any) => ({
            ...prev,
            images: [...(prev.images || []), url],
            image: prev.image || url,
            tempUrlInput: ''
        }));
    };

    const handleToggleApiMode = () => {
        const targetMode = !CONFIG.USE_MOCK_API;
        const modeName = targetMode ? "MOCK (Yerel Veri)" : "LIVE (Sunucu)";
        if (confirm(`Veri kaynağını ${modeName} olarak değiştirmek istiyor musunuz? Sayfa yenilenecektir.`)) {
            CONFIG.toggleApiMode(targetMode);
        }
    };

    const handleToggleProductStatus = async (product: Product, field: 'isEditorsChoice' | 'isDealOfTheDay') => {
        try {
            const updatedProduct = { ...product, [field]: !product[field] };
            await productService.updateProduct(updatedProduct);
            setProducts(products.map(p => p.id === product.id ? updatedProduct : p));
            onShowToast('success', 'Durum güncellendi.');
        } catch (e) { onShowToast('error', 'Hata oluştu.'); }
    };

    const handleOrderStatusChange = async (orderId: string, newStatus: string) => {
        try {
            await orderService.updateOrderStatus(orderId, newStatus);
            setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus as any } : o));
            onShowToast('success', 'Sipariş durumu güncellendi');
        } catch (e) { onShowToast('error', 'Hata oluştu'); }
    };

    const handleNegotiationAction = async (id: string, status: 'accepted' | 'rejected') => {
        try {
            await negotiationService.updateOfferStatus(id, status);
            setNegotiations(prev => prev.map(n => n.id === id ? { ...n, status } : n));
            onShowToast('success', `Teklif ${status === 'accepted' ? 'onaylandı' : 'reddedildi'}`);
        } catch (e) { onShowToast('error', 'Hata oluştu'); }
    };

    return (
        <div className="h-screen bg-[#09090b] text-white font-sans flex overflow-hidden selection:bg-[#F2A619] selection:text-black">

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

                {/* Top Bar */}
                <header className="h-20 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden p-2 text-gray-400 hover:text-white">
                            <MoreVertical className="w-6 h-6" />
                        </Button>
                        <h2 className="text-2xl font-bold text-white capitalize">{activeTab === 'dashboard' ? 'Genel Bakış' : activeTab}</h2>
                        <div className="h-6 w-[1px] bg-white/10 mx-2"></div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-full pl-9 pr-4 py-2 text-xs text-white focus:border-[#F2A619] outline-none w-64 transition-all focus:w-80"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleToggleApiMode}
                            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                        >
                            <div className={`w-2 h-2 rounded-full ${CONFIG.USE_MOCK_API ? 'bg-yellow-500' : 'bg-green-500'} animate-pulse`}></div>
                            <span className="text-xs font-mono font-bold text-gray-400">{CONFIG.USE_MOCK_API ? 'MOCK' : 'LIVE'}</span>
                            <RotateCcw className="w-3 h-3 text-gray-500" />
                        </button>

                        <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#09090b]"></span>
                        </button>

                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#F2A619] to-orange-600 p-[2px]">
                            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-xs font-bold text-white">AD</div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="max-w-[1600px] mx-auto">

                        {activeTab === 'dashboard' && (
                            <AdminDashboard
                                products={products}
                                orders={orders}
                                users={users}
                                negotiations={negotiations}
                                setActiveTab={setActiveTab}
                                handleAddNew={handleAddNew}
                            />
                        )}

                        {activeTab === 'products' && (
                            <AdminProducts
                                products={products}
                                searchTerm={searchTerm}
                                handleAddNew={handleAddNew}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                                handleToggleProductStatus={handleToggleProductStatus}
                            />
                        )}

                        {activeTab === 'categories' && (
                            <AdminCategories
                                categories={categories}
                                handleAddNew={handleAddNew}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                            />
                        )}

                        {activeTab === 'slider' && (
                            <AdminSlider
                                slides={slides}
                                handleAddNew={handleAddNew}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                            />
                        )}

                        {activeTab === 'routes' && (
                            <AdminRoutes
                                routes={routes}
                                handleAddNew={handleAddNew}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                            />
                        )}

                        {activeTab === 'stories' && (
                            <AdminStories
                                stories={stories}
                                handleAddNew={handleAddNew}
                                handleEdit={handleEdit}
                                handleDelete={handleDelete}
                            />
                        )}

                        {activeTab === 'orders' && (
                            <AdminOrders
                                orders={orders}
                                handleOrderStatusChange={handleOrderStatusChange}
                            />
                        )}

                        {activeTab === 'users' && (
                            <AdminUsers
                                users={users}
                                searchTerm={searchTerm}
                                handleDelete={handleDelete}
                            />
                        )}

                        {activeTab === 'negotiations' && (
                            <AdminNegotiations
                                negotiations={negotiations}
                                handleNegotiationAction={handleNegotiationAction}
                            />
                        )}

                        {activeTab === 'models' && (
                            <AdminModels
                                models={models}
                                handleAddNew={handleAddNew}
                                handleDelete={handleDelete}
                            />
                        )}

                    </div>
                </div>
            </div>

            {/* --- MODAL --- */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsModalOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#1A1A17] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 flex flex-col"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#1A1A17] z-20">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    {editingItem ? <Edit2 className="w-5 h-5 text-[#F2A619]" /> : <Plus className="w-5 h-5 text-[#F2A619]" />}
                                    {editingItem ? 'Kaydı Düzenle' : 'Yeni Kayıt Ekle'}
                                </h3>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X className="w-6 h-6" /></button>
                            </div>

                            <div className="p-8 space-y-6">
                                {/* DYNAMIC FORM BASED ON TAB */}
                                {Object.keys(formData).map(key => {
                                    // Exclude complex objects or handled fields
                                    if (['id', 'images', 'image', 'tempUrlInput', 'tempModelUrlInput', 'features', 'model3d', 'path', 'coordinates', 'tips', 'tags', 'attendeeList', 'messages'].includes(key)) return null;

                                    // Special inputs
                                    if (key === 'description' || key === 'desc') return (
                                        <div key={key}>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{key}</label>
                                            <textarea className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none h-32 resize-none" value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })} />
                                        </div>
                                    );

                                    if (key === 'category' && activeTab === 'products') return (
                                        <div key={key}>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Kategori</label>
                                            <select className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none appearance-none" value={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.value })}>
                                                {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                    );

                                    if (typeof formData[key] === 'boolean') return (
                                        <div key={key} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5">
                                            <input type="checkbox" className="w-5 h-5 accent-[#F2A619]" checked={formData[key]} onChange={e => setFormData({ ...formData, [key]: e.target.checked })} />
                                            <label className="text-sm font-bold text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                        </div>
                                    );

                                    return (
                                        <div key={key}>
                                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">{key.replace(/([A-Z])/g, ' $1').trim()}</label>
                                            <input
                                                type={typeof formData[key] === 'number' ? 'number' : 'text'}
                                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none"
                                                value={formData[key]}
                                                onChange={e => setFormData({ ...formData, [key]: typeof formData[key] === 'number' ? Number(e.target.value) : e.target.value })}
                                            />
                                        </div>
                                    )
                                })}

                                {/* Image Uploader Section */}
                                {(activeTab === 'products' || activeTab === 'slider' || activeTab === 'stories' || activeTab === 'categories' || activeTab === 'routes') && (
                                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5 mt-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Medya Yönetimi</label>
                                            <div className="flex gap-2 bg-black/40 p-1 rounded-lg">
                                                <button onClick={() => setImageSource('upload')} className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${imageSource === 'upload' ? 'bg-[#F2A619] text-black' : 'text-gray-400 hover:text-white'}`}>YÜKLE</button>
                                                <button onClick={() => setImageSource('url')} className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${imageSource === 'url' ? 'bg-[#F2A619] text-black' : 'text-gray-400 hover:text-white'}`}>URL</button>
                                            </div>
                                        </div>

                                        {imageSource === 'upload' ? (
                                            <FilePond
                                                files={files}
                                                onupdatefiles={setFiles}
                                                allowMultiple={true}
                                                maxFiles={5}
                                                server={{
                                                    process: async (fieldName: any, file: any, metadata: any, load: any, error: any, progress: any, abort: any) => {
                                                        try {
                                                            const url = await storageService.uploadFile(file);
                                                            setFormData((prev: any) => ({
                                                                ...prev,
                                                                images: [...(prev.images || []), url],
                                                                image: prev.image || url
                                                            }));
                                                            load(url);
                                                        } catch (err) { error('Upload failed'); }
                                                    }
                                                }}
                                                labelIdle='Sürükle bırak veya <span class="filepond--label-action">Gözat</span>'
                                                credits={false}
                                                className="filepond-dark"
                                            />
                                        ) : (
                                            <div className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="https://..."
                                                    className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs outline-none focus:border-[#F2A619]"
                                                    value={formData.tempUrlInput || ''}
                                                    onChange={e => setFormData({ ...formData, tempUrlInput: e.target.value })}
                                                />
                                                <button onClick={handleAddUrlImage} className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl font-bold text-xs">EKLE</button>
                                            </div>
                                        )}

                                        {/* Preview Gallery */}
                                        <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                            {(formData.images || (formData.image ? [formData.image] : [])).map((img: string, i: number) => (
                                                <div key={i} className="relative w-20 h-20 flex-shrink-0 group rounded-xl overflow-hidden border border-white/10">
                                                    {img.includes('mp4') || img.includes('webm') ? (
                                                        <video src={img} className="w-full h-full object-cover" muted />
                                                    ) : (
                                                        <img src={img} className="w-full h-full object-cover" />
                                                    )}
                                                    <button onClick={() => handleRemoveImage(img)} className="absolute top-1 right-1 bg-red-500 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3 text-white" /></button>
                                                    {formData.image === img && <div className="absolute bottom-0 left-0 right-0 bg-[#F2A619] text-black text-[8px] font-bold text-center py-0.5">ANA</div>}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="pt-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-[#1A1A17]">
                                    <Button variant="outline" onClick={() => setIsModalOpen(false)} className="border-white/10 text-gray-400 hover:text-white">İPTAL</Button>
                                    <Button onClick={handleSave} className="bg-[#F2A619] text-black hover:bg-white shadow-lg shadow-[#F2A619]/20">{isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />} {isSaving ? 'KAYDEDİLİYOR...' : 'KAYDET'}</Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
