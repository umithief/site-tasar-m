import { Product } from '../types';

const API_URL = 'http://localhost:5000/api/showcase';

export const showcaseService = {
    // Get all items
    getAll: async (): Promise<Product[]> => {
        try {
            const response = await fetch(API_URL);
            if (!response.ok) throw new Error('Vitrin ürünleri getirilemedi');
            return await response.json();
        } catch (error) {
            console.error('Error fetching showcase items:', error);
            throw error;
        }
    },

    // Add new item
    add: async (item: Partial<Product>): Promise<Product> => {
        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            if (!response.ok) throw new Error('Vitrin ürünü eklenemedi');
            return await response.json();
        } catch (error) {
            console.error('Error adding showcase item:', error);
            throw error;
        }
    },

    // Update item
    update: async (id: string, item: Partial<Product>): Promise<Product> => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item),
            });
            if (!response.ok) throw new Error('Vitrin ürünü güncellenemedi');
            return await response.json();
        } catch (error) {
            console.error('Error updating showcase item:', error);
            throw error;
        }
    },

    // Delete item
    delete: async (id: string): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Vitrin ürünü silinemedi');
        } catch (error) {
            console.error('Error deleting showcase item:', error);
            throw error;
        }
    },
};
