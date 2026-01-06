import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../store/useUIStore';
import { VibeButton } from '../ui/VibeButton';
import { motion } from 'framer-motion';
import { Save, RefreshCcw, Palette } from 'lucide-react';

export const AdminUISettings = () => {
    const { getComponentConfig, updateSetting, fetchSettings } = useUIStore();
    const settings = useUIStore((state) => state.settings);
    const config = getComponentConfig('VibeButton');

    // Local state for form handling to avoid jittery updates if we were syncing directly on every keystroke to server
    // But for store we act directly usually. Let's start with defaults.
    const [localConfig, setLocalConfig] = useState({
        primaryColor: config.primaryColor || '#E2FF3B',
        borderRadius: config.borderRadius || '9999px', // full
        animationSpeed: config.animationSpeed || 1.5,
        magneticStrength: config.magneticStrength || 0.2
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    useEffect(() => {
        const stored = getComponentConfig('VibeButton');
        if (stored && Object.keys(stored).length > 0) {
            setLocalConfig(prev => ({ ...prev, ...stored }));
        }
    }, [settings]); // Listen to store changes properly

    const [isSaving, setIsSaving] = useState(false);

    const handleChange = (key: string, value: any) => {
        const newConfig = { ...localConfig, [key]: value };
        setLocalConfig(newConfig);
        // Removed auto-updateSetting to prevent API spam and allow manual save
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSetting('VibeButton', localConfig);
            // Optional: Show success toast
            setIsSaving(false);
        } catch (error) {
            console.error("Save failed", error);
            setIsSaving(false);
        }
    };

    return (
        <div className="p-8 text-white">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black italic uppercase tracking-tighter">UI Settings</h1>
                    <p className="text-gray-400">Manage global component styles and behaviors.</p>
                </div>
                <div className="flex gap-4">
                    <VibeButton
                        variant="primary"
                        size="sm"
                        onClick={handleSave}
                        isLoading={isSaving}
                        icon={Save}
                    >
                        Save Changes
                    </VibeButton>
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10">
                        <Palette className="w-6 h-6 text-[#F2A619]" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls Area */}
                <div className="space-y-6">
                    <div className="bg-[#121212] border border-white/10 rounded-2xl p-6">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="w-1 h-6 bg-[#F2A619] rounded-full"></span>
                            VibeButton Configuration
                        </h2>

                        {/* Primary Color */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Primary Color (The Accelerator)</label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="color"
                                    value={localConfig.primaryColor}
                                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none appearance-none"
                                />
                                <input
                                    type="text"
                                    value={localConfig.primaryColor}
                                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                                    className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-[#F2A619]"
                                />
                            </div>
                        </div>

                        {/* Border Radius */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Border Radius</label>
                            <div className="flex items-center gap-4">
                                <select
                                    value={localConfig.borderRadius}
                                    onChange={(e) => handleChange('borderRadius', e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#F2A619]"
                                >
                                    <option value="0px">Square (0px)</option>
                                    <option value="8px">Small (8px)</option>
                                    <option value="16px">Medium (16px)</option>
                                    <option value="24px">Large (24px)</option>
                                    <option value="9999px">Full (Pill)</option>
                                </select>
                            </div>
                        </div>

                        {/* Animation Speed */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Shimmer Speed ({localConfig.animationSpeed}s)</label>
                            <input
                                type="range"
                                min="0.5"
                                max="5"
                                step="0.1"
                                value={localConfig.animationSpeed}
                                onChange={(e) => handleChange('animationSpeed', parseFloat(e.target.value))}
                                className="w-full accent-[#F2A619]"
                            />
                        </div>

                        {/* Magnetic Strength */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-400 mb-2">Magnetic Pull Strength</label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={localConfig.magneticStrength}
                                onChange={(e) => handleChange('magneticStrength', parseFloat(e.target.value))}
                                className="w-full accent-[#F2A619]"
                            />
                            <p className="text-xs text-gray-500 mt-1">Set to 0 to disable magnetic effect.</p>
                        </div>

                    </div>
                </div>

                {/* Live Preview Area */}
                <div className="bg-[#121212] border border-white/10 rounded-2xl p-8 flex flex-col items-center justify-center sticky top-8 h-[500px]">
                    <h3 className="text-sm uppercase tracking-widest text-gray-500 mb-8">Live Preview</h3>

                    <div className="space-y-8 flex flex-col items-center">
                        <VibeButton variant="primary" configOverride={localConfig}>Primary Button</VibeButton>
                        <VibeButton variant="secondary" configOverride={localConfig}>Ghost Variant</VibeButton>
                        <VibeButton variant="danger" configOverride={localConfig}>Danger Zone</VibeButton>
                    </div>

                    <div className="mt-12 p-4 bg-black/50 rounded-lg border border-white/5 text-xs text-gray-500 font-mono">
                        <p>{`// Current Config`}</p>
                        <p>{`color: "${localConfig.primaryColor}"`}</p>
                        <p>{`radius: "${localConfig.borderRadius}"`}</p>
                        <p>{`magnetic: ${localConfig.magneticStrength}`}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
