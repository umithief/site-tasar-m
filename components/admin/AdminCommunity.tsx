
import React from 'react';
import { Trash2, MessageSquare, Tag, Eye } from 'lucide-react';
import { ForumTopic } from '../../types';

interface AdminCommunityProps {
    topics: ForumTopic[];
    handleDelete: (id: string) => void;
}

export const AdminCommunity: React.FC<AdminCommunityProps> = ({ topics, handleDelete }) => {
    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white">Topluluk Yönetimi</h2>
                    <p className="text-gray-400 text-sm">Forum konuları ve içerik moderasyonu</p>
                </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/20 text-xs uppercase text-gray-500 font-bold">
                        <tr>
                            <th className="p-4">Başlık</th>
                            <th className="p-4">Yazar</th>
                            <th className="p-4">Kategori</th>
                            <th className="p-4">İstatistikler</th>
                            <th className="p-4">Tarih</th>
                            <th className="p-4 text-right">İşlem</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm">
                        {topics.map((topic) => (
                            <tr key={topic._id} className="hover:bg-white/5 transition-colors group">
                                <td className="p-4">
                                    <div className="font-bold text-white mb-1 line-clamp-1">{topic.title}</div>
                                    <div className="flex gap-2">
                                        {topic.tags.map((tag, i) => (
                                            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-gray-400">#{tag}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-300">
                                    <span className="text-xs font-mono">{topic.authorName}</span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-bold border border-white/10 ${topic.category === 'Duyuru' ? 'bg-red-500/20 text-red-500' :
                                            topic.category === 'Teknik' ? 'bg-blue-500/20 text-blue-500' :
                                                'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {topic.category}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex gap-4 text-xs text-gray-400">
                                        <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {topic.views}</span>
                                        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {topic.comments?.length || 0}</span>
                                    </div>
                                </td>
                                <td className="p-4 text-gray-400 text-xs font-mono">{topic.date}</td>
                                <td className="p-4 text-right">
                                    <button
                                        onClick={() => handleDelete(topic._id)}
                                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                        title="Konuyu Sil"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {topics.length === 0 && (
                    <div className="p-10 text-center text-gray-500">
                        Hiç konu bulunamadı.
                    </div>
                )}
            </div>
        </div>
    );
};
