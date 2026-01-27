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

  createRoute: async (routeData: any, token?: string): Promise<Route> => {
    // Note: 'api' instance already handles the token via interceptors if it exists in localStorage.
    // However, if the service specifically asks for a token arg, we can leave it, but the interceptor is cleaner.
    // We'll trust the interceptor for consistency, but the method signature can stay for compatibility.
    const response = await api.post('/routes', routeData);
    return response.data;
  },

  updateRoute: async (routeData: any): Promise<Route> => {
    const response = await api.put(`/routes/${routeData._id || routeData.id}`, routeData);
    return response.data;
  },

  deleteRoute: async (id: string): Promise<void> => {
    await api.delete(`/routes/${id}`);
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
          title: 'Şile Sahil Yolu',
          description: 'Mavi ve yeşilin buluştuğu bu sahil yolunda rüzgarla dans edin. Keskin virajlar ve uzun düzlüklerin mükemmel dengesi.',
          distance: '145 km',
          estimatedTime: '2h 15m',
          difficulty: 'Orta',
          location: 'Şile, İstanbul',
          image: '/assets/routes/coastal.png',
          stats: { curves: 75, roadQuality: 90, traffic: 40 },
          tags: ['Sahil', 'Manzara', 'Hızlı', 'Virajlı'],
          riderCount: 1243,
          bestSeason: 'İlkbahar, Yaz',
          difficultyMetrics: { technical: 3, scenery: 5, speed: 4 },
          terrain: ['Asfalt'],
          coordinates: [{ lat: 41.1744, lng: 29.6116 }]
        },
        {
          _id: 'mock-2',
          title: 'Uludağ Zirve Tırmanışı',
          description: 'Bulutların üzerine çıkmaya hazır mısın? Keskin hairpin virajları ve serin dağ havasıyla gerçek bir sürüş testi.',
          distance: '42 km',
          estimatedTime: '1h 10m',
          difficulty: 'Zor',
          location: 'Bursa',
          image: '/assets/routes/mountain.png',
          stats: { curves: 95, roadQuality: 85, traffic: 30 },
          tags: ['Dağ', 'Teknik', 'Viraj', 'Soğuk'],
          riderCount: 856,
          bestSeason: 'Yaz, Sonbahar',
          difficultyMetrics: { technical: 5, scenery: 5, speed: 2 },
          terrain: ['Asfalt'],
          coordinates: [{ lat: 40.1828, lng: 29.0669 }]
        },
        {
          _id: 'mock-3',
          title: 'Belgrad Ormanı Keşfi',
          description: 'Şehrin gürültüsünden kaçıp doğanın kalbine yolculuk. Ağaç tünelleri arasından geçen bu rota, huzurlu ve keyifli bir sürüş vadediyor.',
          distance: '25 km',
          estimatedTime: '45m',
          difficulty: 'Kolay',
          location: 'Sarıyer, İstanbul',
          image: '/assets/routes/forest.png',
          stats: { curves: 40, roadQuality: 70, traffic: 50 },
          tags: ['Orman', 'Doğa', 'Kısa Rota', 'Huzur'],
          riderCount: 2105,
          bestSeason: 'Sonbahar, İlkbahar',
          difficultyMetrics: { technical: 2, scenery: 4, speed: 3 },
          terrain: ['Asfalt', 'Stabilize'],
          coordinates: [{ lat: 41.1790, lng: 28.9800 }]
        },
        {
          _id: 'mock-4',
          title: 'İstanbul Gece Hattı',
          description: 'Şehir uyurken asfalt senin. Köprü ışıkları, boş caddeler ve neon tabelalar eşliğinde siberpunk bir sürüş deneyimi.',
          distance: '60 km',
          estimatedTime: '1h 30m',
          difficulty: 'Orta',
          location: 'İstanbul',
          image: '/assets/routes/city.png',
          stats: { curves: 30, roadQuality: 95, traffic: 20 },
          tags: ['Gece', 'Şehir', 'Fotoğraf', 'Cruise'],
          riderCount: 3420,
          bestSeason: 'Her Mevsim (Gece)',
          difficultyMetrics: { technical: 2, scenery: 5, speed: 4 },
          terrain: ['Asfalt'],
          coordinates: [{ lat: 41.0082, lng: 28.9784 }]
        }
      ] as any[];
    }
  }
};
