import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Settings, Shield, Image as ImageIcon, Bike,
    Grid, Bell, Key, LogOut, ChevronRight, Save, Plus, Trash2, Smartphone
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { ImageUpload } from '../common/ImageUpload';
import { UserAvatar } from '../ui/UserAvatar';
import { notify } from '../../services/notificationService';
import { api } from '../../services/api';
import { UserBike } from '../../types';
import { VibeButton } from '../ui/VibeButton';

interface WebSettingsProps {
    onNavigate: (view: any) => void;
}

type TabType = 'profile' | 'garage' | 'content' | 'security';

export const WebSettings: React.FC<WebSettingsProps> = ({ onNavigate }) => {
    const { user, setUser, updateProfile } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isLoading, setIsLoading] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        bio: '',
        location: '',
        avatar: '',
        coverImage: ''
    });

    // Determine if we have new files to upload
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [coverFile, setCoverFile] = useState<File | null>(null);

    const [securityData, setSecurityData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [settings, setSettings] = useState({
        isPrivate: false,
        hideLocation: false,
        notifications: {
            likes: true,
            comments: true,
            follows: true
        }
    });

    // Load initial data
    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || '',
                username: user.username || '',
                bio: user.bio || '',
                location: user.location || user.address || '',
                avatar: user.avatar || '',
                coverImage: user.coverImage || ''
            });
            if ((user as any).privacy) {
                setSettings(prev => ({ ...prev, ...(user as any).privacy, notifications: (user as any).notifications || prev.notifications }));
            }
        }
    }, [user]);

    // Handlers
    const handleProfileUpdate = async (e?: React.FormEvent) => {
        e?.preventDefault();
        setIsLoading(true);
        try {
            let finalAvatarUrl = formData.avatar;
            let finalCoverUrl = formData.coverImage;

            // 1. Upload Avatar if selected
            if (avatarFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', avatarFile);

                try {
                    const res = await api.post('/upload', uploadFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    if (res.data.success && res.data.url) {
                        finalAvatarUrl = res.data.url;
                    }
                } catch (err) {
                    console.error('Avatar upload failed', err);
                    notify.error('Avatar yüklenemedi');
                    setIsLoading(false);
                    return;
                }
            }

            // 2. Upload Cover if selected
            if (coverFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', coverFile);

                try {
                    const res = await api.post('/upload', uploadFormData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    if (res.data.success && res.data.url) {
                        finalCoverUrl = res.data.url;
                    }
                } catch (err) {
                    console.error('Cover upload failed', err);
                    notify.error('Kapak fotoğrafı yüklenemedi');
                    setIsLoading(false);
                    return;
                }
            }


            // Optimistic update
            const optimisticData = { ...formData, avatar: finalAvatarUrl, coverImage: finalCoverUrl };
            updateProfile(optimisticData);

            // API Call with URLs (no base64)
            const response = await api.put('/users/profile', optimisticData);
            if (response.data.status === 'success') {
                setUser(response.data.data.user);
                notify.success('Profil güncellendi');
                // Clear files after success
                setAvatarFile(null);
                setCoverFile(null);
            }
        } catch (error) {
            console.error(error);
            notify.error('Güncelleme başarısız');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSettingsUpdate = async (newSettings: any) => {
        setSettings(newSettings); // Optimistic
        try {
            await api.put('/users/update-settings', {
                privacy: { isPrivate: newSettings.isPrivate, hideLocation: newSettings.hideLocation },
                notifications: newSettings.notifications
            });
            notify.success('Ayarlar kaydedildi');
        } catch (error) {
            notify.error('Ayarlar kaydedilemedi');
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (securityData.newPassword !== securityData.confirmPassword) {
            notify.error('Şifreler eşleşmiyor');
            return;
        }
        setIsLoading(true);
        try {
            await api.patch('/users/update-password', {
                currentPassword: securityData.currentPassword,
                password: securityData.newPassword,
                passwordConfirm: securityData.confirmPassword
            });
            notify.success('Şifre başarıyla değiştirildi');
            setSecurityData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            notify.error('Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- Garage Handlers ---
    const [newBike, setNewBike] = useState<Partial<UserBike>>({ brand: '', model: '', year: new Date().getFullYear().toString(), image: '' });
    const [isAddingBike, setIsAddingBike] = useState(false);

    const handleAddBike = async () => {
        if (!newBike.brand || !newBike.model) return notify.error('Marka ve model gerekli');
        setIsLoading(true);
        try {
            const res = await api.post('/users/garage', newBike);
            if (res.data.status === 'success') {
                updateProfile({ garage: res.data.data.garage }); // Update local store
                setNewBike({ brand: '', model: '', year: new Date().getFullYear().toString(), image: '' });
                setIsAddingBike(false);
                notify.success('Motosiklet eklendi 🏍️');
            }
        } catch (error) {
            notify.error('Ekleme başarısız');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveBike = async (bikeId: string) => {
        if (!confirm('Bu motoru garajdan silmek istediğine emin misin?')) return;
        try {
            const res = await api.delete(`/users/garage/${bikeId}`);
            if (res.data.status === 'success') {
                updateProfile({ garage: res.data.data.garage });
                notify.info('Motor silindi');
            }
        } catch (error) {
            notify.error('Silme başarısız');
        }
    }


    if (!user) return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-900">Giriş yapmalısınız.</div>;

    return (
        <div className="flex bg-gray-50 min-h-screen text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900">

            {/* 1. Sidebar */}
            {/* 2. Main Content Area */}
            <main className="flex-1 flex overflow-hidden h-[calc(100vh-80px)] md:h-screen">

                {/* SETTINGS MENU (Inner Sidebar) */}
                <div className="w-64 border-r border-gray-100 bg-white flex flex-col pt-12 shadow-sm z-10">
                    <div className="px-6 mb-8">
                        <h2 className="text-xl font-display font-black italic tracking-tighter text-gray-900">AYARLAR</h2>
                        <p className="text-xs text-gray-400 font-mono mt-1">Kimliğini yönet</p>
                    </div>

                    <nav className="flex-1 space-y-1 px-4">
                        <TabButton id="profile" icon={User} label="Profil & Kimlik" active={activeTab} onClick={setActiveTab} />
                        <TabButton id="garage" icon={Bike} label="Dijital Garaj" active={activeTab} onClick={setActiveTab} />
                        <TabButton id="content" icon={Grid} label="İçerik Yöneticisi" active={activeTab} onClick={setActiveTab} />
                        <TabButton id="security" icon={Shield} label="Gizlilik & Güvenlik" active={activeTab} onClick={setActiveTab} />
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <VibeButton
                            variant="ghost"
                            className="w-full justify-start gap-3 text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => {
                                if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
                                    // Logout logic
                                    console.log("Logout clicked");
                                }
                            }}
                        >
                            <LogOut className="w-4 h-4" />
                            Çıkış Yap
                        </VibeButton>
                    </div>
                </div>

                {/* WORKSPACE */}
                <div className="flex-1 overflow-y-auto relative custom-scrollbar bg-gray-50">

                    {/* Header */}
                    <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md border-b border-gray-100 px-8 py-4 flex justify-between items-center shadow-sm">
                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider">
                            {activeTab === 'profile' && 'Profili Düzenle'}
                            {activeTab === 'garage' && 'Garajım'}
                            {activeTab === 'content' && 'Gönderi Yöneticisi'}
                            {activeTab === 'security' && 'Güvenlik Bölgesi'}
                        </h3>
                        <div className="flex gap-2">
                            <VibeButton
                                onClick={() => handleProfileUpdate()}
                                isLoading={isLoading}
                                size="sm"
                                icon={Save}
                                className="shadow-lg shadow-blue-500/20"
                            >
                                Kaydet
                            </VibeButton>
                        </div>
                    </header>

                    <div className="max-w-4xl mx-auto p-8 pb-32">
                        <AnimatePresence mode="wait">

                            {/* --- PROFILE TAB --- */}
                            {activeTab === 'profile' && (
                                <motion.div
                                    className="space-y-12"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    {/* Images Section */}
                                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
                                        <div className="md:col-span-2">
                                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                                                <ImageUpload
                                                    label="Kapak Fotoğrafı"
                                                    value={formData.coverImage}
                                                    onChange={(url, file) => {
                                                        setFormData({ ...formData, coverImage: url });
                                                        if (file) setCoverFile(file);
                                                    }}
                                                    aspectRatio="cover"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center">
                                                <ImageUpload
                                                    label="Avatar"
                                                    value={formData.avatar}
                                                    onChange={(url, file) => {
                                                        setFormData({ ...formData, avatar: url });
                                                        if (file) setAvatarFile(file);
                                                    }}
                                                    aspectRatio="square"
                                                />
                                            </div>
                                        </div>
                                    </section>

                                    {/* Personal Info */}
                                    <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                                        <h4 className="font-display font-bold text-lg text-gray-900 border-b border-gray-100 pb-4">Kişisel Bilgiler</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputGroup label="Görünen İsim" value={formData.name} onChange={(v: any) => setFormData({ ...formData, name: v })} />
                                            <InputGroup label="Kullanıcı Adı" value={formData.username} prefix="@" onChange={(v: any) => setFormData({ ...formData, username: v })} />
                                        </div>
                                        <InputGroup label="Konum" value={formData.location} prefix="📍" onChange={(v: any) => setFormData({ ...formData, location: v })} />

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Hakkında</label>
                                            <textarea
                                                rows={4}
                                                maxLength={150}
                                                className="w-full bg-white border border-gray-200 rounded-xl p-4 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium text-sm transition-all"
                                                placeholder="Sürüş hayatın hakkında kısa bir şeyler yaz..."
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            />
                                            <div className="text-right text-[10px] text-gray-400 font-medium">{formData.bio.length}/150</div>
                                        </div>

                                        <div className="flex justify-end pt-4 border-t border-gray-50">
                                            <VibeButton
                                                onClick={handleProfileUpdate}
                                                isLoading={isLoading}
                                                size="lg"
                                                className="w-full md:w-auto"
                                            >
                                                Tüm Değişiklikleri Kaydet
                                            </VibeButton>
                                        </div>
                                    </section>
                                </motion.div>
                            )}

                            {/* --- GARAGE TAB --- */}
                            {activeTab === 'garage' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    <div className="grid grid-cols-1 gap-4">
                                        {user.garage?.map((bike, idx) => (
                                            <div key={bike._id || idx} className={`bg-white border rounded-2xl p-4 flex gap-6 items-center group transition-all shadow-sm hover:shadow-md ${user.primaryBike === `${bike.brand} ${bike.model}` ? 'border-blue-500 ring-4 ring-blue-500/5 bg-blue-50/10' : 'border-gray-200 hover:border-blue-200'}`}>
                                                <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 border border-gray-100">
                                                    <img src={bike.image} alt="bike" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-lg text-gray-900">{bike.brand} {bike.model}</h4>
                                                        {user.primaryBike === `${bike.brand} ${bike.model}` && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-black uppercase rounded shadow-sm">Birincil</span>}
                                                    </div>
                                                    <p className="text-sm text-gray-500 font-medium">{bike.year} • {bike.km || '0'} KM</p>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {user.primaryBike !== `${bike.brand} ${bike.model}` && (
                                                        <VibeButton
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await api.put('/users/garage/primary', { garageId: bike._id });
                                                                    if (res.data.status === 'success') {
                                                                        setUser({ ...user, primaryBike: res.data.data.primaryBike }); // Optimistic/Sync
                                                                        notify.success('Primary bike updated');
                                                                    }
                                                                } catch (e) { notify.error('Failed to set primary'); }
                                                            }}
                                                        >
                                                            Birincil Yap
                                                        </VibeButton>
                                                    )}
                                                    <VibeButton size="sm" variant="outline" onClick={() => notify.info('Edit spec functionality coming soon')}>Özellikleri Düzenle</VibeButton>
                                                    <VibeButton
                                                        size="sm"
                                                        variant="danger"
                                                        onClick={() => handleRemoveBike(bike._id)}
                                                        icon={Trash2}
                                                    >
                                                        Sil
                                                    </VibeButton>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add New Bike Form */}
                                        {isAddingBike ? (
                                            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-lg animate-in fade-in zoom-in-95 duration-200 ring-1 ring-blue-500/10">
                                                <h4 className="font-bold text-blue-600 mb-4 uppercase tracking-widest text-xs">Yeni Makine Ekle</h4>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <InputGroup label="Marka" value={newBike.brand} onChange={(v: any) => setNewBike({ ...newBike, brand: v })} placeholder="örn. Yamaha" />
                                                    <InputGroup label="Model" value={newBike.model} onChange={(v: any) => setNewBike({ ...newBike, model: v })} placeholder="örn. R6" />
                                                    <InputGroup label="Yıl" value={newBike.year} onChange={(v: any) => setNewBike({ ...newBike, year: v })} />
                                                    <InputGroup label="Resim URL" value={newBike.image} onChange={(v: any) => setNewBike({ ...newBike, image: v })} />
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <VibeButton variant="ghost" onClick={() => setIsAddingBike(false)} size="sm">İptal</VibeButton>
                                                    <VibeButton onClick={handleAddBike} size="sm">Motor Ekle</VibeButton>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => setIsAddingBike(true)} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50 transition-all group bg-white">
                                                <Plus className="w-12 h-12 mb-2 group-hover:scale-110 transition-transform" />
                                                <span className="font-bold uppercase tracking-widest text-xs">Yeni Motor Ekle</span>
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )}

                            {/* --- CONTENT TAB --- */}
                            {activeTab === 'content' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                                        <table className="w-full text-left">
                                            <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-bold tracking-wider">
                                                <tr>
                                                    <th className="p-4">Gönderi</th>
                                                    <th className="p-4">İstatistik</th>
                                                    <th className="p-4">Tarih</th>
                                                    <th className="p-4 text-right">İşlemler</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {/* Mocking posts if not available in user object directly without fetch */}
                                                <tr>
                                                    <td className="p-8 text-gray-400 italic text-center text-sm" colSpan={4}>
                                                        İçerik Yükleniyor... (Kullanıcının gönderilerini listeler)
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </motion.div>
                            )}


                            {/* --- SECURITY TAB --- */}
                            {activeTab === 'security' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

                                    {/* Toggles */}
                                    <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
                                        <h4 className="text-xl font-display font-bold text-gray-900 border-b border-gray-100 pb-4">Gizlilik & Görünürlük</h4>
                                        <div className="space-y-4">
                                            <Toggle
                                                label="Gizli Profil"
                                                desc="Sadece onaylanmış takipçiler profil detaylarını görebilir."
                                                checked={settings.isPrivate}
                                                onChange={(v: boolean) => handleSettingsUpdate({ ...settings, isPrivate: v })}
                                            />
                                            <Toggle
                                                label="Hayalet Modu"
                                                desc="Gerçek zamanlı konumunu tüm harita ve rotalarda gizle."
                                                checked={settings.hideLocation}
                                                onChange={(v: boolean) => handleSettingsUpdate({ ...settings, hideLocation: v })}
                                            />
                                        </div>

                                        <h4 className="text-xl font-display font-bold text-gray-900 border-b border-gray-100 pb-4 mt-8">Bildirimler</h4>
                                        <div className="space-y-4">
                                            <Toggle
                                                label="Yeni Takipçiler"
                                                checked={settings.notifications.follows}
                                                onChange={(v: boolean) => handleSettingsUpdate({ ...settings, notifications: { ...settings.notifications, follows: v } })}
                                            />
                                            <Toggle
                                                label="Beğeni & Yorumlar"
                                                checked={settings.notifications.likes}
                                                onChange={(v: boolean) => handleSettingsUpdate({ ...settings, notifications: { ...settings.notifications, likes: v } })}
                                            />
                                        </div>
                                    </section>

                                    {/* Password Change */}
                                    <section className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                                        <h4 className="text-xl font-display font-bold text-gray-900 border-b border-gray-100 pb-4">Şifre Değiştir</h4>
                                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                            <InputGroup
                                                label="Mevcut Şifre"
                                                type="password"
                                                value={securityData.currentPassword}
                                                onChange={(v: string) => setSecurityData({ ...securityData, currentPassword: v })}
                                            />
                                            <InputGroup
                                                label="Yeni Şifre"
                                                type="password"
                                                value={securityData.newPassword}
                                                onChange={(v: string) => setSecurityData({ ...securityData, newPassword: v })}
                                                placeholder="Min. 8 karakter"
                                            />
                                            <InputGroup
                                                label="Yeni Şifreyi Onayla"
                                                type="password"
                                                value={securityData.confirmPassword}
                                                onChange={(v: string) => setSecurityData({ ...securityData, confirmPassword: v })}
                                            />
                                            <VibeButton
                                                type="submit"
                                                variant="secondary"
                                                fullWidth
                                                isLoading={isLoading}
                                            >
                                                Şifreyi Güncelle
                                            </VibeButton>
                                        </form>
                                    </section>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>

                {/* 3. PREVIEW PANEL (Right) */}
                <div className="w-[320px] bg-gray-50 border-l border-gray-100 hidden xl:flex flex-col items-center py-12 relative shadow-inner">
                    <div className="sticky top-12">
                        <div className="text-center mb-8 opacity-50">
                            <Smartphone className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                            <p className="text-[10px] font-mono uppercase tracking-widest text-gray-400">Live Preview</p>
                        </div>

                        {/* Mini Profile Card */}
                        <div className="w-[280px] bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-2xl relative group hover:shadow-xl transition-shadow">
                            <div className="h-32 bg-gray-100 relative">
                                <img src={formData.coverImage || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=500&q=60"} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                            </div>
                            <div className="px-6 pb-6 relative z-10 -mt-12 flex flex-col items-center">
                                <div className="bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
                                    <UserAvatar src={formData.avatar} name={formData.name} size={80} className="rounded-xl" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mt-4 text-center">{formData.name || 'User Name'}</h3>
                                <p className="text-xs text-blue-600 font-bold uppercase tracking-wider">{user.rank}</p>
                                <p className="text-xs text-gray-500 font-mono mt-1">@{formData.username || 'username'}</p>

                                <p className="text-center text-xs text-gray-500 mt-4 line-clamp-2">
                                    {formData.bio || 'Your bio will appear here...'}
                                </p>

                                <div className="flex gap-4 mt-6 w-full justify-center">
                                    <div className="text-center">
                                        <div className="font-bold text-gray-900">1.2k</div>
                                        <div className="text-[9px] text-gray-400 uppercase font-black">Followers</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-gray-900">450</div>
                                        <div className="text-[9px] text-gray-400 uppercase font-black">Following</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </main>
        </div>
    );
};

// --- Helper Components ---

const TabButton = ({ id, icon: Icon, label, active, onClick }: { id: TabType, icon: any, label: string, active: TabType, onClick: any }) => (
    <VibeButton
        variant={active === id ? 'primary' : 'ghost'}
        onClick={() => onClick(id)}
        className={`w-full justify-start gap-3 mb-1 text-sm ${active !== id ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-50' : 'bg-gray-900 text-white hover:bg-black'}`}
        icon={Icon}
    >
        <span className="flex-1 text-left">{label}</span>
        {active === id && <ChevronRight className="w-4 h-4 opacity-50" />}
    </VibeButton>
);

const InputGroup = ({ label, value, onChange, prefix, type = 'text', placeholder }: any) => (
    <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-400 tracking-wider">{label}</label>
        <div className="relative">
            {prefix && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm select-none">{prefix}</div>}
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-white border border-gray-200 rounded-xl p-3 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-medium transition-all shadow-sm hover:border-gray-300
                ${prefix ? 'pl-8' : ''}`}
            />
        </div>
    </div>
);

const Toggle = ({ label, desc, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-xl group hover:border-blue-200 transition-colors cursor-pointer" onClick={() => onChange(!checked)}>
        <div>
            <div className={`font-bold transition-colors ${checked ? 'text-blue-900' : 'text-gray-700'}`}>{label}</div>
            {desc && <div className="text-xs text-gray-500 mt-1 max-w-xs">{desc}</div>}
        </div>
        <button
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-blue-500' : 'bg-gray-200'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);
