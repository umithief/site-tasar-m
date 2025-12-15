import React from 'react';
import { Route } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminRoutesProps {
    routes: Route[];
    handleAddNew: () => void;
    handleEdit: (route: Route) => void;
    handleDelete: (id: any) => void;
}

export const AdminRoutes: React.FC<AdminRoutesProps> = ({ routes, handleAddNew, handleEdit, handleDelete }) => {
    return (
        <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="flex justify-end">
                <Button onClick={handleAddNew} className="bg-[#F2A619] text-black shadow-lg">
                    <Plus className="w-4 h-4 mr-2" /> YENİ ROTA
                </Button>
            </div>
            <div className="bg-[#1A1A17] border border-white/5 rounded-3xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-white/5 text-gray-400 text-xs font-bold uppercase tracking-wider">
                        <tr>
                            <th className="p-5 pl-8">Rota</th>
                            <th className="p-5">Lokasyon</th>
                            <th className="p-5">Zorluk</th>
                            <th className="p-5">Mesafe/Süre</th>
                            <th className="p-5 text-right pr-8">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {routes.map(route => (
                            <tr key={route.id} className="hover:bg-white/5 transition-colors">
                                <td className="p-5 pl-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-12 rounded-lg overflow-hidden">
                                            <img src={route.image} className="w-full h-full object-cover" />
                                        </div>
                                        <span className="font-bold text-white">{route.title}</span>
                                    </div>
                                </td>
                                <td className="p-5 text-gray-400">{route.location}</td>
                                <td className="p-5">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${route.difficulty === 'Kolay' ? 'bg-green-500/20 text-green-500' :
                                        route.difficulty === 'Orta' ? 'bg-yellow-500/20 text-yellow-500' :
                                            'bg-red-500/20 text-red-500'
                                        }`}>
                                        {route.difficulty}
                                    </span>
                                </td>
                                <td className="p-5 text-gray-400 font-mono">{route.distance} / {route.duration}</td>
                                <td className="p-5 pr-8 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button onClick={() => handleEdit(route)} className="p-2 rounded-lg hover:bg-blue-500/20 text-gray-400 hover:text-blue-500 transition-colors"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => handleDelete(route.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-gray-400 hover:text-red-500 transition-colors"><Trash2 className="w-4 h-4" /></button>
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
