import { api } from './api';

export interface GarageVehicle {
    _id: string;
    brand: string;
    model: string;
    year: number;
    image: string;
}

export const garageService = {
    addToGarage: (vehicleData: { brand: string; model: string; year?: number; image?: string }) => {
        return api.post('/users/garage', vehicleData);
    },

    removeFromGarage: (garageId: string) => {
        return api.delete(`/users/garage/${garageId}`);
    }
};
