import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User, Settings, Shield, Image as ImageIcon, Bike,
    Grid, Bell, Key, LogOut, ChevronRight, Save, Plus, Trash2, Smartphone
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { MotovibeSidebar } from '../layout/MotovibeSidebar';
import { ImageUpload } from '../common/ImageUpload';
import { UserAvatar } from '../ui/UserAvatar';
import { socialService } from '../../services/socialService';
import { notify } from '../../services/notificationService';
import { api } from '../../services/api';
import { UserBike } from '../../types';

interface WebSettingsProps {
    onNavigate: (view: any) => void;
}

type TabType = 'profile' | 'garage' | 'content' | 'security';

export const WebSettings: React.FC<WebSettingsProps> = ({ onNavigate }) => {
    const { user, setUser, updateProfile } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        bio: '',
        location: '',
        avatar: '',
        coverImage: ''
    });

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
                location: user.location || user.address || '', // Fallback mapping based on schema differences
                avatar: user.avatar || '',
                coverImage: user.coverImage || ''
            });
            // Load settings if available in user object, else default
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
            // Optimistic update
            updateProfile(formData);

            // API Call
            const response = await api.put('/users/profile', formData);
            if (response.data.status === 'success') {
                setUser(response.data.data.user);
                notify.success('Profil güncellendi');
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


    if (!user) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Giriş yapmalısınız.</div>;

    return (
        <div className="flex bg-[#050505] min-h-screen text-white font-sans selection:bg-moto-accent selection:text-black">

            {/* 1. Sidebar */}
            <MotovibeSidebar
                activeView="settings" // Or whatever view state maps to settings
                onNavigate={onNavigate}
                isExpanded={isSidebarExpanded}
                onToggleExpand={() => setIsSidebarExpanded(!isSidebarExpanded)}
            />

            {/* 2. Main Content Area */}
            <main className={`flex-1 flex overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'md:ml-[260px]' : 'md:ml-[80px]'} ml-0`}>

                {/* SETTINGS MENU (Inner Sidebar) */}
                <div className="w-64 border-r border-white/5 bg-[#09090b] flex flex-col pt-12">
                    <div className="px-6 mb-8">
                        <h2 className="text-xl font-display font-black italic tracking-tighter">AYARLAR</h2>
                        <p className="text-xs text-gray-500 font-mono mt-1">Kimliğini yönet</p>
                    </div>

                    <nav className="flex-1 space-y-1 px-4">
                        <TabButton id="profile" icon={User} label="Profil & Kimlik" active={activeTab} onClick={setActiveTab} />
                        <TabButton id="garage" icon={Bike} label="Dijital Garaj" active={activeTab} onClick={setActiveTab} />
                        <TabButton id="content" icon={Grid} label="İçerik Yöneticisi" active={activeTab} onClick={setActiveTab} />
                        <TabButton id="security" icon={Shield} label="Gizlilik & Güvenlik" active={activeTab} onClick={setActiveTab} />
                    </nav>

                    <div className="p-4 border-t border-white/5">
                        <button className="flex items-center gap-3 text-red-500 text-sm font-bold opacity-60 hover:opacity-100 transition-opacity w-full p-2">
                            <LogOut className="w-4 h-4" />
                            Çıkış Yap
                        </button>
                    </div>
                </div>

                {/* WORKSPACE */}
                <div className="flex-1 overflow-y-auto relative no-scrollbar">

                    {/* Header */}
                    <header className="sticky top-0 z-20 bg-black/80 backdrop-blur-md border-b border-white/5 px-8 py-4 flex justify-between items-center">
                        <h3 className="text-lg font-bold text-white uppercase tracking-wider">
                            {activeTab === 'profile' && 'Profili Düzenle'}
                            {activeTab === 'garage' && 'Garajım'}
                            {activeTab === 'content' && 'Gönderi Yöneticisi'}
                            {activeTab === 'security' && 'Güvenlik Bölgesi'}
                        </h3>
                        <div className="flex gap-2">
                            <button onClick={() => handleProfileUpdate()} disabled={isLoading} className="flex items-center gap-2 px-6 py-2 bg-moto-accent text-black font-bold uppercase tracking-wider text-xs rounded hover:bg-orange-400 transition-colors">
                                {isLoading ? 'Kaydediliyor...' : <><Save className="w-4 h-4" /> Kaydet</>}
                            </button>
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
                                            <ImageUpload
                                                label="Kapak Fotoğrafı"
                                                value={formData.coverImage}
                                                onChange={(url) => setFormData({ ...formData, coverImage: url })}
                                                aspectRatio="cover"
                                            />
                                        </div>
                                        <div>
                                            <ImageUpload
                                                label="Avatar"
                                                value={formData.avatar}
                                                onChange={(url) => setFormData({ ...formData, avatar: url })}
                                                aspectRatio="square"
                                            />
                                        </div>
                                    </section>

                                    {/* Personal Info */}
                                    <section className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <InputGroup label="Görünen İsim" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} />
                                            <InputGroup label="Kullanıcı Adı" value={formData.username} prefix="@" onChange={(v) => setFormData({ ...formData, username: v })} />
                                        </div>
                                        <InputGroup label="Konum" value={formData.location} prefix="📍" onChange={(v) => setFormData({ ...formData, location: v })} />

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase text-gray-500">Hakkında</label>
                                            <textarea
                                                rows={4}
                                                maxLength={150}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:border-moto-accent outline-none font-mono text-sm"
                                                placeholder="Sürüş hayatın hakkında kısa bir şeyler yaz..."
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                            />
                                            <div className="text-right text-[10px] text-gray-500">{formData.bio.length}/150</div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={handleProfileUpdate}
                                                disabled={isLoading}
                                                className="w-full md:w-auto px-8 py-3 bg-moto-accent text-black font-bold uppercase tracking-wider text-sm rounded-xl hover:bg-orange-400 transition-colors shadow-[0_0_20px_rgba(255,165,0,0.3)] hover:shadow-[0_0_30px_rgba(255,165,0,0.5)]"
                                            >
                                                {isLoading ? 'Kaydediliyor...' : 'Tüm Değişiklikleri Kaydet'}
                                            </button>
                                        </div>
                                    </section>
                                </motion.div>
                            )}

                            {/* --- GARAGE TAB --- */}
                            {activeTab === 'garage' && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    <div className="grid grid-cols-1 gap-4">
                                        {user.garage?.map((bike, idx) => (
                                            <div key={bike._id || idx} className={`bg-white/5 border rounded-2xl p-4 flex gap-6 items-center group transition-all ${user.primaryBike === `${bike.brand} ${bike.model}` ? 'border-moto-accent bg-moto-accent/5' : 'border-white/10 hover:border-white/20'}`}>
                                                <div className="w-32 h-20 bg-black rounded-lg overflow-hidden shrink-0">
                                                    <img src={bike.image} alt="bike" className="w-full h-full object-cover" />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-lg text-white">{bike.brand} {bike.model}</h4>
                                                        {user.primaryBike === `${bike.brand} ${bike.model}` && <span className="px-2 py-0.5 bg-moto-accent text-black text-[10px] font-black uppercase rounded">Birincil</span>}
                                                    </div>
                                                    <p className="text-sm text-gray-400 font-mono">{bike.year} • {bike.km || '0'} KM</p>
                                                </div>
                                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {user.primaryBike !== `${bike.brand} ${bike.model}` && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    const res = await api.put('/users/garage/primary', { garageId: bike._id });
                                                                    if (res.data.status === 'success') {
                                                                        setUser({ ...user, primaryBike: res.data.data.primaryBike }); // Optimistic/Sync
                                                                        notify.success('Primary bike updated');
                                                                    }
                                                                } catch (e) { notify.error('Failed to set primary'); }
                                                            }}
                                                            className="p-2 hover:bg-white/10 rounded border border-white/5 text-xs font-bold uppercase"
                                                        >
                                                            Birincil Yap
                                                        </button>
                                                    )}
                                                    <button onClick={() => notify.info('Edit spec functionality coming soon')} className="p-2 hover:bg-white/10 rounded border border-white/5 text-xs font-bold uppercase">Özellikleri Düzenle</button>
                                                    <button onClick={() => handleRemoveBike(bike._id)} className="p-2 hover:bg-red-500/20 rounded border border-white/5 text-red-500">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}

                                        {/* Add New Bike Form */}
                                        {isAddingBike ? (
                                            <div className="bg-moto-accent/5 border border-moto-accent/20 rounded-2xl p-6 border-dashed animate-in fade-in zoom-in-95 duration-200">
                                                <h4 className="font-bold text-moto-accent mb-4 uppercase tracking-widest text-xs">Yeni Makine Ekle</h4>
                                                <div className="grid grid-cols-2 gap-4 mb-4">
                                                    <InputGroup label="Marka" value={newBike.brand} onChange={(v) => setNewBike({ ...newBike, brand: v })} placeholder="örn. Yamaha" />
                                                    <InputGroup label="Model" value={newBike.model} onChange={(v) => setNewBike({ ...newBike, model: v })} placeholder="örn. R6" />
                                                    <InputGroup label="Yıl" value={newBike.year} onChange={(v) => setNewBike({ ...newBike, year: v })} />
                                                    <InputGroup label="Resim URL" value={newBike.image} onChange={(v) => setNewBike({ ...newBike, image: v })} />
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => setIsAddingBike(false)} className="px-4 py-2 text-xs font-bold uppercase text-gray-500 hover:text-white">İptal</button>
                                                    <button onClick={handleAddBike} className="px-6 py-2 bg-moto-accent text-black font-bold text-xs uppercase rounded">Motor Ekle</button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button onClick={() => setIsAddingBike(true)} className="w-full py-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500 hover:border-moto-accent hover:text-moto-accent transition-all group">
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
                                    <div className="bg-white/5 rounded-2xl overflow-hidden border border-white/10">
                                        <table className="w-full text-left">
                                            <thead className="bg-black/50 text-xs uppercase text-gray-500">
                                                <tr>
                                                    <th className="p-4">Gönderi</th>
                                                    <th className="p-4">İstatistik</th>
                                                    <th className="p-4">Tarih</th>
                                                    <th className="p-4 text-right">İşlemler</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-white/5">
                                                {/* Mocking posts if not available in user object directly without fetch */}
                                                <tr>
                                                    <td className="p-4 text-gray-500 italic text-center" colSpan={4}>
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
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">

                                    {/* Toggles */}
                                    <section className="space-y-6">
                                        <h4 className="text-xl font-display font-bold italic">Gizlilik & Görünürlük</h4>
                                        <div className="space-y-4">
                                            <Toggle
                                                label="Gizli Profil"
                                                desc="Sadece onaylanmış takipçiler profil detaylarını görebilir."
                                                checked={settings.isPrivate}
                                                onChange={(v) => handleSettingsUpdate({ ...settings, isPrivate: v })}
                                            />
                                            <Toggle
                                                label="Hayalet Modu"
                                                desc="Gerçek zamanlı konumunu tüm harita ve rotalarda gizle."
                                                checked={settings.hideLocation}
                                                onChange={(v) => handleSettingsUpdate({ ...settings, hideLocation: v })}
                                            />
                                        </div>

                                        <h4 className="text-xl font-display font-bold italic mt-8">Bildirimler</h4>
                                        <div className="space-y-4">
                                            <Toggle
                                                label="Yeni Takipçiler"
                                                checked={settings.notifications.follows}
                                                onChange={(v) => handleSettingsUpdate({ ...settings, notifications: { ...settings.notifications, follows: v } })}
                                            />
                                            <Toggle
                                                label="Beğeni & Yorumlar"
                                                checked={settings.notifications.likes}
                                                onChange={(v) => handleSettingsUpdate({ ...settings, notifications: { ...settings.notifications, likes: v } })}
                                            />
                                        </div>
                                    </section>

                                    {/* Password Change */}
                                    <section className="space-y-6 pt-8 border-t border-white/10">
                                        <h4 className="text-xl font-display font-bold italic">Şifre Değiştir</h4>
                                        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                            <InputGroup
                                                label="Mevcut Şifre"
                                                type="password"
                                                value={securityData.currentPassword}
                                                onChange={(v) => setSecurityData({ ...securityData, currentPassword: v })}
                                            />
                                            <InputGroup
                                                label="Yeni Şifre"
                                                type="password"
                                                value={securityData.newPassword}
                                                onChange={(v) => setSecurityData({ ...securityData, newPassword: v })}
                                                placeholder="Min. 8 karakter"
                                            />
                                            <InputGroup
                                                label="Yeni Şifreyi Onayla"
                                                type="password"
                                                value={securityData.confirmPassword}
                                                onChange={(v) => setSecurityData({ ...securityData, confirmPassword: v })}
                                            />
                                            <button
                                                type="submit"
                                                className="w-full py-3 bg-white/10 border border-white/10 hover:bg-white/20 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors"
                                            >
                                                Şifreyi Güncelle
                                            </button>
                                        </form>
                                    </section>
                                </motion.div>
                            )}

                        </AnimatePresence>
                    </div>
                </div>

                {/* 3. PREVIEW PANEL (Right) */}
                <div className="w-[320px] bg-black border-l border-white/5 hidden xl:flex flex-col items-center py-12 relative">
                    <div className="sticky top-12">
                        <div className="text-center mb-8 opacity-50">
                            <Smartphone className="w-6 h-6 mx-auto mb-2" />
                            <p className="text-[10px] font-mono uppercase tracking-widest">Live Preview</p>
                        </div>

                        {/* Mini Profile Card */}
                        <div className="w-[280px] bg-[#09090b] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative group">
                            <div className="h-32 bg-gray-800 relative">
                                <img src={formData.coverImage || "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=500&q=60"} className="w-full h-full object-cover opacity-80" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] to-transparent" />
                            </div>
                            <div className="px-6 pb-6 relative z-10 -mt-12 flex flex-col items-center">
                                <div className="bg-[#09090b] p-1 rounded-2xl border border-white/10">
                                    <UserAvatar src={formData.avatar} name={formData.name} size={80} className="rounded-xl" />
                                </div>
                                <h3 className="text-xl font-bold text-white mt-4 text-center">{formData.name || 'User Name'}</h3>
                                <p className="text-xs text-moto-accent font-bold uppercase tracking-wider">{user.rank}</p>
                                <p className="text-xs text-gray-500 font-mono mt-1">@{formData.username || 'username'}</p>

                                <p className="text-center text-xs text-gray-400 mt-4 line-clamp-2">
                                    {formData.bio || 'Your bio will appear here...'}
                                </p>

                                <div className="flex gap-4 mt-6 w-full justify-center">
                                    <div className="text-center">
                                        <div className="font-bold text-white">1.2k</div>
                                        <div className="text-[9px] text-gray-600 uppercase font-black">Followers</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="font-bold text-white">450</div>
                                        <div className="text-[9px] text-gray-600 uppercase font-black">Following</div>
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
    <button
        onClick={() => onClick(id)}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group
        ${active === id ? 'bg-moto-accent text-black shadow-[0_0_20px_rgba(255,165,0,0.2)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}
        `}
    >
        <Icon className={`w-5 h-5 ${active === id ? 'text-black' : 'group-hover:text-white'}`} />
        <span className="font-bold text-sm tracking-wide">{label}</span>
        {active === id && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
    </button>
);

const InputGroup = ({ label, value, onChange, prefix, type = 'text', placeholder }: any) => (
    <div className="space-y-2">
        <label className="text-xs font-bold uppercase text-gray-500">{label}</label>
        <div className="relative">
            {prefix && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm select-none">{prefix}</div>}
            <input
                type={type}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white placeholder-gray-700 focus:border-moto-accent outline-none font-medium transition-colors
                ${prefix ? 'pl-8' : ''}`}
            />
        </div>
    </div>
);

const Toggle = ({ label, desc, checked, onChange }: any) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-xl group hover:border-white/10 transition-colors">
        <div>
            <div className="font-bold text-white">{label}</div>
            {desc && <div className="text-xs text-gray-500 mt-1 max-w-xs">{desc}</div>}
        </div>
        <button
            onClick={() => onChange(!checked)}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${checked ? 'bg-moto-accent' : 'bg-white/10'}`}
        >
            <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-6' : 'translate-x-0'}`} />
        </button>
    </div>
);
