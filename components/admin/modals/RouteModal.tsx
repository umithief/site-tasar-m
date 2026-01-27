import React, { useState, useEffect } from 'react';
import { X, Upload, MapPin, Navigation, Clock, Activity, FileText } from 'lucide-react';
import { Route } from '../../../types';

interface RouteModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: any) => Promise<void>;
    editingRoute: Route | null;
}

export const RouteModal: React.FC<RouteModalProps> = ({ isOpen, onClose, onSave, editingRoute }) => {
    const [formData, setFormData] = useState({
        title: '',
        location: '',
        distance: '',
        duration: '', // Changed from estimatedTime to match type if needed, but UI usually says estimatedTime
        estimatedTime: '', // using estimatedTime to match backend
        difficulty: 'Orta',
        description: '',
        image: '',
        tags: '',
        bestSeason: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingRoute) {
            setFormData({
                title: editingRoute.title,
                location: editingRoute.location,
                distance: editingRoute.distance,
                duration: editingRoute.estimatedTime || '', // Map estimatedTime to local state 'duration' if needed, or better, rename local state to estimatedTime
                estimatedTime: editingRoute.estimatedTime || '',
                difficulty: editingRoute.difficulty,
                description: editingRoute.description,
                image: editingRoute.image,
                tags: editingRoute.tags ? editingRoute.tags.join(', ') : '',
                bestSeason: editingRoute.bestSeason || ''
            });
        } else {
            setFormData({
                title: '',
                location: '',
                distance: '',
                duration: '',
                estimatedTime: '',
                difficulty: 'Orta',
                description: '',
                image: '',
                tags: '',
                bestSeason: ''
            });
        }
    }, [editingRoute, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Convert tags string to array
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);

            await onSave({
                ...editingRoute,
                ...formData,
                duration: formData.estimatedTime, // sync
                tags: tagsArray
            });
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1A1A17] border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="sticky top-0 bg-[#1A1A17]/95 backdrop-blur z-10 p-6 border-b border-white/10 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        {editingRoute ? <Activity className="w-5 h-5 text-blue-500" /> : <Activity className="w-5 h-5 text-green-500" />}
                        {editingRoute ? 'Rotayı Düzenle' : 'Yeni Rota Ekle'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="space-y-4">
                        {/* Image Preview / Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kapak Görseli URL</label>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <div className="relative group">
                                        <input
                                            type="text"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                            className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-moto-accent transition-colors pl-10"
                                            placeholder="https://..."
                                            required
                                        />
                                        <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    </div>
                                </div>
                                {formData.image && (
                                    <div className="w-20 h-12 rounded-lg overflow-hidden border border-white/10 bg-black/50">
                                        <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Title & Location */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rota Başlığı</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-moto-accent transition-colors"
                                    placeholder="Örn: Şile Sahil Yolu"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lokasyon</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.location}
                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-moto-accent transition-colors pl-10"
                                        placeholder="Örn: İstanbul, Şile"
                                        required
                                    />
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mesafe</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.distance}
                                        onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-moto-accent transition-colors pl-10"
                                        placeholder="145 km"
                                        required
                                    />
                                    <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Süre</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        value={formData.estimatedTime}
                                        onChange={(e) => setFormData({ ...formData, estimatedTime: e.target.value })}
                                        className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-moto-accent transition-colors pl-10"
                                        placeholder="2h 15m"
                                        required
                                    />
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Zorluk</label>
                                <select
                                    value={formData.difficulty}
                                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-moto-accent transition-colors appearance-none"
                                >
                                    <option value="Kolay">Kolay</option>
                                    <option value="Orta">Orta</option>
                                    <option value="Zor">Zor</option>
                                    <option value="Extreme">Extreme</option>
                                </select>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Açıklama</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-moto-accent transition-colors min-h-[100px]"
                                placeholder="Rota hakkında detaylı bilgi..."
                                required
                            />
                        </div>

                        {/* Tags & Season */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Etiketler (Virgülle ayırın)</label>
                                <input
                                    type="text"
                                    value={formData.tags}
                                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-moto-accent transition-colors"
                                    placeholder="Virajlı, Manzara, Orman"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">En İyi Sezon</label>
                                <input
                                    type="text"
                                    value={formData.bestSeason}
                                    onChange={(e) => setFormData({ ...formData, bestSeason: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-moto-accent transition-colors"
                                    placeholder="İlkbahar, Yaz"
                                />
                            </div>
                        </div>

                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5 transition-colors"
                        >
                            İPTAL
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-moto-accent to-yellow-600 text-black text-sm font-bold hover:shadow-lg hover:shadow-moto-accent/20 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : null}
                            {editingRoute ? 'GÜNCELLE' : 'OLUŞTUR'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
