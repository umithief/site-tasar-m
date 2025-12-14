
import { getStorage, setStorage } from './db';
import { Variants, Transition } from 'framer-motion';

export type AnimationPreset = 'fade' | 'slide-up' | 'slide-right' | 'zoom' | 'blur' | 'flip';

export interface AnimationSettings {
    isEnabled: boolean;
    preset: AnimationPreset; // Görsel efekt türü
    type: 'spring' | 'tween'; // Fizik motoru
    duration: number; // Saniye (Tween için)
    stiffness: number; // Sertlik (Spring için)
    damping: number; // Sönümleme (Spring için)
}

const DEFAULT_SETTINGS: AnimationSettings = {
    isEnabled: true,
    preset: 'slide-up',
    type: 'spring',
    duration: 0.3,
    stiffness: 300,
    damping: 25
};

const STORAGE_KEY = 'mv_anim_settings';

export const animationService = {
    getSettings(): AnimationSettings {
        return getStorage<AnimationSettings>(STORAGE_KEY, DEFAULT_SETTINGS);
    },

    saveSettings(settings: AnimationSettings) {
        setStorage(STORAGE_KEY, settings);
        window.dispatchEvent(new Event('anim-settings-changed'));
    },

    // Fiziksel geçiş ayarlarını döndürür
    getTransition(): Transition {
        const settings = this.getSettings();
        if (!settings.isEnabled) return { duration: 0 };

        if (settings.type === 'spring') {
            return {
                type: 'spring',
                stiffness: settings.stiffness,
                damping: settings.damping
            };
        } else {
            return {
                type: 'tween',
                duration: settings.duration,
                ease: 'easeInOut'
            };
        }
    },

    // Görsel efekt (Variant) ayarlarını döndürür
    getGlobalVariants(): Variants {
        const { preset, isEnabled } = this.getSettings();

        if (!isEnabled) {
            return {
                initial: { opacity: 1 },
                animate: { opacity: 1 },
                exit: { opacity: 1 }
            };
        }

        switch (preset) {
            case 'slide-up':
                return {
                    initial: { opacity: 0, y: 30 },
                    animate: { opacity: 1, y: 0 },
                    exit: { opacity: 0, y: -30 }
                };
            case 'slide-right':
                return {
                    initial: { opacity: 0, x: -30 },
                    animate: { opacity: 1, x: 0 },
                    exit: { opacity: 0, x: 30 }
                };
            case 'zoom':
                return {
                    initial: { opacity: 0, scale: 0.9 },
                    animate: { opacity: 1, scale: 1 },
                    exit: { opacity: 0, scale: 1.1 }
                };
            case 'blur':
                return {
                    initial: { opacity: 0, filter: 'blur(10px)' },
                    animate: { opacity: 1, filter: 'blur(0px)' },
                    exit: { opacity: 0, filter: 'blur(10px)' }
                };
            case 'flip':
                return {
                    initial: { opacity: 0, rotateX: 90 },
                    animate: { opacity: 1, rotateX: 0 },
                    exit: { opacity: 0, rotateX: -90 }
                };
            case 'fade':
            default:
                return {
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 }
                };
        }
    }
};
