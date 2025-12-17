import React from 'react';
import { CategoryItem } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminCategoriesProps {
    categories: CategoryItem[];
    handleAddNew: () => void;
    handleEdit: (category: CategoryItem) => void;
    handleDelete: (id: any) => void;
}

export const AdminCategories: React.FC<AdminCategoriesProps> = ({ categories, handleAddNew, handleEdit, handleDelete }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-end">
                <Button onClick={handleAddNew} className="bg-[#F2A619] text-black shadow-lg">
                    <Plus className="w-4 h-4 mr-2" /> YENİ KATEGORİ
                </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map(cat => (
                    <div key={cat._id} className="bg-[#1A1A17] border border-white/5 rounded-2xl overflow-hidden group">
                        <div className="relative h-40">
                            <img src={cat.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 transition-colors"></div>
                            <div className="absolute bottom-4 left-4">
                                <h3 className="font-bold text-white text-lg">{cat.name}</h3>
                                <p className="text-xs text-gray-300">{cat.count}</p>
                            </div>
                            <div className="absolute top-2 right-2 flex gap-2">
                                <button onClick={() => handleEdit(cat)} className="p-2 bg-black/60 rounded-full text-white hover:bg-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => handleDelete(cat._id)} className="p-2 bg-black/60 rounded-full text-white hover:bg-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                            </div>
                        </div>
                        <div className="p-4 flex justify-between items-center">
                            <span className="text-xs text-gray-500 bg-white/5 px-2 py-1 rounded">{cat.type}</span>
                            <span className="text-xs text-gray-500 italic">{cat.desc}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
