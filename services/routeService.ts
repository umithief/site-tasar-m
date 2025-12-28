import { api } from './api';
import { Route } from '../types';

export const routeService = {
  getRoutes: async (filter?: string): Promise<Route[]> => {
    const response = await api.get('/routes', {
      params: { filter }
    });
    return response.data;
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
    const response = await api.post('/routes/seed');
    return response.data;
  }
};
