import React, { useState, useEffect } from 'react';
import { X, Upload } from 'lucide-react';
import { CategoryItem, ProductCategory } from '../../../types';
import { Button } from '../../ui/Button';

interface CategoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (category: Partial<CategoryItem>) => void;
    editingCategory: CategoryItem | null;
}

export const CategoryModal: React.FC<CategoryModalProps> = ({ isOpen, onClose, onSave, editingCategory }) => {
    const [formData, setFormData] = useState<Partial<CategoryItem>>({
        name: '',
        type: ProductCategory.ACCESSORY,
        image: '',
        desc: '',
        count: '0 Model',
        className: 'col-span-1 row-span-1'
    });

    useEffect(() => {
        if (editingCategory) {
            setFormData(editingCategory);
        } else {
            setFormData({
                name: '',
                type: ProductCategory.ACCESSORY,
                image: '',
                desc: '',
                count: '0 Model',
                className: 'col-span-1 row-span-1'
            });
        }
    }, [editingCategory, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-[#1A1A17] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">
                        {editingCategory ? 'Kategoriyi Düzenle' : 'Yeni Kategori Ekle'}
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori Adı</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors"
                            placeholder="Örn: Kasklar"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Kategori Tipi</label>
                        <select
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value as ProductCategory })}
                        >
                            {Object.values(ProductCategory).map((type) => (
                                <option key={type} value={type} className="bg-[#1A1A17] text-white">
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Görsel URL</label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors"
                                placeholder="https://..."
                                value={formData.image}
                                onChange={e => setFormData({ ...formData, image: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Açıklama</label>
                        <input
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors"
                            placeholder="Örn: Maksimum Güvenlik"
                            value={formData.desc}
                            onChange={e => setFormData({ ...formData, desc: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Ürün Sayısı Etiketi</label>
                        <input
                            type="text"
                            className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:border-[#E2FF3B] focus:outline-none transition-colors"
                            placeholder="Örn: 142 Model"
                            value={formData.count}
                            onChange={e => setFormData({ ...formData, count: e.target.value })}
                        />
                    </div>

                    <div className="pt-4 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
                        <Button type="submit" className="bg-[#E2FF3B] text-black hover:bg-[#ccee00]">Kaydet</Button>
                    </div>
                </form>
            </div>
        </div>
    );
};
