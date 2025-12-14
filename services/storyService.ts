
import { Story } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';

// Varsayılan Storyler
const DEFAULT_STORIES: Story[] = [
    { id: 'st-1', label: 'Sana Özel', image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=200&auto=format&fit=crop', color: 'border-orange-500' },
    { id: 'st-2', label: 'Çok Satanlar', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c3d?q=80&w=200&auto=format&fit=crop', color: 'border-green-500' },
    { id: 'st-3', label: 'Kuponlar', image: 'https://images.unsplash.com/photo-1622185135505-2d795043ec63?q=80&w=200&auto=format&fit=crop', color: 'border-purple-500' },
    { id: 'st-4', label: 'Yeni Sezon', image: 'https://images.unsplash.com/photo-1593055363567-c6b77c427329?q=80&w=200&auto=format&fit=crop', color: 'border-blue-500' },
    { id: 'st-5', label: 'Flaş Ürünler', image: 'https://images.unsplash.com/photo-1589408432328-9b5947a5079a?q=80&w=200&auto=format&fit=crop', color: 'border-red-500' },
    { id: 'st-6', label: 'Aksesuarlar', image: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?q=80&w=200&auto=format&fit=crop', color: 'border-yellow-500' },
    { id: 'st-7', label: 'Kasklar', image: 'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?q=80&w=200&auto=format&fit=crop', color: 'border-gray-500' },
    { id: 'st-8', label: 'Outlet', image: 'https://images.unsplash.com/photo-1615172282427-9a5752d6486d?q=80&w=200&auto=format&fit=crop', color: 'border-pink-500' },
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
            return await response.json();
        } catch {
            return DEFAULT_STORIES;
        }
    }
  },

  async addStory(story: Omit<Story, 'id'>): Promise<Story> {
    if (CONFIG.USE_MOCK_API) {
        await delay(500);
        const stories = getStorage<Story[]>(DB_KEY_STORIES, []);
        const newStory: Story = {
            ...story,
            id: `st-${Date.now()}`,
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
        const index = stories.findIndex(s => s.id === story.id);
        if (index !== -1) {
            stories[index] = story;
            setStorage(DB_KEY_STORIES, stories);
        }
    } else {
        // REAL BACKEND
        await fetch(`${CONFIG.API_URL}/stories/${story.id}`, {
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
        const filtered = stories.filter(s => s.id !== id);
        setStorage(DB_KEY_STORIES, filtered);
    } else {
        // REAL BACKEND
        await fetch(`${CONFIG.API_URL}/stories/${id}`, {
            method: 'DELETE'
        });
    }
  }
};
