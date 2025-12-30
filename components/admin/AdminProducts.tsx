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

            <div className="bg-[#121212] border border-white/5 rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Glossy Header Effect */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#F2A619]/50 to-transparent opacity-50"></div>

                <table className="w-full text-left border-collapse">
                    <thead className="bg-[#1A1A17] text-gray-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                        <tr>
                            <th className="p-6 pl-8">Ürün Detayları</th>
                            <th className="p-6">Kategori</th>
                            <th className="p-6">Fiyat</th>
                            <th className="p-6">Stok Durumu</th>
                            <th className="p-6">Rozetler</th>
                            <th className="p-6 text-right pr-8">İşlemler</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(product => (
                            <tr key={product._id} className="hover:bg-white/[0.02] transition-colors group relative">
                                <td className="p-5 pl-8">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 rounded-2xl bg-white/[0.02] border border-white/5 p-2 overflow-hidden group-hover:border-[#F2A619]/20 transition-colors relative">
                                            <img src={product.image} className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500" />
                                            {/* Hover Zoom Preview Trigger could go here */}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-sm group-hover:text-[#F2A619] transition-colors mb-1">{product.name}</div>
                                            <div className="text-[10px] text-gray-500 font-mono tracking-wide">ID: {product._id.slice(-6)}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <span className="px-3 py-1.5 rounded-lg bg-white/5 text-gray-400 text-xs font-bold border border-white/5 group-hover:border-white/10 transition-colors">
                                        {product.category}
                                    </span>
                                </td>
                                <td className="p-5">
                                    <div className="font-mono font-bold text-white text-sm">₺{product.price.toLocaleString()}</div>
                                </td>
                                <td className="p-5">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${product.stock < 5 ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`}></div>
                                        <span className={`text-xs font-bold ${product.stock < 5 ? 'text-red-500' : 'text-green-500'}`}>
                                            {product.stock} Adet
                                        </span>
                                    </div>
                                    <div className="w-24 h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${product.stock < 5 ? 'bg-red-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(100, (product.stock / 50) * 100)}%` }}
                                        ></div>
                                    </div>
                                </td>
                                <td className="p-5">
                                    <div className="flex gap-2">
                                        {product.isEditorsChoice && (
                                            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-500" title="Editörün Seçimi">
                                                <Award className="w-4 h-4" />
                                            </div>
                                        )}
                                        {product.isDealOfTheDay && (
                                            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500" title="Günün Fırsatı">
                                                <Zap className="w-4 h-4" />
                                            </div>
                                        )}
                                        {!product.isEditorsChoice && !product.isDealOfTheDay && (
                                            <span className="text-[10px] text-gray-600 font-bold uppercase">-</span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-5 pr-8 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleToggleProductStatus(product, 'isEditorsChoice')} className={`p-2 rounded-xl border transition-all ${product.isEditorsChoice ? 'bg-purple-500 text-white border-purple-500 shadow-lg shadow-purple-500/20' : 'bg-transparent border-white/10 text-gray-500 hover:text-purple-400 hover:border-purple-400/50'}`} title="Editörün Seçimi">
                                            <Award className="w-4 h-4" />
                                        </button>
                                        <button onClick={() => handleToggleProductStatus(product, 'isDealOfTheDay')} className={`p-2 rounded-xl border transition-all ${product.isDealOfTheDay ? 'bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20' : 'bg-transparent border-white/10 text-gray-500 hover:text-red-400 hover:border-red-400/50'}`} title="Fırsat Ürünü">
                                            <Zap className="w-4 h-4" />
                                        </button>
                                        <div className="w-px h-8 bg-white/10 mx-1"></div>
                                        <button onClick={() => handleEdit(product)} className="p-2 rounded-xl bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(product._id)} className="p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button>
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
