import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { Play, Check, X, Star, Trash2 } from 'lucide-react';

interface Reel {
    _id: string;
    videoUrl: string;
    thumbnailUrl: string;
    caption: string;
    userName: string;
    isApproved: boolean;
    isFeatured: boolean;
    createdAt: string;
}

export const AdminReelManager: React.FC = () => {
    const [reels, setReels] = useState<Reel[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReels();
    }, []);

    const fetchReels = async () => {
        try {
            const res = await api.get('/reels/admin/all');
            setReels(res.data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'approve' | 'feature' | 'delete', currentVal?: boolean) => {
        try {
            if (action === 'delete') {
                if (window.confirm('Bu reel\'i silmek istediğinize emin misiniz?')) {
                    await api.delete(`/reels/admin/${id}`);
                    setReels(prev => prev.filter(r => r._id !== id));
                }
            } else {
                const payload: any = {};
                if (action === 'approve') payload.isApproved = !currentVal;
                if (action === 'feature') payload.isFeatured = !currentVal;

                const res = await api.patch(`/reels/admin/${id}`, payload);
                setReels(prev => prev.map(r => r._id === id ? { ...r, ...res.data } : r));
            }
        } catch (error) {
            console.error('Action failed:', error);
        }
    };

    if (loading) return <div className="p-8 text-white">Yükleniyor...</div>;

    return (
        <div className="bg-[#121212] p-6 rounded-3xl border border-white/10 min-h-screen lg:min-h-0">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                <Play className="w-6 h-6 text-orange-500" />
                VELOCITY REELS MANAGER
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {reels.map(reel => (
                    <div key={reel._id} className="bg-white/5 rounded-2xl overflow-hidden border border-white/10 group hover:border-orange-500/50 transition-colors">
                        <div className="relative aspect-[9/16] bg-black">
                            <video src={reel.videoUrl} className="w-full h-full object-cover opacity-60" muted />
                            <div className="absolute top-2 left-2 right-2 flex justify-between">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${reel.isApproved ? 'bg-green-500 text-black' : 'bg-yellow-500 text-black'}`}>
                                    {reel.isApproved ? 'ONAYLI' : 'BEKLEMEDE'}
                                </span>
                                {reel.isFeatured && (
                                    <span className="px-2 py-1 rounded bg-orange-500 text-white text-[10px] font-bold uppercase flex items-center gap-1">
                                        <Star className="w-3 h-3 fill-current" /> Featured
                                    </span>
                                )}
                            </div>
                            <div className="absolute bottom-4 left-4 right-4">
                                <p className="text-white font-bold text-sm truncate">{reel.userName}</p>
                                <p className="text-white/60 text-xs truncate">{reel.caption}</p>
                                <p className="text-white/40 text-[10px] mt-1">{new Date(reel.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-4 grid grid-cols-3 gap-2">
                            <button
                                onClick={() => handleAction(reel._id, 'approve', reel.isApproved)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${reel.isApproved ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                title="Onayla / Gizle"
                            >
                                {reel.isApproved ? <Check className="w-5 h-5" /> : <Check className="w-5 h-5 opacity-50" />}
                                <span className="text-[9px] font-bold mt-1 uppercase">{reel.isApproved ? 'Aktif' : 'Onayla'}</span>
                            </button>

                            <button
                                onClick={() => handleAction(reel._id, 'feature', reel.isFeatured)}
                                className={`flex flex-col items-center justify-center p-2 rounded-xl transition-colors ${reel.isFeatured ? 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20' : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'}`}
                                title="Öne Çıkar"
                            >
                                <Star className={`w-5 h-5 ${reel.isFeatured ? 'fill-current' : ''}`} />
                                <span className="text-[9px] font-bold mt-1 uppercase">Vitrin</span>
                            </button>

                            <button
                                onClick={() => handleAction(reel._id, 'delete')}
                                className="flex flex-col items-center justify-center p-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                title="Sil"
                            >
                                <Trash2 className="w-5 h-5" />
                                <span className="text-[9px] font-bold mt-1 uppercase">Sil</span>
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
