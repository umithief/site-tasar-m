import { api } from './api';
import { Route } from '../types';

export const routeService = {
  getRoutes: async (filter?: string): Promise<Route[]> => {
    try {
      const response = await api.get('/routes', {
        params: { filter }
      });
      return response.data;
    } catch (e) {
      console.warn('API getRoutes failed, using mock');
      return (await routeService.seedRoutes()); // Fallback to full mock if API fails
    }
  },

  getRouteById: async (id: string): Promise<Route> => {
    const response = await api.get(`/routes/${id}`);
    return response.data;
  },

  createRoute: async (routeData: any, token: string): Promise<Route> => {
    // Note: 'api' instance already handles the token via interceptors if it exists in localStorage.
    // However, if the service specifically asks for a token arg, we can leave it, but the interceptor is cleaner.
    // We'll trust the interceptor for consistency, but the method signature can stay for compatibility.
    const response = await api.post('/routes', routeData);
    return response.data;
  },

  seedRoutes: async (): Promise<Route[]> => {
    try {
      const response = await api.post('/routes/seed');
      return response.data;
    } catch (error) {
      console.warn('Backend seed failed, using local mock data');
      // Fallback Mock Data with Turn-by-Turn Coordinates
      return [
        {
          _id: 'mock-1',
          title: 'Şile Coastal Run',
          description: 'Experience the breathtaking Black Sea coast with a perfect mix of high-speed straights and technical curves.',
          distance: '145 km',
          estimatedTime: '2h 15m',
          difficulty: 'Orta',
          location: 'Şile, Istanbul',
          image: 'https://images.unsplash.com/photo-1519003300449-6cb3878b2d18?q=80&w=1000&auto=format&fit=crop',
          stats: { curves: 75, roadQuality: 90, traffic: 40 },
          tags: ['Coastal', 'Scenic', 'Fast'],
          riderCount: 1243,
          bestSeason: 'Spring, Summer',
          difficultyMetrics: { technical: 3, scenery: 5, speed: 4 },
          terrain: ['Asphalt'],
          coordinates: [
            { lat: 41.1744, lng: 29.6116 }, // Start
            { lat: 41.1780, lng: 29.6200 }, // Waypoint
            { lat: 41.1850, lng: 29.6300 }, // Waypoint
            { lat: 41.1900, lng: 29.6400 }  // End
          ]
        },
        {
          _id: 'mock-2',
          title: 'Uludağ Summit Climb',
          description: 'A technical mountain pass challenging even the most experienced riders with its hairpin turns.',
          distance: '42 km',
          estimatedTime: '1h 10m',
          difficulty: 'Zor',
          location: 'Bursa',
          image: 'https://images.unsplash.com/photo-1625026412613-2287c2b3e8c0?q=80&w=1000&auto=format&fit=crop',
          stats: { curves: 95, roadQuality: 85, traffic: 30 },
          tags: ['Mountain', 'Technical', 'Curves'],
          riderCount: 856,
          bestSeason: 'Summer, Autumn',
          difficultyMetrics: { technical: 5, scenery: 5, speed: 2 },
          terrain: ['Asphalt'],
          coordinates: [
            { lat: 40.1828, lng: 29.0669 },
            { lat: 40.1500, lng: 29.0800 },
            { lat: 40.1200, lng: 29.1000 },
            { lat: 40.0900, lng: 29.1300 }
          ]
        }
      ] as any[];
    }
  }
};
