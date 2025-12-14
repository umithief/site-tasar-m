
import Lenis from 'lenis';
import { getStorage, setStorage } from './db';

export interface ScrollSettings {
    isEnabled: boolean;
    duration: number; // The duration of the scroll animation (s)
    easing: number; // Controls the curve. Higher = smoother/slower stop.
    smoothWheel: boolean; // Whether to enable smooth scrolling for mouse wheel
    orientation: 'vertical' | 'horizontal';
}

const DEFAULT_SETTINGS: ScrollSettings = {
    isEnabled: true,
    duration: 1.2,
    easing: 1.0, 
    smoothWheel: true,
    orientation: 'vertical'
};

const STORAGE_KEY = 'mv_scroll_settings';

let lenisInstance: Lenis | null = null;
let rafId: number | null = null;

export const lenisService = {
    getSettings(): ScrollSettings {
        return getStorage<ScrollSettings>(STORAGE_KEY, DEFAULT_SETTINGS);
    },

    saveSettings(settings: ScrollSettings) {
        setStorage(STORAGE_KEY, settings);
        this.init(); // Re-initialize with new settings
    },

    init() {
        // Clean up existing instance
        this.destroy();

        const settings = this.getSettings();

        if (!settings.isEnabled) {
            document.documentElement.classList.remove('lenis', 'lenis-smooth');
            return;
        }

        // Dynamic Easing Function
        // t is progress (0 to 1)
        // settings.easing affects the exponent. 
        // Default (1.0) -> standard exponential ease out.
        // Higher (>1) -> More friction, faster stop.
        // Lower (<1) -> Less friction, very long glide.
        const friction = Math.max(0.1, settings.easing * 10); 
        const customEasing = (t: number) => Math.min(1, 1.001 - Math.pow(2, -friction * t));

        try {
            lenisInstance = new Lenis({
                duration: settings.duration,
                easing: customEasing,
                orientation: settings.orientation,
                gestureOrientation: settings.orientation,
                smoothWheel: settings.smoothWheel,
                wheelMultiplier: 1,
                touchMultiplier: 2,
            });

            // Request Animation Frame Loop
            const raf = (time: number) => {
                lenisInstance?.raf(time);
                rafId = requestAnimationFrame(raf);
            };

            rafId = requestAnimationFrame(raf);
            
            // Add global class
            document.documentElement.classList.add('lenis', 'lenis-smooth');
            console.log("🌊 Lenis Scroll Initialized", settings);
        } catch (e) {
            console.error("Lenis init failed", e);
        }
    },

    destroy() {
        if (rafId) {
            cancelAnimationFrame(rafId);
            rafId = null;
        }
        if (lenisInstance) {
            lenisInstance.destroy();
            lenisInstance = null;
        }
        document.documentElement.classList.remove('lenis', 'lenis-smooth');
    },

    getInstance() {
        return lenisInstance;
    }
};
