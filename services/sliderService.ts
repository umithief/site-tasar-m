import { Slide } from '../types';
import { CONFIG } from './config';

export const sliderService = {

    async getSlides(): Promise<Slide[]> {
        try {
            const response = await fetch(`${CONFIG.API_URL}/slides`);
            if (!response.ok) {
                console.warn("Slider API fail:", response.status);
                return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : (data.data || []);
        } catch (error) {
            console.error("Failed to fetch slides:", error);
            return [];
        }
    },

    async addSlide(slide: Omit<Slide, '_id'>): Promise<Slide> {
        const response = await fetch(`${CONFIG.API_URL}/slides`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slide)
        });
        if (!response.ok) throw new Error('Failed to add slide');
        return await response.json();
    },

    async updateSlide(slide: Slide): Promise<void> {
        const response = await fetch(`${CONFIG.API_URL}/slides/${slide._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(slide)
        });
        if (!response.ok) throw new Error('Failed to update slide');
    },

    async deleteSlide(id: string): Promise<void> {
        const response = await fetch(`${CONFIG.API_URL}/slides/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete slide');
    }
};
