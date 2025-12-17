import React from 'react';
import { Plus, Edit2, Trash2, Award, Zap } from 'lucide-react';
import { Button } from '../ui/Button';
import { Product } from '../../types';

interface AdminProductsProps {
    products: Product[];
    searchTerm: string;
    handleAddNew: () => void;
    handleEdit: (product: Product) => void;
    handleDelete: (id: any) => void;
    handleToggleProductStatus: (product: Product, field: 'isEditorsChoice' | 'isDealOfTheDay') => void;
}

export const AdminProducts: React.FC<AdminProductsProps> = ({ products, searchTerm, handleAddNew, handleEdit, handleDelete, handleToggleProductStatus }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-end">
                <Button onClick={handleAddNew} className="bg-[#F2A619] text-black shadow-lg shadow-[#F2A619]/20 font-bold">
                    <Plus className="w-4 h-4 mr-2" /> YENİ ÜRÜN
                </Button>
            </div>

            <div className="bg-[#1A1A17] border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="p-5 pl-8">Ürün</th>
                            <th className="p-5">Kategori</th>
                            <th className="p-5">Fiyat</th>
                            <th className="p-5">Stok</th>
                            <th className="p-5">Durum</th>
                            <th className="p-5 text-right pr-8">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                            <tr key={product._id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-5 pl-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-white p-1 overflow-hidden">
                                            <img src={product.image} className="w-full h-full object-contain" />
                                        </div>
                                        <span className="font-bold text-white group-hover:text-[#F2A619] transition-colors">{product.name}</span>
                                    </div>
                                </td>
                                <td className="p-5 text-gray-400">{product.category}</td>
                                <td className="p-5 font-mono font-bold text-white">₺{product.price.toLocaleString()}</td>
                                <td className="p-5">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${product.stock < 5 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
                                        {product.stock} Adet
                                    </span>
                                </td>
                                <td className="p-5">
                                    <div className="flex gap-2">
                                        {product.isEditorsChoice && <Award className="w-4 h-4 text-purple-500" />}
                                        {product.isDealOfTheDay && <Zap className="w-4 h-4 text-red-500" />}
                                    </div>
                                </td>
                                <td className="p-5 pr-8 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleToggleProductStatus(product, 'isEditorsChoice')} title="Editörün Seçimi" className={`p-2 rounded-lg hover:bg-white/10 ${product.isEditorsChoice ? 'text-purple-500' : 'text-gray-600'}`}><Award className="w-4 h-4" /></button>
                                        <button onClick={() => handleToggleProductStatus(product, 'isDealOfTheDay')} title="Fırsat Ürünü" className={`p-2 rounded-lg hover:bg-white/10 ${product.isDealOfTheDay ? 'text-red-500' : 'text-gray-600'}`}><Zap className="w-4 h-4" /></button>
                                        <button onClick={() => handleEdit(product)} className="p-2 rounded-lg hover:bg-blue-500/20 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(product._id)} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
