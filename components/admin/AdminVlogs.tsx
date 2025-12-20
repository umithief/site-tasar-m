import React from 'react';
import { Edit2, Trash2, MapPin, Eye, Play, Search, Plus } from 'lucide-react';
import { MotoVlog } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';

interface AdminVlogsProps {
    vlogs: MotoVlog[];
    handleAddNew: () => void;
    handleEdit: (vlog: MotoVlog) => void;
    handleDelete: (id: string) => void;
    searchTerm: string;
}

export const AdminVlogs: React.FC<AdminVlogsProps> = ({ vlogs, handleAddNew, handleEdit, handleDelete, searchTerm }) => {

    // Filter
    const filteredVlogs = vlogs.filter(vlog =>
        vlog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vlog.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#1A1A17] p-6 rounded-3xl border border-white/5">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Vlog Yönetimi</h2>
                    <p className="text-gray-400 text-sm">Haritada paylaşılan sürüş videolarını düzenleyin.</p>
                </div>
                <button onClick={handleAddNew} className="flex items-center gap-2 bg-[#F2A619] text-black px-6 py-3 rounded-xl font-bold hover:bg-white transition-all shadow-lg shadow-[#F2A619]/20">
                    <Plus className="w-5 h-5" />
                    <span className="hidden md:inline">Yeni Vlog</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredVlogs.map((vlog) => (
                    <div key={vlog._id} className="group bg-[#1A1A17] border border-white/5 rounded-3xl overflow-hidden hover:border-[#F2A619]/50 transition-all duration-300">
                        {/* Thumbnail */}
                        <div className="relative aspect-video bg-black">
                            <img src={vlog.thumbnail} alt={vlog.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                                <div className="flex items-center gap-2 text-xs font-bold text-white">
                                    <MapPin className="w-3 h-3 text-[#F2A619]" />
                                    <span className="truncate max-w-[150px]">{vlog.locationName}</span>
                                </div>
                            </div>

                            <a href={vlog.videoUrl} target="_blank" rel="noreferrer" className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 backdrop-blur flex items-center justify-center text-white hover:bg-[#F2A619] hover:text-black transition-colors">
                                <Play className="w-4 h-4 fill-current" />
                            </a>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                            <h3 className="font-bold text-white mb-3 line-clamp-1" title={vlog.title}>{vlog.title}</h3>

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <UserAvatar name={vlog.author} size={24} />
                                    <span className="text-xs text-gray-400 font-medium">{vlog.author}</span>
                                </div>
                                <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold bg-white/5 px-2 py-1 rounded-lg">
                                    <Eye className="w-3 h-3 text-[#F2A619]" />
                                    {vlog.views}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4 border-t border-white/5">
                                <button
                                    onClick={() => handleEdit(vlog)}
                                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold text-gray-300 hover:text-white transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit2 className="w-3 h-3" /> DÜZENLE
                                </button>
                                <button
                                    onClick={() => handleDelete(vlog._id)}
                                    className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-xs font-bold text-red-500 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-3 h-3" /> SİL
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredVlogs.length === 0 && (
                <div className="text-center py-20 bg-[#1A1A17] rounded-3xl border border-white/5 border-dashed">
                    <Search className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-gray-500">Vlog bulunamadı.</h3>
                </div>
            )}
        </div>
    );
};
