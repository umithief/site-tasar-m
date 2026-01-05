
import { Ride } from '../types';

// Use specific type if available, otherwise any for the form data
interface CreateRideData {
    title: string;
    description?: string;
    startTime: string; // ISO
    difficulty: 'Easy' | 'Moderate' | 'Hard';
    maxParticipants: number;
    route: any;
}

import { API_URL } from './config';
// const API_URL = 'http://localhost:5000/api'; // Adjust port if needed

export const rideService = {
    async createRide(data: CreateRideData): Promise<Ride> {
        const response = await fetch(`${API_URL}/rides`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                // 'Authorization': `Bearer ${token}` // Add auth token if needed
            },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const error = await response.json();
            // Handle Zod validation errors
            if (error.errors && Array.isArray(error.errors)) {
                const messages = error.errors.map((err: any) => `${err.path.join('.')}: ${err.message}`).join('\n');
                throw new Error(messages);
            }
            throw new Error(error.message || 'Failed to create ride');
        }

        return response.json();
    },

    async getRides(): Promise<Ride[]> {
        const response = await fetch(`${API_URL}/rides`);
        if (!response.ok) {
            throw new Error('Failed to fetch rides');
        }
        return response.json();
    }
};
