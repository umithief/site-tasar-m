<<<<<<< HEAD
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
=======

import { UserBike } from '../types';

// Mock Data
let MOCK_GARAGE: UserBike[] = [
    {
        _id: '1',
        brand: 'Yamaha',
        model: 'R25',
        year: '2023',
        km: '12500',
        color: 'Siyah',
        image: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1200',
        isPublic: true,
        notes: 'Hafta sonu gezileri için.'
    },
    {
        _id: '2',
        brand: 'Honda',
        model: 'Africa Twin',
        year: '2022',
        km: '24000',
        color: 'Kırmızı',
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=1200',
        isPublic: true,
        notes: 'Uzun yol makinesi.'
    }
];

export const garageService = {
    getGarage: async (): Promise<UserBike[]> => {
        // Simulate API delay
        return new Promise((resolve) => {
            setTimeout(() => resolve(MOCK_GARAGE), 500);
        });
    },

    addBike: async (bike: Omit<UserBike, '_id'>): Promise<UserBike> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newBike = { ...bike, _id: Date.now().toString() };
                MOCK_GARAGE = [newBike, ...MOCK_GARAGE];
                resolve(newBike);
            }, 600);
        });
    },

    deleteBike: async (id: string): Promise<void> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                MOCK_GARAGE = MOCK_GARAGE.filter(b => b._id !== id);
                resolve();
            }, 400);
        });
>>>>>>> restore-2025-12-25
    }
};
