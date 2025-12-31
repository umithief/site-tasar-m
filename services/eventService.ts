import { MeetupEvent } from '../types';
import { CONFIG } from './config';

export const eventService = {
    async getEvents(): Promise<MeetupEvent[]> {
        try {
            const response = await fetch(`${CONFIG.API_URL}/events`);
            // Handle 404 or empty specifically if needed, but return array
            if (!response.ok) {
                console.warn('Events API returned status:', response.status);
                return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : (data.data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    },

    async addEvent(event: Omit<MeetupEvent, '_id'>): Promise<MeetupEvent> {
        const response = await fetch(`${CONFIG.API_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });
        if (!response.ok) throw new Error('Etkinlik oluşturulamadı');
        return await response.json();
    },

    async updateEvent(event: MeetupEvent): Promise<MeetupEvent> {
        const response = await fetch(`${CONFIG.API_URL}/events/${event._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
        });
        if (!response.ok) throw new Error('Etkinlik güncellenemedi');
        return await response.json();
    },

    async deleteEvent(id: string): Promise<void> {
        const response = await fetch(`${CONFIG.API_URL}/events/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Etkinlik silinemedi');
    },

    async joinEvent(eventId: string, user: { userId: string; name: string; avatar: string }): Promise<MeetupEvent> {
        const response = await fetch(`${CONFIG.API_URL}/events/${eventId}/join`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        if (!response.ok) throw new Error('Etkinliğe katılınamadı');
        return await response.json();
    },

    async leaveEvent(eventId: string, userId: string): Promise<MeetupEvent> {
        const response = await fetch(`${CONFIG.API_URL}/events/${eventId}/leave`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        if (!response.ok) throw new Error('Etkinlikten ayrılınamadı');
        return await response.json();
    },

    async sendMessage(eventId: string, message: { userId: string; userName: string; text: string; time?: string }): Promise<any> {
        const response = await fetch(`${CONFIG.API_URL}/events/${eventId}/message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(message)
        });
        if (!response.ok) throw new Error('Mesaj gönderilemedi');
        return await response.json();
    }
};
