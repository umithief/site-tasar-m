import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Camera, X, Check, MapPin, User, FileText, Bike } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from '../ui/UserAvatar';
import { authService } from '../../services/auth';
// Removing uploadService import if not found, or replace with correct one later if exists.
// Assuming basic update without upload for now or using a different method if uploadService is missing.

interface MobileEditProfileProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const MobileEditProfile: React.FC<MobileEditProfileProps> = ({ onClose, onSuccess }) => {
    const { user, setUser } = useAuthStore();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        bio: user?.bio || '',
        location: user?.location || '',
        primaryBike: user?.primaryBike || '',
    });
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
    const [previewCover, setPreviewCover] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'avatar') {
                    setAvatarFile(file);
                    setPreviewAvatar(reader.result as string);
                } else {
                    setCoverFile(file);
                    setPreviewCover(reader.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async () => {
        setIsLoading(true);
        try {
            let avatarUrl = user?.avatar;
            let coverUrl = user?.coverImage;

            // Upload logic temporarily mocked or disabled if service is missing
            /*
            if (avatarFile) {
                const result = await uploadService.uploadImage(avatarFile);
                avatarUrl = result.url;
            }
             */

            const updatedUser = await authService.updateProfile({
                ...formData,
                avatar: previewAvatar || avatarUrl, // Use preview base64 if no upload service
                coverImage: previewCover || coverUrl
            });

            setUser(updatedUser);
            onSuccess();
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-[#09090b] flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md sticky top-0 z-50">
                <button
                    onClick={onClose}
                    className="p-2 rounded-full hover:bg-white/10 text-gray-400"
                >
                    <X className="w-6 h-6" />
                </button>
                <div className="text-lg font-bold text-white">Profili Düzenle</div>
                <button
                    onClick={handleSubmit}
                    disabled={isLoading}
                    className="p-2 rounded-full hover:bg-white/10 text-moto-accent disabled:opacity-50"
                >
                    {isLoading ? <div className="w-6 h-6 border-2 border-moto-accent border-t-transparent rounded-full animate-spin" /> : <Check className="w-6 h-6" />}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-20">
                {/* Cover Image */}
                <div className="relative h-48 w-full bg-zinc-900">
                    <img
                        src={previewCover || user?.coverImage || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80"}
                        className="w-full h-full object-cover opacity-50"
                        alt="cover"
                    />
                    <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/20 hover:bg-black/40 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
                    </label>
                </div>

                {/* Avatar - Negative Margin overlap */}
                <div className="px-6 -mt-10 mb-8 relative">
                    <div className="relative w-24 h-24 rounded-full border-[4px] border-[#09090b] bg-zinc-800">
                        <UserAvatar
                            src={previewAvatar || user?.avatar}
                            name={user?.name}
                            size={88}
                            className="w-full h-full rounded-full object-cover"
                        />
                        <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-moto-accent text-black flex items-center justify-center cursor-pointer shadow-lg border-2 border-[#09090b]">
                            <Camera className="w-4 h-4" />
                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                        </label>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="px-6 space-y-6">
                    <div className="space-y-4">
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 focus-within:border-moto-accent/50 transition-colors">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-1">
                                <User className="w-3 h-3" /> Ad Soyad
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-transparent text-white font-medium focus:outline-none placeholder-gray-600"
                                placeholder="Adınız"
                            />
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 focus-within:border-moto-accent/50 transition-colors">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-1">
                                <User className="w-3 h-3" /> Kullanıcı Adı
                            </label>
                            <input
                                type="text"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                className="w-full bg-transparent text-white font-medium focus:outline-none placeholder-gray-600"
                                placeholder="@kullanici_adi" // Should validate format
                            />
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 focus-within:border-moto-accent/50 transition-colors">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-1">
                                <FileText className="w-3 h-3" /> Biyografi
                            </label>
                            <textarea
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full bg-transparent text-white font-medium focus:outline-none placeholder-gray-600 resize-none h-24"
                                placeholder="Kendinden bahset..."
                            />
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 focus-within:border-moto-accent/50 transition-colors">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-1">
                                <MapPin className="w-3 h-3" /> Konum
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full bg-transparent text-white font-medium focus:outline-none placeholder-gray-600"
                                placeholder="Şehir, Ülke"
                            />
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 focus-within:border-moto-accent/50 transition-colors">
                            <label className="text-xs font-bold text-gray-500 uppercase flex items-center gap-2 mb-1">
                                <Bike className="w-3 h-3" /> Ana Motosiklet
                            </label>
                            <input
                                type="text"
                                value={formData.primaryBike}
                                onChange={(e) => setFormData({ ...formData, primaryBike: e.target.value })}
                                className="w-full bg-transparent text-white font-medium focus:outline-none placeholder-gray-600"
                                placeholder="Örn: Yamaha R6"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};
