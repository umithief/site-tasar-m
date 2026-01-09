import { api } from './api';


export interface Story {
    _id: string;
    userId: string; // or User object depending on population
    mediaUrl: string;
    mediaType: 'IMAGE' | 'VIDEO';
    createdAt: string;
    expiresAt: string;
    views: number;
    seen?: boolean;
}

export interface StoryGroup {
    user: {
        _id: string;
        name: string;
        avatar: string;
    };
    stories: Story[];
    allSeen: boolean;
}

export const storyService = {
    // Fetch all active stories grouped by user
    getStories: async (): Promise<StoryGroup[]> => {
        const response = await api.get('/stories');
        return response.data;
    },

    // Create a new story
    createStory: async (file: File): Promise<Story> => {
        // 1. Upload file first
        const formData = new FormData();
        formData.append('file', file);

        const uploadRes = await api.post('/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        const mediaUrl = uploadRes.data.url;

        // 2. Create story record
        const mediaType = file.type.startsWith('video') ? 'VIDEO' : 'IMAGE';

        const response = await api.post('/stories', {
            mediaUrl,
            mediaType
        });

        return response.data;
    },

    // Mark story as viewed
    viewStory: async (storyId: string): Promise<void> => {
        await api.post(`/stories/${storyId}/view`);
    }
};
