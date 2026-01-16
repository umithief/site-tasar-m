import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { useBranding } from '../../context/BrandingContext';
import { VibeButton } from '../ui/VibeButton';
import { motion, AnimatePresence } from 'framer-motion';
import { Save, RefreshCcw, Palette, Layout, MousePointer2, Type, Check, RefreshCw, Smartphone, Monitor } from 'lucide-react';
import { FONT_STYLES, LOGO_ASSETS } from '../ui/LogoAssets';

export const AdminUISettings = () => {
    // Stores
    const { getComponentConfig, updateSetting, fetchSettings, settings: uiSettings } = useUIStore();
    const { settings: brandingSettings, updateSettings: updateBrandingSettings, isLoading: isBrandingLoading } = useBranding();

    // Local States
    const [activeTab, setActiveTab] = useState<'branding' | 'components' | 'colors' | 'typography'>('branding');
    const [isSaving, setIsSaving] = useState(false);

    // Button Config State
    const [buttonConfig, setButtonConfig] = useState({
        primaryColor: '#E2FF3B',
        borderRadius: '9999px',
        animationSpeed: 1.5,
        magneticStrength: 0.2,
        buttonStyle: 'default',
        buttonSkin: 'default'
    });

    // Branding Config State
    const [localBranding, setLocalBranding] = useState(brandingSettings);

    // Initial Load
    useEffect(() => {
        fetchSettings();
        if (brandingSettings) setLocalBranding(brandingSettings);
    }, [brandingSettings]);

    // Sync Button Config from Store
    useEffect(() => {
        const stored = getComponentConfig('VibeButton');
        if (stored && Object.keys(stored).length > 0) {
            setButtonConfig(prev => ({ ...prev, ...stored }));
        }
    }, [uiSettings]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Save Button Config
            if (activeTab === 'components') {
                await updateSetting('VibeButton', buttonConfig);
            }
            // Save Branding Config
            if (activeTab === 'branding' || activeTab === 'colors' || activeTab === 'typography') {
                await updateBrandingSettings(localBranding);
            }

            // Artificial delay for better UX
            await new Promise(resolve => setTimeout(resolve, 800));
            setIsSaving(false);
        } catch (error) {
            console.error("Save failed", error);
            setIsSaving(false);
        }
    };

    const TABS = [
        { id: 'branding', label: 'Marka & Logo', icon: Layout },
        { id: 'components', label: 'Bileşen Stüdyo', icon: MousePointer2 },
        { id: 'colors', label: 'Renk Paleti', icon: Palette },
        { id: 'typography', label: 'Tipografi', icon: Type },
    ];

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#09090b] text-white font-sans">

            {/* SIDEBAR NAVIGATION */}
            <div className="w-64 flex-shrink-0 border-r border-white/10 bg-[#09090b] flex flex-col">
                <div className="p-6">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">UI KONTROL</h2>
                    <p className="text-xs text-gray-500 font-medium mt-1">Sistem Görünüm Ayarları</p>
                </div>

                <div className="flex-1 px-3 space-y-1">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 group ${activeTab === tab.id
                                    ? 'bg-moto-accent text-black shadow-[0_0_20px_rgba(226,255,59,0.2)]'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-black' : 'group-hover:text-white'}`} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="p-4 border-t border-white/10 bg-white/5">
                    <VibeButton
                        variant="primary"
                        size="md"
                        fullWidth
                        onClick={handleSave}
                        isLoading={isSaving}
                        icon={Save}
                        className="font-black"
                    >
                        {isSaving ? 'KAYDEDİLİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
                    </VibeButton>
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex overflow-hidden">

                {/* SETTINGS PANEL (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 min-w-[400px]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-8 max-w-2xl mx-auto"
                        >
                            {/* --- BRANDING TAB --- */}
                            {activeTab === 'branding' && (
                                <div className="space-y-8">
                                    <SectionHeader title="Logo Tasarımı" description="Markanızın ana sembolünü ve görünümünü belirleyin." />

                                    <div className="grid grid-cols-3 gap-4">
                                        {Object.keys(LOGO_ASSETS).map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setLocalBranding({ ...localBranding, iconType: type as any })}
                                                className={`relative p-6 rounded-2xl border transition-all duration-200 group flex flex-col items-center gap-4 ${localBranding.iconType === type
                                                        ? 'bg-moto-accent/10 border-moto-accent ring-1 ring-moto-accent/50'
                                                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                                                    }`}
                                            >
                                                <div className={`w-12 h-12 ${localBranding.iconType === type ? 'text-moto-accent' : 'text-gray-400'}`}>
                                                    <svg viewBox="0 0 48 48" className="w-full h-full fill-current">
                                                        {LOGO_ASSETS[type as keyof typeof LOGO_ASSETS].path}
                                                    </svg>
                                                </div>
                                                <span className={`text-xs font-bold uppercase tracking-wider ${localBranding.iconType === type ? 'text-white' : 'text-gray-500'}`}>
                                                    {type}
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-gray-300">Harf Aralığı</label>
                                            <span className="text-xs bg-black/50 px-2 py-1 rounded text-moto-accent font-mono">{localBranding.letterSpacing}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="-2" max="10" step="0.5"
                                            value={localBranding.letterSpacing}
                                            onChange={(e) => setLocalBranding({ ...localBranding, letterSpacing: parseFloat(e.target.value) })}
                                            className="w-full accent-moto-accent h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* --- COMPONENTS TAB --- */}
                            {activeTab === 'components' && (
                                <div className="space-y-10">
                                    <SectionHeader title="Buton & Etkileşim" description="Sistem genelindeki butonların yapısını ve fizigini özelleştirin." />

                                    {/* Style Selection */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Yapısal Tema</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'default', name: 'Premium Classic', desc: 'Modern, Yuvarlak' },
                                                { id: 'cyber', name: 'Cyberpunk', desc: 'Keskin, Köşeli, Tech' },
                                                { id: 'brutal', name: 'Neo-Brutal', desc: 'Sert, Kontrast' },
                                                { id: 'racing', name: 'F1 Racing', desc: 'İtalik, Hızlı' },
                                                { id: 'pixel', name: '8-Bit Retro', desc: 'Pixelated, Nostaljik' },
                                                { id: 'flow', name: 'Liquid Flow', desc: 'Organik, Akışkan' }
                                            ].map(theme => (
                                                <button
                                                    key={theme.id}
                                                    onClick={() => setButtonConfig(prev => ({ ...prev, buttonStyle: theme.id }))}
                                                    className={`p-4 rounded-xl border text-left transition-all ${buttonConfig.buttonStyle === theme.id
                                                            ? 'bg-moto-accent text-black border-moto-accent shadow-lg shadow-moto-accent/20'
                                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <div className="font-bold text-sm">{theme.name}</div>
                                                    <div className={`text-[10px] mt-0.5 ${buttonConfig.buttonStyle === theme.id ? 'text-black/70' : 'text-gray-500'}`}>{theme.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Skin Selection */}
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest pl-1">Yüzey Materyali</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { id: 'default', name: 'Matte', desc: 'Düz Renk' },
                                                { id: 'cosmic', name: 'Cosmic', desc: 'Noise & Gradient' },
                                                { id: 'liquid', name: 'Liquid', desc: 'Krom Efekt' },
                                                { id: 'carbon', name: 'Carbon', desc: 'Fiber Doku' },
                                                { id: 'glass', name: 'Glass', desc: 'Buzlu Cam' },
                                                { id: 'holographic', name: 'Holo', desc: 'Yanardöner' },
                                                { id: 'magma', name: 'Magma', desc: 'Animasyonlu' },
                                                { id: 'glitch', name: 'Glitch', desc: 'Arızalı' }
                                            ].map(skin => (
                                                <button
                                                    key={skin.id}
                                                    onClick={() => setButtonConfig(prev => ({ ...prev, buttonSkin: skin.id }))}
                                                    className={`p-4 rounded-xl border text-left transition-all ${buttonConfig.buttonSkin === skin.id
                                                            ? 'bg-white text-black border-white'
                                                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <div className="font-bold text-sm">{skin.name}</div>
                                                    <div className={`text-[10px] mt-0.5 ${buttonConfig.buttonSkin === skin.id ? 'text-black/70' : 'text-gray-500'}`}>{skin.desc}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Physics Sliders */}
                                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 space-y-6">
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-bold text-gray-300 uppercase">Manyetik Güç</label>
                                                <span className="text-xs font-mono text-moto-accent">{buttonConfig.magneticStrength}</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="1" step="0.1"
                                                value={buttonConfig.magneticStrength}
                                                onChange={(e) => setButtonConfig(prev => ({ ...prev, magneticStrength: parseFloat(e.target.value) }))}
                                                className="w-full accent-moto-accent h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-bold text-gray-300 uppercase">Animasyon Hızı</label>
                                                <span className="text-xs font-mono text-moto-accent">{buttonConfig.animationSpeed}s</span>
                                            </div>
                                            <input
                                                type="range" min="0.5" max="5" step="0.1"
                                                value={buttonConfig.animationSpeed}
                                                onChange={(e) => setButtonConfig(prev => ({ ...prev, animationSpeed: parseFloat(e.target.value) }))}
                                                className="w-full accent-moto-accent h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* --- COLORS & TYPOGRAPHY TABS (Merged for simplicity or future expansion) --- */}
                            {(activeTab === 'colors' || activeTab === 'typography') && (
                                <div className="space-y-8">
                                    <SectionHeader
                                        title={activeTab === 'colors' ? "Renk Paleti" : "Tipografi"}
                                        description="Markanızın renk ve yazı karakterlerini özelleştirin."
                                    />

                                    {activeTab === 'colors' && (
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Ana Renk (Primary)</label>
                                                <div className="flex gap-4 items-center">
                                                    <input
                                                        type="color"
                                                        value={localBranding.primaryColor}
                                                        onChange={(e) => setLocalBranding(prev => ({ ...prev, primaryColor: e.target.value }))}
                                                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                                                    />
                                                    <span className="text-sm font-mono text-white bg-black/50 px-3 py-1.5 rounded-lg border border-white/10">
                                                        {localBranding.primaryColor}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Vurgu Rengi (Accent)</label>
                                                <div className="flex gap-4 items-center">
                                                    <input
                                                        type="color"
                                                        value={localBranding.accentColor}
                                                        onChange={(e) => setLocalBranding(prev => ({ ...prev, accentColor: e.target.value }))}
                                                        className="w-12 h-12 rounded-xl cursor-pointer bg-transparent border-none p-0"
                                                    />
                                                    <span className="text-sm font-mono text-white bg-black/50 px-3 py-1.5 rounded-lg border border-white/10">
                                                        {localBranding.accentColor}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'typography' && (
                                        <div className="grid grid-cols-2 gap-3">
                                            {Object.keys(FONT_STYLES).map(style => (
                                                <button
                                                    key={style}
                                                    onClick={() => setLocalBranding(prev => ({ ...prev, fontStyle: style as any }))}
                                                    className={`p-4 rounded-xl border text-center transition-all ${localBranding.fontStyle === style
                                                            ? 'bg-moto-accent text-black border-moto-accent'
                                                            : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                                                        }`}
                                                >
                                                    <span className="text-sm font-bold">{style}</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* LIVE PREVIEW PANEL */}
                <div className="w-[480px] bg-[#050505] border-l border-white/10 flex flex-col relative overflow-hidden">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03]" />
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] opacity-[0.03]" />

                    <div className="relative z-10 flex-1 flex flex-col">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#050505]/80 backdrop-blur-sm z-20">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                Canlı Önizleme
                            </span>
                            <div className="flex gap-2">
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"><Smartphone className="w-4 h-4" /></button>
                                <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"><Monitor className="w-4 h-4" /></button>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 flex flex-col items-center justify-center gap-12">

                            {/* Branding Preview */}
                            {(activeTab === 'branding' || activeTab === 'colors' || activeTab === 'typography') && (
                                <div className="space-y-12 w-full">
                                    <div className="space-y-2">
                                        <div className="text-[10px] font-mono text-gray-600 uppercase text-center mb-4">Dark Mode Header</div>
                                        <div className="p-8 border border-white/10 rounded-3xl bg-black w-full flex items-center justify-center relative overflow-hidden group">
                                            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                                            <PreviewLogo settings={localBranding} variant="full" className="h-12 w-auto" />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="text-[10px] font-mono text-gray-600 uppercase text-center mb-4">Light Mode Header</div>
                                        <div className="p-8 border border-white/10 rounded-3xl bg-white w-full flex items-center justify-center">
                                            <PreviewLogo settings={localBranding} variant="full" className="h-12 w-auto" lightMode />
                                        </div>
                                    </div>

                                    <div className="flex justify-center gap-6">
                                        <div className="w-20 h-20 bg-black rounded-2xl border border-white/10 flex items-center justify-center">
                                            <PreviewLogo settings={localBranding} variant="icon" className="h-10 w-auto" />
                                        </div>
                                        <div className="w-20 h-20 bg-black rounded-full border border-white/10 flex items-center justify-center">
                                            <PreviewLogo settings={localBranding} variant="icon" className="h-10 w-auto" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Components Preview */}
                            {activeTab === 'components' && (
                                <div className="w-full space-y-8">
                                    <div className="text-[10px] font-mono text-gray-600 uppercase text-center mb-4">Component Playground</div>

                                    <div className="p-10 border border-dashed border-white/10 rounded-[2rem] bg-white/5 flex flex-col items-center gap-6 w-full">
                                        <VibeButton variant="primary" size="lg" configOverride={buttonConfig} fullWidth>
                                            Satın Al
                                        </VibeButton>

                                        <div className="flex gap-4 w-full">
                                            <VibeButton variant="secondary" size="md" configOverride={buttonConfig} className="flex-1">
                                                Detaylar
                                            </VibeButton>
                                            <VibeButton variant="ghost" size="md" configOverride={buttonConfig} className="flex-1">
                                                İptal
                                            </VibeButton>
                                        </div>

                                        <div className="w-full h-px bg-white/10 my-2" />

                                        <VibeButton variant="outline" size="sm" configOverride={buttonConfig}>
                                            Daha Fazla Göster
                                        </VibeButton>

                                        <VibeButton variant="danger" size="sm" configOverride={buttonConfig} fullWidth>
                                            Hesabı Sil
                                        </VibeButton>
                                    </div>

                                    {/* Theme Info Badge */}
                                    <div className="flex justify-center gap-4 text-[10px] font-mono uppercase text-gray-500">
                                        <span className="px-2 py-1 bg-white/5 rounded">Theme: {buttonConfig.buttonStyle}</span>
                                        <span className="px-2 py-1 bg-white/5 rounded">Skin: {buttonConfig.buttonSkin}</span>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Internal Utilities ---

const SectionHeader = ({ title, description }: { title: string, description: string }) => (
    <div className="pb-6 border-b border-white/10">
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const PreviewLogo = ({ settings, variant, className, lightMode }: any) => {
    const { iconType, primaryColor, accentColor, fontStyle, letterSpacing } = settings;
    const activeAsset = LOGO_ASSETS[iconType] || LOGO_ASSETS.VELOCITY;
    const resolvedFont = FONT_STYLES[fontStyle] || FONT_STYLES.TECH;

    let viewBox = "0 0 210 48";
    if (variant === 'icon') viewBox = "0 0 48 48";

    const renderText = (offsetX = 0) => (
        <text
            x={offsetX}
            y="32"
            fill="currentColor"
            style={{
                ...resolvedFont,
                letterSpacing: `${letterSpacing}px`,
                fontSize: '24px',
                textTransform: 'uppercase'
            }}
        >
            MOTO<tspan fill={primaryColor}>VIBE</tspan>
        </text>
    );

    return (
        <svg
            viewBox={viewBox}
            className={`${className} ${lightMode ? 'text-black' : 'text-white'}`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
        >
            {(variant === 'full' || variant === 'icon') && iconType !== 'TEXT_ONLY' && (
                <g style={{ color: primaryColor }}>
                    {activeAsset.path}
                </g>
            )}
            {(variant === 'full') && renderText(iconType === 'TEXT_ONLY' ? 0 : 56)}
        </svg>
    )
}
