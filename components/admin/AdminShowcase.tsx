import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon, ShoppingBag, List, Check } from 'lucide-react';
import { showcaseService } from '../../services/showcaseService';
import { Product, ProductCategory } from '../../types';
// @ts-ignore
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
// @ts-ignore
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import { storageService } from '../../services/storageService';

registerPlugin(FilePondPluginImagePreview);

export const AdminShowcase = () => {
    const [items, setItems] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [files, setFiles] = useState<any[]>([]);
    const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
    const [currentItem, setCurrentItem] = useState<Partial<Product>>({
        name: '',
        description: '',
        price: 0,
        category: ProductCategory.HELMET,
        image: '',
        features: [],
        stock: 0
    });

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            const data = await showcaseService.getAll();
            setItems(data);
        } catch (error) {
            console.error('Vitrin ürünleri yüklenemedi:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (currentItem._id) {
                await showcaseService.update(currentItem._id, currentItem);
            } else {
                await showcaseService.add(currentItem);
            }
            setIsEditing(false);
            setCurrentItem({});
            loadItems();
        } catch (error) {
            alert('İşlem başarısız oldu');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Emin misiniz?')) return;
        try {
            await showcaseService.delete(id);
            loadItems();
        } catch (error) {
            alert('Silinemedi');
        }
    };

    const handleFeatureChange = (text: string) => {
        // Simple comma separated for now, or new line
        setCurrentItem({ ...currentItem, features: text.split(',').map(s => s.trim()).filter(Boolean) });
    };

    return (
        <div className="space-y-6 text-white">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">
                        Vitrin (Cinema Showcase) Yönetimi
                    </h2>
                    <p className="text-gray-400 text-sm mt-1">Ana sayfadaki 3D kart vitrinini düzenleyin</p>
                </div>
                <button
                    onClick={() => {
                        setCurrentItem({
                            name: '',
                            description: '',
                            price: 0,
                            category: ProductCategory.HELMET,
                            image: '',
                            features: [],
                            stock: 1
                        });
                        setFiles([]);
                        setImageSource('upload');
                        setIsEditing(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <Plus size={18} />
                    <span>Yeni Ürün Ekle</span>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {items.map((item) => (
                    <motion.div
                        key={item._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-center"
                    >
                        <div className="w-full md:w-32 h-32 rounded-lg overflow-hidden bg-black/50 relative group">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <ImageIcon className="text-white/50" />
                            </div>
                        </div>

                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <h3 className="text-xl font-bold">{item.name}</h3>
                            <p className="text-gray-400 text-sm line-clamp-2">{item.description}</p>
                            <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono text-moto-accent">
                                    {item.category}
                                </span>
                                <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono">
                                    ₺{item.price?.toLocaleString()}
                                </span>
                                <span className="px-2 py-1 bg-white/10 rounded text-xs font-mono">
                                    Stok: {item.stock}
                                </span>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2 justify-center md:justify-start">
                                {item.features?.map((f, i) => (
                                    <span key={i} className="text-[10px] text-gray-500 border border-gray-700 px-1 rounded">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    setCurrentItem(item);
                                    setFiles([]);
                                    setImageSource('url');
                                    setIsEditing(true);
                                }}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-blue-400"
                            >
                                <Edit2 size={18} />
                            </button>
                            <button
                                onClick={() => handleDelete(item._id)}
                                className="p-2 hover:bg-white/10 rounded-lg transition-colors text-red-500"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#111] z-10">
                                <h3 className="text-xl font-bold">
                                    {currentItem._id ? 'Ürünü Düzenle' : 'Yeni Vitrin Ürünü'}
                                </h3>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="p-2 hover:bg-white/10 rounded-full"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Ürün Adı</label>
                                        <input
                                            type="text"
                                            value={currentItem.name}
                                            onChange={e => setCurrentItem({ ...currentItem, name: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-moto-accent"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Kategori</label>
                                        <select
                                            value={currentItem.category}
                                            onChange={e => setCurrentItem({ ...currentItem, category: e.target.value as ProductCategory })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-moto-accent [&>option]:bg-black"
                                        >
                                            {Object.values(ProductCategory).map(cat => (
                                                <option key={cat} value={cat}>{cat}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Fiyat (₺)</label>
                                        <input
                                            type="number"
                                            value={currentItem.price}
                                            onChange={e => setCurrentItem({ ...currentItem, price: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-moto-accent"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400">Stok</label>
                                        <input
                                            type="number"
                                            value={currentItem.stock}
                                            onChange={e => setCurrentItem({ ...currentItem, stock: Number(e.target.value) })}
                                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-moto-accent"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center mb-1">
                                        <label className="text-sm text-gray-400">Görsel / Video</label>
                                        <div className="flex gap-2 bg-black/40 p-1 rounded-lg">
                                            <button type="button" onClick={() => setImageSource('upload')} className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${imageSource === 'upload' ? 'bg-[#F2A619] text-black' : 'text-gray-400 hover:text-white'}`}>YÜKLE</button>
                                            <button type="button" onClick={() => setImageSource('url')} className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${imageSource === 'url' ? 'bg-[#F2A619] text-black' : 'text-gray-400 hover:text-white'}`}>URL</button>
                                        </div>
                                    </div>

                                    {imageSource === 'upload' ? (
                                        <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                                            <FilePond
                                                files={files}
                                                onupdatefiles={setFiles}
                                                allowMultiple={false}
                                                server={{
                                                    process: async (fieldName: any, file: any, metadata: any, load: any, error: any, progress: any, abort: any) => {
                                                        try {
                                                            const url = await storageService.uploadFile(file);
                                                            setCurrentItem(prev => ({ ...prev, image: url }));
                                                            load(url);
                                                        } catch (err) { error('Upload failed'); }
                                                    }
                                                }}
                                                labelIdle='Sürükle bırak veya <span class="filepond--label-action">Gözat</span>'
                                                credits={false}
                                                className="filepond-dark"
                                            />
                                            {currentItem.image && !files.length && (
                                                <div className="mt-2 text-xs text-green-400">Mevcut görsel korunuyor</div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="url"
                                                value={currentItem.image}
                                                onChange={e => setCurrentItem({ ...currentItem, image: e.target.value })}
                                                className="flex-1 bg-white/5 border border-white/10 rounded-lg p-3 focus:outline-none focus:border-moto-accent"
                                                placeholder="https://..."
                                                required
                                            />
                                            {currentItem.image && (
                                                <div className="w-12 h-12 rounded bg-black/50 overflow-hidden border border-white/10">
                                                    <img src={currentItem.image} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Açıklama</label>
                                    <textarea
                                        value={currentItem.description}
                                        onChange={e => setCurrentItem({ ...currentItem, description: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 h-24 focus:outline-none focus:border-moto-accent resize-none"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm text-gray-400">Özellikler (Virgül ile ayırın)</label>
                                    <textarea
                                        value={currentItem.features?.join(', ')}
                                        onChange={e => handleFeatureChange(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 h-20 focus:outline-none focus:border-moto-accent resize-none placeholder-gray-600"
                                        placeholder="Karbon Fiber, Su Geçirmez, Garanti..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4 border-t border-white/10">
                                    <button
                                        type="button"
                                        onClick={() => setIsEditing(false)}
                                        className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors font-medium"
                                    >
                                        İptal
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-3 rounded-lg bg-moto-accent hover:bg-moto-accent/80 transition-colors text-white font-bold flex items-center justify-center gap-2"
                                    >
                                        <Save size={18} />
                                        <span>Kaydet</span>
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
