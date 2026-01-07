import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { VibeButton } from '../ui/VibeButton';
import { motion } from 'framer-motion';
import { Save, RefreshCcw, Palette } from 'lucide-react';

export const AdminUISettings = () => {
    const { getComponentConfig, updateSetting, fetchSettings } = useUIStore();
    const settings = useUIStore((state) => state.settings);

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
        <div className="p-8 text-white min-h-screen">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">Vibe Design Studio</h1>
                    <p className="text-gray-400">Master Component Interface Designer</p>
                </div>
                <VibeButton
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    isLoading={isSaving}
                    icon={Save}
                >
                    Save Master Config
                </VibeButton>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 items-start">

                {/* UNIFIED DESIGNER BOX */}
                <div className="flex-1 w-full bg-[#111] border border-white/10 rounded-3xl overflow-hidden flex flex-col min-h-[600px]">

                    {/* TABS */}
                    <div className="flex border-b border-white/10">
                        {[
                            { id: 'style', label: '1. Structure', icon: '🏗️' },
                            { id: 'skin', label: '2. Surface', icon: '🎨' },
                            { id: 'color', label: '3. Palette', icon: '🌈' },
                            { id: 'physics', label: '4. Physics', icon: '⚛️' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 py-6 flex flex-col items-center gap-2 border-r border-white/5 last:border-0 hover:bg-white/5 transition-colors relative ${activeTab === tab.id ? 'bg-white/5 text-white' : 'text-gray-500'}`}
                            >
                                <span className="text-2xl">{tab.icon}</span>
                                <span className="text-xs font-black uppercase tracking-widest">{tab.label}</span>
                                {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#F2A619]" />}
                            </button>
                        ))}
                    </div>

                    {/* CONTENT AREA */}
                    <div className="p-8 flex-1 bg-gradient-to-b from-[#111] to-black">

                        {/* STYLE TAB */}
                        {activeTab === 'style' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'default', name: 'Premium Classic', desc: 'Standard UI' },
                                    { id: 'cyber', name: 'Cyberpunk', desc: 'Sharp, Technical' },
                                    { id: 'brutal', name: 'Neo-Brutal', desc: 'Hard Edge, Shadow' },
                                    { id: 'racing', name: 'F1 Racing', desc: 'Speed, Slanted' },
                                    { id: 'pixel', name: '8-Bit Retro', desc: 'Blocky, Arcade' },
                                    { id: 'flow', name: 'Liquid Flow', desc: 'Organic, Smooth' }
                                ].map(theme => (
                                    <button
                                        key={theme.id}
                                        onClick={() => setLocalConfig(prev => ({ ...prev, buttonStyle: theme.id }))}
                                        className={`p-6 rounded-2xl border text-left flex flex-col gap-2 transition-all ${localConfig.buttonStyle === theme.id ? 'bg-[#F2A619]/10 border-[#F2A619] text-white' : 'bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20'}`}
                                    >
                                        <div className="font-bold text-lg">{theme.name}</div>
                                        <div className="text-xs opacity-60 font-mono">{theme.desc}</div>
                                    </button>
                                ))}

                                <div className={`col-span-2 mt-4 p-4 rounded-xl border border-dashed border-white/20 ${localConfig.buttonStyle !== 'default' && 'opacity-30 pointer-events-none'}`}>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Border Radius (Classic Mode Only)</label>
                                    <input
                                        type="range"
                                        min="0" max="30"
                                        onChange={(e) => setLocalConfig(prev => ({ ...prev, borderRadius: `${e.target.value}px` }))}
                                        className="w-full accent-[#F2A619]"
                                    />
                                </div>
                            </motion.div>
                        )}

                        {/* SKIN TAB */}
                        {activeTab === 'skin' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'default', name: 'Solid Matte', desc: 'Flat Color' },
                                    { id: 'cosmic', name: 'Cosmic Void', desc: 'Deep Space Noise' },
                                    { id: 'liquid', name: 'Liquid Metal', desc: 'Animated Chrome' },
                                    { id: 'carbon', name: 'Carbon Fiber', desc: 'Tactile Grid' },
                                    { id: 'glass', name: 'Frost Glass', desc: 'Blur Effect' },
                                    { id: 'holographic', name: 'Holographic', desc: 'Rainbow Iridescent' },
                                    { id: 'magma', name: 'Magma Core', desc: 'Animated Heat' },
                                    { id: 'glitch', name: 'Sys.Glitch', desc: 'Chromatic Aberration' }
                                ].map(skin => (
                                    <button
                                        key={skin.id}
                                        onClick={() => setLocalConfig(prev => ({ ...prev, buttonSkin: skin.id }))}
                                        className={`p-6 rounded-2xl border text-left flex flex-col gap-2 transition-all overflow-hidden relative group ${localConfig.buttonSkin === skin.id ? 'border-white ring-1 ring-white' : 'border-white/5 hover:border-white/20'}`}
                                    >
                                        <div className={`absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-br from-white/10 to-transparent pointer-events-none`} />
                                        <div className="font-bold text-lg relative z-10 text-white">{skin.name}</div>
                                        <div className="text-xs text-gray-400 font-mono relative z-10">{skin.desc}</div>
                                    </button>
                                ))}
                            </motion.div>
                        )}

                        {/* COLOR TAB */}
                        {activeTab === 'color' && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Base Accent Color</label>
                                    <div className="flex gap-4 items-center">
                                        <input
                                            type="color"
                                            value={localConfig.primaryColor}
                                            onChange={(e) => setLocalConfig(prev => ({ ...prev, primaryColor: e.target.value }))}
                                            className="w-20 h-20 rounded-2xl cursor-pointer bg-transparent border-none"
                                        />
                                        <div className="flex-1 grid grid-cols-5 gap-2">
                                            {['#E2FF3B', '#00D4FF', '#FF0099', '#FF5E00', '#39FF14', '#9D00FF', '#FFFFFF', '#FF3E3E', '#F2A619', '#000000'].map(color => (
                                                <button
                                                    key={color}
                                                    onClick={() => setLocalConfig(prev => ({ ...prev, primaryColor: color }))}
                                                    className="aspect-square rounded-xl border border-white/10 hover:scale-110 transition-transform shadow-lg"
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
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Shimmer Speed ({localConfig.animationSpeed}s)</label>
                                    <input
                                        type="range" min="0.5" max="5" step="0.1"
                                        value={localConfig.animationSpeed}
                                        onChange={(e) => setLocalConfig(prev => ({ ...prev, animationSpeed: parseFloat(e.target.value) }))}
                                        className="w-full accent-[#F2A619] h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Magnetic Strength ({localConfig.magneticStrength})</label>
                                    <input
                                        type="range" min="0" max="1" step="0.1"
                                        value={localConfig.magneticStrength}
                                        onChange={(e) => setLocalConfig(prev => ({ ...prev, magneticStrength: parseFloat(e.target.value) }))}
                                        className="w-full accent-[#F2A619] h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">Does not apply to mobile devices</p>
                                </div>
                            </motion.div>
                        )}

                    </div>
                </div>

                {/* LIVE PREVIEW SIDEBAR */}
                <div className="w-full lg:w-96 sticky top-8">
                    <div className="bg-[#111] border border-white/10 rounded-3xl p-8 flex flex-col items-center gap-12 min-h-[500px] justify-center relative overflow-hidden">

                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5" />

                        {/* Preview Items */}
                        <div className="relative z-10 flex flex-col items-center gap-6 w-full">
                            <h3 className="text-xs font-black uppercase tracking-[0.5em] text-gray-600 mb-4">Live Render</h3>

                            <VibeButton variant="primary" size="lg" configOverride={localConfig} fullWidth>
                                Primary Action
                            </VibeButton>

                            <div className="flex gap-4 w-full">
                                <VibeButton variant="secondary" size="md" configOverride={localConfig} className="flex-1">
                                    Secondary
                                </VibeButton>
                                <VibeButton variant="ghost" size="md" configOverride={localConfig} className="flex-1">
                                    Ghost
                                </VibeButton>
                            </div>

                            <VibeButton variant="outline" size="sm" configOverride={localConfig}>
                                Minimal Outline
                            </VibeButton>

                            <VibeButton variant="danger" size="sm" configOverride={localConfig} fullWidth>
                                System Error
                            </VibeButton>
                        </div>

                        {/* Code Spec */}
                        <div className="w-full p-4 bg-black rounded-lg border border-white/10 font-mono text-[10px] text-gray-500">
                            <div>theme: <span className="text-[#F2A619]">{localConfig.buttonStyle}</span></div>
                            <div>skin: <span className="text-blue-400">{localConfig.buttonSkin}</span></div>
                            <div>color: <span className="text-green-400">{localConfig.primaryColor}</span></div>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};
