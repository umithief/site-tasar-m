
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCw, Type, Palette, Layout, Check } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useBranding } from '../../context/BrandingContext';
import { FONT_STYLES, LOGO_ASSETS } from '../ui/LogoAssets';

export const LogoBuilder = () => {
    const { settings, updateSettings, isLoading } = useBranding();
    const [localSettings, setLocalSettings] = useState(settings);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (settings) setLocalSettings(settings);
    }, [settings]);

    const handleSave = async () => {
        setIsSaving(true);
        await updateSettings(localSettings);
        setTimeout(() => setIsSaving(false), 800);
    };

    if (isLoading) return <div className="p-10 text-white">Yükleniyor...</div>;

    return (
        <div className="flex h-[calc(100vh-80px)] overflow-hidden bg-[#09090b]">
            {/* Left Panel: Controls */}
            <div className="w-[400px] border-r border-white/10 flex flex-col bg-[#121212]">
                <div className="p-6 border-b border-white/10">
                    <h2 className="text-xl font-display font-black text-white flex items-center gap-2">
                        <Layout className="w-5 h-5 text-moto-accent" />
                        MARKA KİMLİĞİ
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">Logo ve kurumsal kimlik yönetimi</p>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

                    {/* Icon Selection */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <RefreshCw className="w-3 h-3" /> Logo İkonu
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {Object.keys(LOGO_ASSETS).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setLocalSettings({ ...localSettings, iconType: type as any })}
                                    className={`relative p-4 rounded-xl border transition-all duration-200 group ${localSettings.iconType === type
                                            ? 'bg-moto-accent/10 border-moto-accent'
                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className={`w-8 h-8 mx-auto mb-2 ${localSettings.iconType === type ? 'text-moto-accent' : 'text-gray-400'}`}>
                                        <svg viewBox="0 0 48 48" className="w-full h-full fill-current">
                                            {LOGO_ASSETS[type as keyof typeof LOGO_ASSETS].path}
                                        </svg>
                                    </div>
                                    <div className={`text-xs font-bold text-center ${localSettings.iconType === type ? 'text-white' : 'text-gray-500'}`}>
                                        {type}
                                    </div>
                                    {localSettings.iconType === type && (
                                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-moto-accent flex items-center justify-center">
                                            <Check className="w-3 h-3 text-black" />
                                        </div>
                                    )}
                                </button>
                            ))}
                            <button
                                onClick={() => setLocalSettings({ ...localSettings, iconType: 'TEXT_ONLY' })}
                                className={`relative p-4 rounded-xl border transition-all duration-200 ${localSettings.iconType === 'TEXT_ONLY'
                                        ? 'bg-moto-accent/10 border-moto-accent'
                                        : 'bg-white/5 border-white/10 hover:border-white/20'
                                    }`}
                            >
                                <div className="h-8 flex items-center justify-center font-black text-gray-500">MOTO</div>
                                <div className={`text-xs font-bold text-center mt-2 ${localSettings.iconType === 'TEXT_ONLY' ? 'text-white' : 'text-gray-500'}`}>
                                    TEXT ONLY
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Color Tuner */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Palette className="w-3 h-3" /> Renk Ayarı
                        </label>
                        <div className="space-y-3">
                            <div>
                                <div className="text-xs text-white mb-2 font-medium">Ana Renk (Primary)</div>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        value={localSettings.primaryColor}
                                        onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={localSettings.primaryColor}
                                        onChange={(e) => setLocalSettings({ ...localSettings, primaryColor: e.target.value })}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 text-sm text-white font-mono uppercase focus:outline-none focus:border-moto-accent"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-white mb-2 font-medium">Vurgu Rengi (Accent)</div>
                                <div className="flex gap-3">
                                    <input
                                        type="color"
                                        value={localSettings.accentColor}
                                        onChange={(e) => setLocalSettings({ ...localSettings, accentColor: e.target.value })}
                                        className="w-10 h-10 rounded cursor-pointer bg-transparent border-0 p-0"
                                    />
                                    <input
                                        type="text"
                                        value={localSettings.accentColor}
                                        onChange={(e) => setLocalSettings({ ...localSettings, accentColor: e.target.value })}
                                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 text-sm text-white font-mono uppercase focus:outline-none focus:border-moto-accent"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Typography */}
                    <div className="space-y-4">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Type className="w-3 h-3" /> Tipografi
                        </label>

                        <div className="space-y-3">
                            <div>
                                <div className="flex justify-between text-xs text-white mb-2">
                                    <span>Yazı Tipi</span>
                                    <span className="text-gray-500">{localSettings.fontStyle}</span>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.keys(FONT_STYLES).map(style => (
                                        <button
                                            key={style}
                                            onClick={() => setLocalSettings({ ...localSettings, fontStyle: style as any })}
                                            className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${localSettings.fontStyle === style
                                                    ? 'bg-moto-accent text-black border-moto-accent'
                                                    : 'bg-white/5 text-gray-400 border-white/10 hover:text-white'
                                                }`}
                                        >
                                            {style}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <div className="flex justify-between text-xs text-white mb-2">
                                    <span>Harf Aralığı (Tracking)</span>
                                    <span className="text-gray-500">{localSettings.letterSpacing}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="-2"
                                    max="10"
                                    step="0.5"
                                    value={localSettings.letterSpacing}
                                    onChange={(e) => setLocalSettings({ ...localSettings, letterSpacing: parseFloat(e.target.value) })}
                                    className="w-full accent-moto-accent h-1 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                </div>

                <div className="p-6 border-t border-white/10">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="w-full py-4 bg-moto-accent text-black font-black text-sm uppercase tracking-wide rounded-xl hover:bg-white transition-colors flex items-center justify-center gap-2"
                    >
                        {isSaving ? (
                            <>KAYDEDİLİYOR...</>
                        ) : (
                            <>
                                <Save className="w-4 h-4" /> KAYDET VE YAYINLA
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Right Panel: Preview */}
            <div className="flex-1 overflow-y-auto bg-[#09090b] flex flex-col">
                <div className="p-6 border-b border-white/10 flex justify-between items-center sticky top-0 bg-[#09090b] z-10">
                    <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Canlı Önizleme</h2>
                </div>

                <div className="flex-1 p-8 grid gap-8 content-start">

                    {/* Dark Mode Preview */}
                    <div className="space-y-3">
                        <div className="text-xs font-bold text-gray-500">DARK MODE</div>
                        <div className="w-full h-48 rounded-2xl border border-white/10 bg-black flex items-center justify-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            {/* We need to inject the local settings into a Preview Logo */}
                            {/* Since Logo consumes context, simpler to modify context OR pass props. 
                                User asked for Logo component to be smart. 
                                Let's modify Logo to accept optional override settings or just mock it here manually if Logo doesn't support overrides.
                                Actually Logo doesn't support overrides in Props yet.
                                Let's update Logo.tsx quickly to accept 'settingsOverride' prop OR just render similar SVG here.
                                Rendering similar SVG is safer to avoid changing Public Component too much for Admin view.
                            */}
                            <PreviewLogo settings={localSettings} variant="full" className="h-12 w-auto" />
                        </div>
                    </div>

                    {/* Light Mode Preview */}
                    <div className="space-y-3">
                        <div className="text-xs font-bold text-gray-500">LIGHT MODE</div>
                        <div className="w-full h-48 rounded-2xl border border-white/10 bg-white flex items-center justify-center">
                            <PreviewLogo settings={localSettings} variant="full" className="h-12 w-auto" lightMode />
                        </div>
                    </div>

                    {/* Application Icon */}
                    <div className="space-y-3">
                        <div className="text-xs font-bold text-gray-500">APP ICON</div>
                        <div className="flex gap-4">
                            <div className="w-24 h-24 rounded-2xl bg-black border border-white/10 flex items-center justify-center">
                                <PreviewLogo settings={localSettings} variant="icon" className="h-12 w-auto" />
                            </div>
                            <div className="w-24 h-24 rounded-full bg-black border border-white/10 flex items-center justify-center">
                                <PreviewLogo settings={localSettings} variant="icon" className="h-10 w-auto" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper for Preview
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
