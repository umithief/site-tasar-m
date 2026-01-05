import { API_URL } from './config';

export const uiService = {
    async getSettings() {
        try {
            const response = await fetch(`${API_URL}/ui-settings`);
            if (!response.ok) throw new Error('Failed to fetch UI settings');
            return await response.json();
        } catch (error) {
            console.error(error);
            return {};
        }
    },

    async updateSettings(component: string, config: any) {
        try {
            const response = await fetch(`${API_URL}/ui-settings/${component}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
            if (!response.ok) throw new Error('Failed to update UI settings');
            return await response.json();
        } catch (error) {
            throw error;
        }
    }
};
