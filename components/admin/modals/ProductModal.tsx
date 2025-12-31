import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, Image as ImageIcon, Plus } from 'lucide-react';
import { Button } from '../../ui/Button';
import { Product, ProductCategory } from '../../../types';
import { storageService } from '../../../services/storageService';
import { motion, AnimatePresence } from 'framer-motion';

// FilePond Imports (Reused from backup)
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

registerPlugin(
    FilePondPluginImagePreview,
    FilePondPluginFileValidateType,
    FilePondPluginImageCrop,
    FilePondPluginImageResize,
    FilePondPluginImageTransform
);

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (productData: any) => Promise<void>;
    editingProduct: Product | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSave, editingProduct }) => {
    const [formData, setFormData] = useState<any>({
        name: '',
        price: 0,
        category: 'Aksesuar',
        stock: 10,
        description: '',
        image: '',
        images: [],
        isNegotiable: false,
        isEditorsChoice: false,
        isDealOfTheDay: false
    });

    const [isSaving, setIsSaving] = useState(false);
    const [imageSource, setImageSource] = useState<'upload' | 'url'>('upload');
    const [files, setFiles] = useState<any[]>([]);

    useEffect(() => {
        if (editingProduct) {
            setFormData({
                ...editingProduct,
                images: editingProduct.images || (editingProduct.image ? [editingProduct.image] : [])
            });
            setImageSource(editingProduct.image && editingProduct.image.startsWith('http') && !editingProduct.image.includes('minio') ? 'url' : 'upload');
        } else {
            // Default Values
            setFormData({
                name: '',
                price: 0,
                category: 'Aksesuar',
                stock: 10,
                description: '',
                image: '',
                images: [],
                isNegotiable: false,
                isEditorsChoice: false,
                isDealOfTheDay: false
            });
            setFiles([]);
            setImageSource('upload');
        }
    }, [editingProduct, isOpen]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const finalData = { ...formData };
            delete finalData.tempUrlInput; // Clean up

            // Ensure main image is set
            if (finalData.images && finalData.images.length > 0) {
                finalData.image = finalData.images[0];
            }

            await onSave(finalData);
            onClose();
        } catch (error) {
            console.error("Save error", error);
        } finally {
            setIsSaving(false);
        }
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

    const handleRemoveImage = (urlToRemove: string) => {
        setFormData((prev: any) => ({
            ...prev,
            images: prev.images.filter((url: string) => url !== urlToRemove),
            image: prev.image === urlToRemove ? (prev.images.length > 1 ? prev.images[1] : '') : prev.image
        }));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-[#1A1A17] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl relative z-10 flex flex-col"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#1A1A17] z-20">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            {editingProduct ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'}
                        </h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-white"><X className="w-6 h-6" /></button>
                    </div>

                    {/* Body */}
                    <div className="p-8 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Ürün Adı</label>
                                <input type="text" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Fiyat (TL)</label>
                                <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none"
                                    value={formData.price} onChange={e => setFormData({ ...formData, price: Number(e.target.value) })} />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Kategori</label>
                                <select className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none"
                                    value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                                    {Object.values(ProductCategory).map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Stok</label>
                                <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none"
                                    value={formData.stock} onChange={e => setFormData({ ...formData, stock: Number(e.target.value) })} />
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="flex gap-4 flex-wrap">
                            {[
                                { key: 'isNegotiable', label: 'Pazarlık Payı Var' },
                                { key: 'isEditorsChoice', label: 'Editörün Seçimi' },
                                { key: 'isDealOfTheDay', label: 'Günün Fırsatı' }
                            ].map(item => (
                                <div key={item.key} className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/5 cursor-pointer" onClick={() => setFormData({ ...formData, [item.key]: !formData[item.key] })}>
                                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData[item.key] ? 'bg-[#F2A619] border-[#F2A619]' : 'border-gray-500'}`}>
                                        {formData[item.key] && <Check className="w-3 h-3 text-black" />}
                                    </div>
                                    <span className="text-sm font-bold text-white select-none">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block">Açıklama</label>
                            <textarea className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:border-[#F2A619] outline-none h-24 resize-none"
                                value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
                        </div>

                        {/* Image Upload Logic (Simplified) */}
                        <div className="bg-white/5 rounded-2xl p-5 border border-white/5">
                            <div className="flex justify-between items-center mb-4">
                                <label className="text-xs font-bold text-gray-400 uppercase flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Görseller</label>
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
                                    labelIdle='Sürükle bırak'
                                    credits={false}
                                    className="filepond-dark"
                                />
                            ) : (
                                <div className="flex gap-2">
                                    <input type="text" placeholder="https://..." className="flex-1 bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs outline-none"
                                        value={formData.tempUrlInput || ''} onChange={e => setFormData({ ...formData, tempUrlInput: e.target.value })} />
                                    <button onClick={handleAddUrlImage} className="bg-white/10 hover:bg-white/20 text-white px-4 rounded-xl font-bold text-xs">EKLE</button>
                                </div>
                            )}

                            <div className="flex gap-3 mt-4 overflow-x-auto pb-2">
                                {(formData.images || (formData.image ? [formData.image] : [])).map((img: string, i: number) => (
                                    <div key={i} className="relative w-16 h-16 flex-shrink-0 group rounded-xl overflow-hidden border border-white/10">
                                        <img src={img} className="w-full h-full object-cover" />
                                        <button onClick={() => handleRemoveImage(img)} className="absolute top-0 right-0 bg-red-500 p-0.5"><X className="w-3 h-3 text-white" /></button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-6 border-t border-white/10 flex justify-end gap-3 sticky bottom-0 bg-[#1A1A17]">
                            <Button variant="outline" onClick={onClose} className="border-white/10 text-gray-400 hover:text-white">İPTAL</Button>
                            <Button onClick={handleSave} disabled={isSaving} className="bg-[#F2A619] text-black hover:bg-white shadow-lg shadow-[#F2A619]/20">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Check className="w-4 h-4 mr-2" />}
                                {isSaving ? 'KAYDEDİLİYOR...' : 'KAYDET'}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
};
