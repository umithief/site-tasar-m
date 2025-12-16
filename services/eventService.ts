import { MeetupEvent } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';

// Mock Events Data
const MOCK_EVENTS: MeetupEvent[] = [
    {
        id: 'evt_1',
        title: 'Gece Sürüşü: İstanbul Işıkları',
        type: 'night-ride',
        date: '2025-06-15',
        time: '22:00',
        location: 'Bağdat Caddesi, İstanbul',
        coordinates: { lat: 40.9632, lng: 29.0632 },
        organizer: 'MotoVibe Team',
        attendees: 42,
        image: 'https://images.unsplash.com/photo-1579895240614-2795c328517e?q=80&w=800&auto=format&fit=crop',
        description: 'İstanbul\'un eşsiz gece manzarasında yaklaşık 2 saatlik keyifli bir sürüş.'
    },
    {
        id: 'evt_2',
        title: 'Pazar Kahvesi & Sohbet',
        type: 'coffee',
        date: '2025-06-18',
        time: '10:00',
        location: 'Emirgan Korusu',
        coordinates: { lat: 41.1082, lng: 29.0553 },
        organizer: 'Cafe Racers TR',
        attendees: 15,
        image: 'https://images.unsplash.com/photo-1512413914633-b5043f4041ea?q=80&w=800&auto=format&fit=crop',
        description: 'Hafta sonuna güzel bir kahve ve motosiklet sohbetiyle başlıyoruz.'
    }
];

export const eventService = {
    async getEvents(): Promise<MeetupEvent[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(500);
            const stored = getStorage<MeetupEvent[]>(DB.EVENTS, []);
            if (stored.length === 0) {
                setStorage(DB.EVENTS, MOCK_EVENTS);
                return MOCK_EVENTS;
            }
            return stored;
        } else {
            // REAL BACKEND
            try {
                const response = await fetch(`${CONFIG.API_URL}/events`);
                if (!response.ok) return MOCK_EVENTS;
                // Backend returns _id transformed to id by toJSON, but ensure it matches
                return await response.json();
            } catch (error) {
                console.error('Error fetching events:', error);
                return MOCK_EVENTS;
            }
        }
    },

    async addEvent(event: Omit<MeetupEvent, 'id'>): Promise<MeetupEvent> {
        if (CONFIG.USE_MOCK_API) {
            await delay(800);
            const events = getStorage<MeetupEvent[]>(DB.EVENTS, []);
            const newEvent: MeetupEvent = {
                ...event,
                id: `evt_${Date.now()}`
            };
            events.push(newEvent);
            setStorage(DB.EVENTS, events);
            return newEvent;
        } else {
            // REAL BACKEND
            const response = await fetch(`${CONFIG.API_URL}/events`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
            if (!response.ok) throw new Error('Etkinlik oluşturulamadı');
            return await response.json();
        }
    },

    async updateEvent(event: MeetupEvent): Promise<MeetupEvent> {
        if (CONFIG.USE_MOCK_API) {
            await delay(500);
            const events = getStorage<MeetupEvent[]>(DB.EVENTS, []);
            const index = events.findIndex(e => e.id === event.id);
            if (index !== -1) {
                events[index] = event;
                setStorage(DB.EVENTS, events);
                return event;
            }
            throw new Error('Etkinlik bulunamadı');
        } else {
            // REAL BACKEND
            const response = await fetch(`${CONFIG.API_URL}/events/${event.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(event)
            });
            if (!response.ok) throw new Error('Etkinlik güncellenemedi');
            return await response.json();
        }
    },

    async deleteEvent(id: string): Promise<void> {
        if (CONFIG.USE_MOCK_API) {
            await delay(500);
            const events = getStorage<MeetupEvent[]>(DB.EVENTS, []);
            const filtered = events.filter(e => e.id !== id);
            setStorage(DB.EVENTS, filtered);
        } else {
            // REAL BACKEND
            const response = await fetch(`${CONFIG.API_URL}/events/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Etkinlik silinemedi');
        }
    }
};
