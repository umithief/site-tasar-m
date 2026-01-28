import { api } from './api';
import { Route } from '../types';

export const routeService = {
  getRoutes: async (filter?: string): Promise<Route[]> => {
    try {
      const response = await api.get('/routes', {
        params: { filter }
      });
      // Fallback if DB is empty or API fails
      if (!response.data || response.data.length === 0) {
        console.warn('API returned empty routes, using mock');
        return (await routeService.seedRoutes());
      }
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
        },
        // New Routes
        {
          _id: 'mock-5',
          title: 'Saklıkent Kanyon Yolu',
          description: 'Derin vadilerin arasından kıvrılarak geçen, kırmızı kayaların çevrelediği epik bir sürüş.',
          distance: '85 km',
          estimatedTime: '1h 45m',
          difficulty: 'Zor',
          location: 'Muğla/Antalya',
          image: '/assets/routes/canyon.png',
          stats: { curves: 80, roadQuality: 75, traffic: 10 },
          tags: ['Kanyon', 'Macera', 'Viraj', 'Sıcak'],
          riderCount: 650,
          bestSeason: 'İlkbahar, Sonbahar',
          difficultyMetrics: { technical: 4, scenery: 5, speed: 3 },
          terrain: ['Asfalt'],
          coordinates: [{ lat: 36.6417, lng: 29.4000 }]
        },
        {
          _id: 'mock-6',
          title: 'Abant Gölü Turu',
          description: 'Göl kenarında sakin ve huzurlu bir sürüş. Yemyeşil doğa ve masmavi suyun eşlik ettiği, fotoğraf molalarıyla dolu bir rota.',
          distance: '18 km',
          estimatedTime: '40m',
          difficulty: 'Kolay',
          location: 'Bolu',
          image: '/assets/routes/lake.png',
          stats: { curves: 50, roadQuality: 80, traffic: 60 },
          tags: ['Göl', 'Doğa', 'Kamp', 'Haftasonu'],
          riderCount: 4200,
          bestSeason: 'Dört Mevsim',
          difficultyMetrics: { technical: 1, scenery: 5, speed: 2 },
          terrain: ['Asfalt', 'Arnavut Kaldırımı'],
          coordinates: [{ lat: 40.6050, lng: 31.2750 }]
        },
        {
          _id: 'mock-7',
          title: 'Tuz Gölü Hız Denemesi',
          description: 'Ufuk çizgisine kadar uzanan dümdüz bir yol. Motosikletinin sınırlarını zorlamak ve sonsuzluk hissini tatmak için ideal.',
          distance: '120 km',
          estimatedTime: '1h',
          difficulty: 'Orta',
          location: 'Konya',
          image: '/assets/routes/desert.png',
          stats: { curves: 5, roadQuality: 98, traffic: 15 },
          tags: ['Hız', 'Düzlük', 'Gün Batımı', 'Fotoğraf'],
          riderCount: 1890,
          bestSeason: 'Yaz, Sonbahar',
          difficultyMetrics: { technical: 1, scenery: 4, speed: 5 },
          terrain: ['Asfalt'],
          coordinates: [{ lat: 38.8700, lng: 33.7000 }]
        },
        {
          _id: 'mock-8',
          title: 'Zigana Geçidi',
          description: 'Karla kaplı zirvelerin arasından süzülün. Sisli, soğuk ve zorlu hava koşullarıyla gerçek bir meydan okuma.',
          distance: '55 km',
          estimatedTime: '1h 30m',
          difficulty: 'Çok Zor',
          location: 'Trabzon/Gümüşhane',
          image: '/assets/routes/snow.png',
          stats: { curves: 90, roadQuality: 60, traffic: 30 },
          tags: ['Kar', 'Tehlikeli', 'Dağ', 'Efsane'],
          riderCount: 340,
          bestSeason: 'Yaz (Kışın Kapalı)',
          difficultyMetrics: { technical: 5, scenery: 5, speed: 1 },
          terrain: ['Asfalt', 'Buzlu'],
          coordinates: [{ lat: 40.6500, lng: 39.4000 }]
        },
        {
          _id: 'mock-9',
          title: 'İzmir Çeşme Otobanı',
          description: 'Ege rüzgarını arkanıza alın. Geniş şeritler, mükemmel asfalt ve gün batımına doğru yapılan keyifli bir sürüş.',
          distance: '80 km',
          estimatedTime: '45m',
          difficulty: 'Kolay',
          location: 'İzmir',
          image: '/assets/routes/sunset.png',
          stats: { curves: 20, roadQuality: 100, traffic: 50 },
          tags: ['Otoban', 'Hız', 'Deniz', 'Tatil'],
          riderCount: 8500,
          bestSeason: 'Yaz',
          difficultyMetrics: { technical: 1, scenery: 3, speed: 5 },
          terrain: ['Asfalt'],
          coordinates: [{ lat: 38.4237, lng: 27.1428 }]
        },
        {
          _id: 'mock-10',
          title: 'Köprüler Geçişi',
          description: 'İki kıtayı birbirine bağlayan devasa bir mühendislik harikası üzerinde sürüş. Denizin metrelerce üzerinde özgürlük hissi.',
          distance: '15 km',
          estimatedTime: '20m',
          difficulty: 'Orta',
          location: 'İstanbul',
          image: '/assets/routes/bridge.png',
          stats: { curves: 10, roadQuality: 95, traffic: 90 },
          tags: ['Köprü', 'Şehir', 'Manzara', 'Turistik'],
          riderCount: 15000,
          bestSeason: 'Her Mevsim',
          difficultyMetrics: { technical: 2, scenery: 5, speed: 3 },
          terrain: ['Asfalt'],
          coordinates: [{ lat: 41.0450, lng: 29.0300 }]
        }
      ] as any[];
    }
  }
};
