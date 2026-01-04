
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

const API_URL = 'http://localhost:5000/api'; // Adjust port if needed

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
