import { create } from 'zustand';
import { uiService } from '../services/uiService';

interface UIStore {
    settings: Record<string, any>;
    fetchSettings: () => Promise<void>;
    updateSetting: (component: string, config: any) => Promise<void>;
    getComponentConfig: (component: string) => any;
}

export const useUIStore = create<UIStore>((set, get) => ({
    settings: {},

    fetchSettings: async () => {
        const settings = await uiService.getSettings();
        set({ settings });
    },

    updateSetting: async (component, config) => {
        // Optimistic update
        set((state) => ({
            settings: { ...state.settings, [component]: config }
        }));

        try {
            await uiService.updateSettings(component, config);
        } catch (error) {
            console.error("Failed to commit setting update", error);
            // Revert or fetch on error could be implemented here
        }
    },

    getComponentConfig: (component) => {
        return get().settings[component] || {};
    }
}));
