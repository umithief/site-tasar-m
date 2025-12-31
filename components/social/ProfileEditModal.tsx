import React, { useState } from 'react';
import { Dialog } from '../ui/dialog';
import { X, Save, Camera, User, FileText, MapPin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { notify } from '../../services/notificationService';

interface ProfileEditModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileEditModal: React.FC<ProfileEditModalProps> = ({ isOpen, onClose }) => {
    const { user, updateUser } = useAuthStore();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        bio: user?.bio || '',
        location: user?.location || '',
        coverImage: user?.coverImage || ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate API Update
        setTimeout(() => {
            updateUser({ ...user, ...formData } as any);
            notify.success("Profil başarıyla güncellendi.");
            setIsLoading(false);
            onClose();
        }, 800);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-[#1A1A17] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1A1A17]">
                    <h2 className="text-xl font-display font-black text-white flex items-center gap-2 uppercase tracking-wide">
                        <User className="w-5 h-5 text-moto-accent" /> System Config
                    </h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 overflow-y-auto custom-scrollbar space-y-6">

                    {/* Cover Image Preview */}
                    <div className="relative h-32 rounded-xl overflow-hidden group border border-white/10">
                        <img
                            src={formData.coverImage || 'https://images.unsplash.com/photo-1625055088214-5d8f6155680d?q=80&w=2069'}
                            className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="bg-black/60 px-3 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-2 border border-white/20">
                                <Camera className="w-3 h-3" /> Değiştir
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Görünen İsim</label>
                            <input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-moto-accent outline-none font-bold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase">Kullanıcı Adı (@)</label>
                            <input
                                value={formData.username}
                                onChange={e => setFormData({ ...formData, username: e.target.value })}
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-moto-accent outline-none font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                            <MapPin className="w-3 h-3" /> Konum
                        </label>
                        <input
                            value={formData.location}
                            onChange={e => setFormData({ ...formData, location: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-moto-accent outline-none text-sm"
                            placeholder="İstanbul, Türkiye"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                            <FileText className="w-3 h-3" /> Biyografi
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={e => setFormData({ ...formData, bio: e.target.value })}
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-moto-accent outline-none min-h-[120px] resize-none text-sm leading-relaxed"
                            placeholder="Kendinden bahset..."
                        />
                    </div>

                </form>

                <div className="p-6 border-t border-white/10 bg-[#1A1A17]">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className="w-full bg-moto-accent hover:bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isLoading ? 'Kaydediliyor...' : <><Save className="w-4 h-4" /> DEĞİŞİKLİKLERİ KAYDET</>}
                    </button>
                </div>
            </motion.div>
        </div>
    );
};
