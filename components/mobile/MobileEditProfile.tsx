import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Camera, X, Check, MapPin, User, FileText, Bike, Shield, Key, Plus, Trash2, Save, Lock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { UserAvatar } from '../ui/UserAvatar';
import { authService } from '../../services/auth';
import { api } from '../../services/api';
// Removing uploadService import if not found, or replace with correct one later if exists.
// Assuming basic update without upload for now or using a different method if uploadService is missing.

interface MobileEditProfileProps {
    onClose: () => void;
    onSuccess: () => void;
}

export const MobileEditProfile: React.FC<MobileEditProfileProps> = ({ onClose, onSuccess }) => {
    const { user, setUser, updateProfile } = useAuthStore();
    const [activeTab, setActiveTab] = useState<'profile' | 'garage' | 'security'>('profile');

    // Profile Form
    const [formData, setFormData] = useState({
        name: user?.name || '',
        username: user?.username || '',
        bio: user?.bio || '',
        location: user?.location || '',
        primaryBike: user?.primaryBike || '',
    });

    // Security Form
    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [privacySettings, setPrivacySettings] = useState({
        isPrivate: (user as any).privacy?.isPrivate || false,
        hideLocation: (user as any).privacy?.hideLocation || false
    });

    // Garage Form
    const [newBike, setNewBike] = useState({ brand: '', model: '', year: '', image: '' });
    const [isAddingBike, setIsAddingBike] = useState(false);

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
            className="fixed inset-0 z-50 bg-white flex flex-col transition-colors duration-300"
        >
            {/* Header */}
            <div className="flex flex-col bg-white/95 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50 transition-colors">
                <div className="flex items-center justify-between p-4">
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                    <div className="text-lg font-bold text-gray-900">Ayarlar</div>
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className={`p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 transition-colors ${activeTab === 'profile' ? 'text-moto-accent' : 'text-gray-400'}`}
                    >
                        {isLoading ? <div className="w-5 h-5 border-2 border-moto-accent border-t-transparent rounded-full animate-spin" /> : <Save className="w-6 h-6" />}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-4 pb-0 gap-6 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'profile', label: 'Profil', icon: User },
                        { id: 'garage', label: 'Garaj', icon: Bike },
                        { id: 'security', label: 'Güvenlik', icon: Shield },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 pb-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === tab.id ? 'border-moto-accent text-gray-900' : 'border-transparent text-gray-400'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            <span className="text-sm font-bold uppercase tracking-wide">{tab.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                <AnimatePresence mode="wait">
                    {activeTab === 'profile' && (
                        <motion.div
                            key="profile"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                        >
                            {/* Profile Content (Existing) */}
                            <div className="relative h-48 w-full bg-gray-200">
                                <img
                                    src={previewCover || user?.coverImage || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80"}
                                    className="w-full h-full object-cover opacity-80"
                                    alt="cover"
                                />
                                <label className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/10 hover:bg-black/20 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center border border-white/40">
                                        <Camera className="w-5 h-5 text-white" />
                                    </div>
                                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'cover')} />
                                </label>
                            </div>

                            <div className="px-6 -mt-10 mb-8 relative">
                                <div className="relative w-24 h-24 rounded-full border-[4px] border-white bg-gray-200 shadow-lg">
                                    <UserAvatar
                                        src={previewAvatar || user?.avatar}
                                        name={user?.name}
                                        size={88}
                                        className="w-full h-full rounded-full object-cover"
                                    />
                                    <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-moto-accent text-black flex items-center justify-center cursor-pointer shadow-lg border-2 border-white">
                                        <Camera className="w-4 h-4" />
                                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e, 'avatar')} />
                                    </label>
                                </div>
                            </div>

                            <div className="px-6 space-y-4">
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 transition-colors">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 mb-1"><User className="w-3 h-3" /> Ad Soyad</label>
                                    <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-transparent text-gray-900 font-bold focus:outline-none" />
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 transition-colors">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 mb-1"><User className="w-3 h-3" /> Kullanıcı Adı</label>
                                    <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full bg-transparent text-gray-900 font-bold focus:outline-none" />
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 transition-colors">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 mb-1"><FileText className="w-3 h-3" /> Biyografi</label>
                                    <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} className="w-full bg-transparent text-gray-900 font-medium focus:outline-none h-20 resize-none" />
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 transition-colors">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 mb-1"><MapPin className="w-3 h-3" /> Konum</label>
                                    <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="w-full bg-transparent text-gray-900 font-bold focus:outline-none" />
                                </div>

                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 transition-colors">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase flex items-center gap-2 mb-1">
                                        <Bike className="w-3 h-3" /> Ana Motosiklet
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.primaryBike}
                                        onChange={(e) => setFormData({ ...formData, primaryBike: e.target.value })}
                                        className="w-full bg-transparent text-gray-900 font-bold focus:outline-none"
                                        placeholder="Örn: Yamaha R6"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeTab === 'garage' && (
                        <motion.div
                            key="garage"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 space-y-6"
                        >
                            {/* List Existing Bikes */}
                            <div className="space-y-3">
                                {user?.garage?.map((bike: any) => (
                                    <div key={bike._id} className={`p-4 rounded-xl border relative overflow-hidden transition-colors ${user.primaryBike === `${bike.brand} ${bike.model}` ? 'bg-moto-accent/10 border-moto-accent' : 'bg-white border-gray-100'}`}>
                                        <div className="flex gap-4">
                                            <div className="w-20 h-16 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                <img src={bike.image} alt={bike.model} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-gray-900 truncate">{bike.brand} {bike.model}</h4>
                                                <p className="text-xs text-gray-500 font-mono">{bike.year}</p>
                                                {user.primaryBike === `${bike.brand} ${bike.model}` && (
                                                    <span className="inline-block mt-1 px-1.5 py-0.5 bg-moto-accent text-black text-[9px] font-black uppercase rounded">Birincil</span>
                                                )}
                                            </div>
                                            <div className="flex flex-col gap-2 justify-center">
                                                {user.primaryBike !== `${bike.brand} ${bike.model}` && (
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const res = await api.put('/users/garage/primary', { garageId: bike._id });
                                                                if (res.data.status === 'success') {
                                                                    setUser(res.data.data.user || { ...user, primaryBike: res.data.data.primaryBike });
                                                                }
                                                            } catch (e) { console.error(e); }
                                                        }}
                                                        className="p-2 bg-gray-100 rounded-full text-moto-accent"
                                                    >
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={async () => {
                                                        if (!confirm('Silmek istediğine emin misin?')) return;
                                                        try {
                                                            const res = await api.delete(`/users/garage/${bike._id}`);
                                                            if (res.data.status === 'success') {
                                                                updateProfile({ garage: res.data.data.garage });
                                                            }
                                                        } catch (e) { console.error(e); }
                                                    }}
                                                    className="p-2 bg-red-50 rounded-full text-red-500"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Add Bike Form */}
                            {isAddingBike ? (
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-3 animate-in fade-in slide-in-from-bottom-4 transition-colors">
                                    <h4 className="font-bold text-gray-900 text-sm mb-2">Yeni Motor Ekle</h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="Marka (Yamaha)" className="bg-white p-3 rounded-lg text-sm text-gray-900 outline-none focus:ring-1 focus:ring-moto-accent border border-gray-200" value={newBike.brand} onChange={e => setNewBike({ ...newBike, brand: e.target.value })} />
                                        <input placeholder="Model (R25)" className="bg-white p-3 rounded-lg text-sm text-gray-900 outline-none focus:ring-1 focus:ring-moto-accent border border-gray-200" value={newBike.model} onChange={e => setNewBike({ ...newBike, model: e.target.value })} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <input placeholder="Yıl (2023)" className="bg-white p-3 rounded-lg text-sm text-gray-900 outline-none focus:ring-1 focus:ring-moto-accent border border-gray-200" value={newBike.year} onChange={e => setNewBike({ ...newBike, year: e.target.value })} />
                                        <input placeholder="Resim URL" className="bg-white p-3 rounded-lg text-sm text-gray-900 outline-none focus:ring-1 focus:ring-moto-accent border border-gray-200" value={newBike.image} onChange={e => setNewBike({ ...newBike, image: e.target.value })} />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button onClick={() => setIsAddingBike(false)} className="flex-1 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-bold">İptal</button>
                                        <button onClick={async () => {
                                            if (!newBike.brand || !newBike.model) return;
                                            setIsLoading(true);
                                            try {
                                                const res = await api.post('/users/garage', newBike);
                                                if (res.data.status === 'success') {
                                                    updateProfile({ garage: res.data.data.garage });
                                                    setNewBike({ brand: '', model: '', year: '', image: '' });
                                                    setIsAddingBike(false);
                                                }
                                            } finally { setIsLoading(false); }
                                        }} className="flex-1 py-2 bg-moto-accent text-black rounded-lg text-sm font-bold">Kaydet</button>
                                    </div>
                                </div>
                            ) : (
                                <button onClick={() => setIsAddingBike(true)} className="w-full py-4 border border-dashed border-gray-300 rounded-xl flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors">
                                    <Plus className="w-5 h-5" />
                                    <span className="font-bold text-sm">Motor Ekle</span>
                                </button>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'security' && (
                        <motion.div
                            key="security"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-6 space-y-8"
                        >
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Gizlilik</h3>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-gray-900 font-bold text-sm">Gizli Profil</div>
                                        <div className="text-gray-500 text-xs">Sadece takipçiler görebilir</div>
                                    </div>
                                    <button
                                        onClick={() => setPrivacySettings({ ...privacySettings, isPrivate: !privacySettings.isPrivate })}
                                        className={`w-10 h-6 rounded-full p-1 transition-colors ${privacySettings.isPrivate ? 'bg-moto-accent' : 'bg-gray-200'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${privacySettings.isPrivate ? 'translate-x-4' : ''}`} />
                                    </button>
                                </div>
                                <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 flex items-center justify-between">
                                    <div>
                                        <div className="text-gray-900 font-bold text-sm">Hayalet Modu</div>
                                        <div className="text-gray-500 text-xs">Konumunu haritada gizle</div>
                                    </div>
                                    <button
                                        onClick={() => setPrivacySettings({ ...privacySettings, hideLocation: !privacySettings.hideLocation })}
                                        className={`w-10 h-6 rounded-full p-1 transition-colors ${privacySettings.hideLocation ? 'bg-moto-accent' : 'bg-gray-200'}`}
                                    >
                                        <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${privacySettings.hideLocation ? 'translate-x-4' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Şifre Değiştir</h3>
                                <div className="space-y-3">
                                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                                        <Key className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="password"
                                            placeholder="Mevcut Şifre"
                                            className="bg-transparent w-full text-gray-900 text-sm outline-none placeholder-gray-400"
                                            value={securityData.currentPassword}
                                            onChange={e => setSecurityData({ ...securityData, currentPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                                        <Lock className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="password"
                                            placeholder="Yeni Şifre"
                                            className="bg-transparent w-full text-gray-900 text-sm outline-none placeholder-gray-400"
                                            value={securityData.newPassword}
                                            onChange={e => setSecurityData({ ...securityData, newPassword: e.target.value })}
                                        />
                                    </div>
                                    <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-center gap-3">
                                        <Lock className="w-4 h-4 text-gray-500" />
                                        <input
                                            type="password"
                                            placeholder="Yeni Şifre (Tekrar)"
                                            className="bg-transparent w-full text-gray-900 text-sm outline-none placeholder-gray-400"
                                            value={securityData.confirmPassword}
                                            onChange={e => setSecurityData({ ...securityData, confirmPassword: e.target.value })}
                                        />
                                    </div>
                                    <button
                                        onClick={async () => {
                                            if (securityData.newPassword !== securityData.confirmPassword) return alert('Şifreler eşleşmiyor');
                                            try {
                                                await api.patch('/users/update-password', {
                                                    currentPassword: securityData.currentPassword,
                                                    password: securityData.newPassword,
                                                    passwordConfirm: securityData.confirmPassword
                                                });
                                                alert('Şifre güncellendi');
                                                setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                                            } catch (e) { alert('Şifre değiştirilemedi'); }
                                        }}
                                        className="w-full py-3 bg-gray-900 hover:bg-black text-white rounded-xl text-sm font-bold transition-colors"
                                    >
                                        Şifreyi Güncelle
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};
