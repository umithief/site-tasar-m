
import { api } from './api';
import { UserBike } from '../types';

export const garageService = {
    getGarage: async (): Promise<UserBike[]> => {
        const response = await api.get('/users/garage');
        return response.data;
    },

    addToGarage: async (vehicleData: Partial<UserBike>) => {
        const response = await api.post('/users/garage', vehicleData);
        return response.data;
    },

    removeFromGarage: async (garageId: string) => {
        const response = await api.delete(`/users/garage/${garageId}`);
        return response.data;
    },

    // Add alias for compatibility if needed, or remove if unused
    addBike: async (bike: Partial<UserBike>) => {
        return garageService.addToGarage(bike);
    },

    deleteBike: async (id: string) => {
        return garageService.removeFromGarage(id);
    }
};
