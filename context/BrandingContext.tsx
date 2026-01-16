
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

interface BrandingSettings {
    iconType: 'VELOCITY' | 'HELMET' | 'PISTON' | 'TEXT_ONLY';
    primaryColor: string;
    accentColor: string;
    surfaceColor: string;
    textColor: string;
    fontStyle: 'TECH' | 'RACING' | 'MINIMAL';
    letterSpacing: number;
    fontBaseSize: number;
    borderRadius: number;
    glassBlur: number;
}

const defaultSettings: BrandingSettings = {
    iconType: 'VELOCITY',
    primaryColor: '#E2FF3B',
    accentColor: '#FFFFFF',
    surfaceColor: '#09090b',
    textColor: '#FFFFFF',
    fontStyle: 'TECH',
    letterSpacing: 0,
    fontBaseSize: 16,
    borderRadius: 16,
    glassBlur: 10
};

interface BrandingContextType {
    settings: BrandingSettings;
    updateSettings: (newSettings: BrandingSettings) => Promise<void>;
    isLoading: boolean;
}

const BrandingContext = createContext<BrandingContextType>({
    settings: defaultSettings,
    updateSettings: async () => { },
    isLoading: true
});

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<BrandingSettings>(defaultSettings);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/ui-settings/branding');
                if (res.data) {
                    setSettings(res.data);
                }
            } catch (error) {
                console.error('Failed to fetch branding settings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSettings();
    }, []);

    // Apply CSS Variables
    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--moto-primary', settings.primaryColor);
        root.style.setProperty('--moto-accent', settings.accentColor);
        root.style.setProperty('--moto-surface', settings.surfaceColor);
        root.style.setProperty('--moto-text', settings.textColor);
        root.style.setProperty('--font-base', `${settings.fontBaseSize}px`);
        root.style.setProperty('--radius-base', `${settings.borderRadius}px`);
        root.style.setProperty('--glass-blur', `${settings.glassBlur}px`);

        // Font Family Logic could go here if we were loading fonts dynamically
    }, [settings]);

    const updateSettings = async (newSettings: BrandingSettings) => {
        // Optimistic update
        setSettings(newSettings);
        try {
            await api.put('/ui-settings/branding', newSettings);
        } catch (error) {
            console.error('Failed to update branding settings:', error);
            // Revert changes if needed, but for now we keep optmistic
        }
    };

    return (
        <BrandingContext.Provider value={{ settings, updateSettings, isLoading }}>
            {children}
        </BrandingContext.Provider>
    );
};

export const useBranding = () => useContext(BrandingContext);
