
import { Story } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';

// Varsayılan Storyler (Updated with new fields)
const DEFAULT_STORIES: Story[] = [
    {
        _id: 'st-1',
        title: 'Sana Özel',
        label: 'Sana Özel',
        category: 'ÖNERİLEN',
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=200&auto=format&fit=crop',
        coverImg: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=200&auto=format&fit=crop',
        videoUrl: '',
        duration: '0:30',
        color: 'border-orange-500'
    }
];

const DB_KEY_STORIES = 'mv_stories';

export const storyService = {
    async getStories(): Promise<Story[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const stored = getStorage<Story[]>(DB_KEY_STORIES, []);
            if (stored.length === 0) {
                setStorage(DB_KEY_STORIES, DEFAULT_STORIES);
                return DEFAULT_STORIES;
            }
            return stored;
        } else {
            // REAL BACKEND
            try {
                const response = await fetch(`${CONFIG.API_URL}/stories`);
                if (!response.ok) return DEFAULT_STORIES;
                const data = await response.json();

                // Map backend fields to frontend interface if needed
                // But we unified them in types.ts so it should be fine.
                // Just map legacy data if any.
                return data.map((item: any) => ({
                    ...item,
                    label: item.title, // Map title to label if label is missing
                    image: item.coverImg || item.image // Map coverImg to image
                }));
            } catch {
                return DEFAULT_STORIES;
            }
        }
    },

    async addStory(story: Omit<Story, '_id'>): Promise<Story> {
        if (CONFIG.USE_MOCK_API) {
            await delay(500);
            const stories = getStorage<Story[]>(DB_KEY_STORIES, []);
            const newStory: Story = {
                ...story,
                _id: `st-${Date.now()}`,
            };
            stories.push(newStory);
            setStorage(DB_KEY_STORIES, stories);
            return newStory;
        } else {
            // REAL BACKEND
            const response = await fetch(`${CONFIG.API_URL}/stories`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(story)
            });
            return await response.json();
        }
    },

    async updateStory(story: Story): Promise<void> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const stories = getStorage<Story[]>(DB_KEY_STORIES, []);
            const index = stories.findIndex(s => s._id === story._id);
            if (index !== -1) {
                stories[index] = story;
                setStorage(DB_KEY_STORIES, stories);
            }
        } else {
            // REAL BACKEND
            await fetch(`${CONFIG.API_URL}/stories/${story._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(story)
            });
        }
    },

    async deleteStory(id: string): Promise<void> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const stories = getStorage<Story[]>(DB_KEY_STORIES, []);
            const filtered = stories.filter(s => s._id !== id);
            setStorage(DB_KEY_STORIES, filtered);
        } else {
            // REAL BACKEND
            await fetch(`${CONFIG.API_URL}/stories/${id}`, {
                method: 'DELETE'
            });
        }
    }
};
