import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { VibeButton } from '../ui/VibeButton';
import { motion } from 'framer-motion';
import { Save, RefreshCcw, Palette, Layout, MousePointer2 } from 'lucide-react';
import { LogoBuilder } from './LogoBuilder';

export const AdminUISettings = () => {
    const { getComponentConfig, updateSetting, fetchSettings } = useUIStore();
    const settings = useUIStore((state) => state.settings);

    // Module State
    const [activeModule, setActiveModule] = useState<'branding' | 'buttons'>('branding');

    // Button Config State
    const [localConfig, setLocalConfig] = useState({
        primaryColor: '#E2FF3B',
        borderRadius: '9999px',
        animationSpeed: 1.5,
        magneticStrength: 0.2,
        buttonStyle: 'default',
        buttonSkin: 'default'
    });

    const [activeTab, setActiveTab] = useState<'style' | 'skin' | 'physics' | 'color'>('style');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        const stored = getComponentConfig('VibeButton');
        if (stored && Object.keys(stored).length > 0) {
            setLocalConfig(prev => ({ ...prev, ...stored }));
        }
    }, [settings]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSetting('VibeButton', localConfig);
            setIsSaving(false);
        } catch (error) {
            console.error("Save failed", error);
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 text-gray-900 min-h-screen bg-gray-50/50">
            {/* HEADER & MODULE SWITCHER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter text-gray-900">UI Kontrol Merkezi</h1>
                    <p className="text-gray-500 font-medium mt-1">Arayüz ve Marka Yönetim Sistemi</p>
                </div>

                <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-200">
                    <button
                        onClick={() => setActiveModule('branding')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeModule === 'branding' ? 'bg-moto-accent text-black shadow-md' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <Layout className="w-4 h-4" />
                        Marka & Logo
                    </button>
                    <button
                        onClick={() => setActiveModule('buttons')}
                        className={`px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${activeModule === 'buttons' ? 'bg-moto-accent text-black shadow-md' : 'text-gray-500 hover:bg-gray-50'
                            }`}
                    >
                        <MousePointer2 className="w-4 h-4" />
                        Component Studio
                    </button>
                </div>
            </div>

            {/* MODULE CONTENT */}
            {activeModule === 'branding' ? (
                <LogoBuilder />
            ) : (
                <div className="flex flex-col lg:flex-row gap-8 items-start">
                    {/* BUTTON DESIGNER CONTENT */}
                    <div className="flex-1 w-full bg-white border border-gray-200 rounded-[2rem] shadow-xl shadow-gray-100/50 overflow-hidden flex flex-col min-h-[600px]">
                        {/* TABS */}
                        <div className="flex border-b border-gray-100 bg-gray-50/50">
                            {[
                                { id: 'style', label: '1. Yapı', icon: '🏗️' },
                                { id: 'skin', label: '2. Yüzey', icon: '🎨' },
                                { id: 'color', label: '3. Renk', icon: '🌈' },
                                { id: 'physics', label: '4. Fizik', icon: '⚛️' }
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex-1 py-6 flex flex-col items-center gap-2 border-r border-gray-100 last:border-0 hover:bg-white transition-colors relative group ${activeTab === tab.id ? 'bg-white text-gray-900' : 'text-gray-400'}`}
                                >
                                    <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all">{tab.icon}</span>
                                    <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                                    {activeTab === tab.id && <div className="absolute top-0 left-0 right-0 h-1 bg-moto-accent" />}
                                </button>
                            ))}
                        </div>

                        <div className="p-8 flex-1 bg-white">
                            {/* STYLE TAB */}
                            {activeTab === 'style' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'default', name: 'Premium Classic', desc: 'Standart UI' },
                                        { id: 'cyber', name: 'Cyberpunk', desc: 'Keskin, Teknik' },
                                        { id: 'brutal', name: 'Neo-Brutal', desc: 'Sert hatlar, Gölgeli' },
                                        { id: 'racing', name: 'F1 Racing', desc: 'Hızlı, Eğimli' },
                                        { id: 'pixel', name: '8-Bit Retro', desc: 'Bloklu, Arcade' },
                                        { id: 'flow', name: 'Liquid Flow', desc: 'Organik, Akışkan' }
                                    ].map(theme => (
                                        <button
                                            key={theme.id}
                                            onClick={() => setLocalConfig(prev => ({ ...prev, buttonStyle: theme.id }))}
                                            className={`p-6 rounded-2xl border text-left flex flex-col gap-2 transition-all ${localConfig.buttonStyle === theme.id ? 'bg-moto-accent text-black border-moto-accent shadow-[0_10px_30px_-10px_rgba(226,255,59,0.5)] scale-[1.02]' : 'bg-gray-50 border-gray-100 text-gray-500 hover:bg-gray-100 hover:border-gray-200'}`}
                                        >
                                            <div className="font-bold text-lg">{theme.name}</div>
                                            <div className={`text-xs font-mono ${localConfig.buttonStyle === theme.id ? 'text-black/60' : 'text-gray-400'}`}>{theme.desc}</div>
                                        </button>
                                    ))}

                                    <div className={`col-span-2 mt-4 p-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 ${localConfig.buttonStyle !== 'default' && 'opacity-50 pointer-events-none grayscale'}`}>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Köşe Yuvarlaklığı (Sadece Klasik Mod)</label>
                                        <input
                                            type="range"
                                            min="0" max="30"
                                            onChange={(e) => setLocalConfig(prev => ({ ...prev, borderRadius: `${e.target.value}px` }))}
                                            className="w-full accent-moto-accent h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* SKIN TAB */}
                            {activeTab === 'skin' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 gap-4">
                                    {[
                                        { id: 'default', name: 'Solid Matte', desc: 'Düz Renk' },
                                        { id: 'cosmic', name: 'Cosmic Void', desc: 'Derin Uzay' },
                                        { id: 'liquid', name: 'Liquid Metal', desc: 'Krom Efekt' },
                                        { id: 'carbon', name: 'Carbon Fiber', desc: 'Karbon Doku' },
                                        { id: 'glass', name: 'Frost Glass', desc: 'Buzlu Cam' },
                                        { id: 'holographic', name: 'Holographic', desc: 'Yanardöner' },
                                        { id: 'magma', name: 'Magma Core', desc: 'Hareketli Isı' },
                                        { id: 'glitch', name: 'Sys.Glitch', desc: 'Sinyal Bozukluğu' }
                                    ].map(skin => (
                                        <button
                                            key={skin.id}
                                            onClick={() => setLocalConfig(prev => ({ ...prev, buttonSkin: skin.id }))}
                                            className={`p-6 rounded-2xl border text-left flex flex-col gap-2 transition-all overflow-hidden relative group ${localConfig.buttonSkin === skin.id ? 'border-moto-accent ring-2 ring-moto-accent/20 bg-gray-900 text-white' : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-300'}`}
                                        >
                                            <div className="font-bold text-lg relative z-10">{skin.name}</div>
                                            <div className="text-xs font-mono relative z-10 opacity-70">{skin.desc}</div>
                                        </button>
                                    ))}
                                </motion.div>
                            )}

                            {/* COLOR TAB */}
                            {activeTab === 'color' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                        <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Ana Vurgu Rengi</label>
                                        <div className="flex flex-col md:flex-row gap-6 items-start">
                                            <div className="flex flex-col items-center gap-2">
                                                <input
                                                    type="color"
                                                    value={localConfig.primaryColor}
                                                    onChange={(e) => setLocalConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                                                    className="w-24 h-24 rounded-3xl cursor-pointer bg-white border-4 border-white shadow-xl"
                                                />
                                                <span className="font-mono text-xs text-gray-400 uppercase">{localConfig.primaryColor}</span>
                                            </div>

                                            <div className="flex-1 grid grid-cols-5 gap-3">
                                                {['#E2FF3B', '#00D4FF', '#FF0099', '#FF5E00', '#39FF14', '#9D00FF', '#111111', '#FF3E3E', '#F2A619', '#3B82F6'].map(color => (
                                                    <button
                                                        key={color}
                                                        onClick={() => setLocalConfig(prev => ({ ...prev, primaryColor: color }))}
                                                        className="aspect-square rounded-2xl border-4 border-white shadow-sm hover:scale-110 hover:shadow-lg transition-all"
                                                        style={{ backgroundColor: color }}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* PHYSICS TAB */}
                            {activeTab === 'physics' && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 p-4">
                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex justify-between">
                                            <span>Işıltı Hızı</span>
                                            <span className="bg-white px-2 py-1 rounded text-gray-900 border border-gray-200">{localConfig.animationSpeed}s</span>
                                        </label>
                                        <input
                                            type="range" min="0.5" max="5" step="0.1"
                                            value={localConfig.animationSpeed}
                                            onChange={(e) => setLocalConfig(prev => ({ ...prev, animationSpeed: parseFloat(e.target.value) }))}
                                            className="w-full accent-moto-accent h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4 flex justify-between">
                                            <span>Manyetik Güç</span>
                                            <span className="bg-white px-2 py-1 rounded text-gray-900 border border-gray-200">{localConfig.magneticStrength}</span>
                                        </label>
                                        <input
                                            type="range" min="0" max="1" step="0.1"
                                            value={localConfig.magneticStrength}
                                            onChange={(e) => setLocalConfig(prev => ({ ...prev, magneticStrength: parseFloat(e.target.value) }))}
                                            className="w-full accent-moto-accent h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                        />
                                        <p className="text-xs text-gray-400 mt-3 font-medium flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                            Sadece masaüstü cihazlar için geçerlidir
                                        </p>
                                    </div>
                                </motion.div>
                            )}

                        </div>
                    </div>

                    {/* LIVE PREVIEW SIDEBAR */}
                    <div className="w-full lg:w-[400px] sticky top-8">
                        <div className="bg-white border border-gray-200 rounded-[2.5rem] p-8 flex flex-col items-center gap-12 min-h-[600px] justify-center relative overflow-hidden shadow-2xl shadow-gray-200/50">
                            {/* Canvas Background */}
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
                            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

                            <div className="relative z-10 flex flex-col items-center gap-8 w-full">
                                <span className="px-3 py-1 rounded-full bg-gray-100 border border-gray-200 text-[10px] font-black uppercase tracking-widest text-gray-400">Canlı Önizleme</span>

                                <div className="p-8 border border-dashed border-gray-300 rounded-3xl w-full flex flex-col items-center gap-6 bg-gray-50/50">
                                    <VibeButton variant="primary" size="lg" configOverride={localConfig} fullWidth>Ana Aksiyon</VibeButton>
                                    <div className="flex gap-4 w-full">
                                        <VibeButton variant="secondary" size="md" configOverride={localConfig} className="flex-1">İkincil</VibeButton>
                                        <VibeButton variant="ghost" size="md" configOverride={localConfig} className="flex-1">Hayalet</VibeButton>
                                    </div>
                                    <VibeButton variant="outline" size="sm" configOverride={localConfig}>Minimal Çizgi</VibeButton>
                                    <VibeButton variant="danger" size="sm" configOverride={localConfig} fullWidth>Kritik İşlem</VibeButton>
                                </div>
                            </div>

                            {/* Save Action */}
                            <div className="w-full pt-8 border-t border-gray-100 mt-auto bg-white/50 backdrop-blur-sm z-20">
                                <VibeButton
                                    variant="primary"
                                    size="md"
                                    onClick={handleSave}
                                    isLoading={isSaving}
                                    icon={Save}
                                    fullWidth
                                    className="shadow-xl shadow-moto-accent/20"
                                >
                                    YAPILANDIRMAYI KAYDET
                                </VibeButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
