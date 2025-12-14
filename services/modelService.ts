
import { Model3DItem } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';

const DEFAULT_MODELS: Model3DItem[] = [
    {
        id: 'model-1',
        name: 'Demo Astronot',
        url: 'https://modelviewer.dev/shared-assets/models/Astronaut.glb',
        poster: 'https://modelviewer.dev/shared-assets/models/Astronaut.png',
        category: 'Demo'
    }
];

export const modelService = {
  async getModels(): Promise<Model3DItem[]> {
    if (CONFIG.USE_MOCK_API) {
        await delay(300);
        const stored = getStorage<Model3DItem[]>(DB.MODELS, []);
        if (stored.length === 0) {
            setStorage(DB.MODELS, DEFAULT_MODELS);
            return DEFAULT_MODELS;
        }
        return stored;
    } else {
        try {
            const response = await fetch(`${CONFIG.API_URL}/models`);
            if (!response.ok) return DEFAULT_MODELS;
            return await response.json();
        } catch {
            return DEFAULT_MODELS;
        }
    }
  },

  async addModel(model: Omit<Model3DItem, 'id'>): Promise<Model3DItem> {
    if (CONFIG.USE_MOCK_API) {
        await delay(500);
        const models = getStorage<Model3DItem[]>(DB.MODELS, []);
        const newModel: Model3DItem = {
            ...model,
            id: `model-${Date.now()}`,
        };
        models.push(newModel);
        setStorage(DB.MODELS, models);
        return newModel;
    } else {
        const response = await fetch(`${CONFIG.API_URL}/models`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(model)
        });
        return await response.json();
    }
  },

  async updateModel(model: Model3DItem): Promise<void> {
    if (CONFIG.USE_MOCK_API) {
        await delay(300);
        const models = getStorage<Model3DItem[]>(DB.MODELS, []);
        const index = models.findIndex(m => m.id === model.id);
        if (index !== -1) {
            models[index] = model;
            setStorage(DB.MODELS, models);
        }
    } else {
        await fetch(`${CONFIG.API_URL}/models/${model.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(model)
        });
    }
  },

  async deleteModel(id: string): Promise<void> {
    if (CONFIG.USE_MOCK_API) {
        await delay(300);
        const models = getStorage<Model3DItem[]>(DB.MODELS, []);
        const filtered = models.filter(m => m.id !== id);
        setStorage(DB.MODELS, filtered);
    } else {
        await fetch(`${CONFIG.API_URL}/models/${id}`, {
            method: 'DELETE'
        });
    }
  }
};
