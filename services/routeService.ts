import axios from 'axios';
import { Route } from '../types';

const API_URL = 'http://localhost:5000/api/routes'; // Adjust base URL if needed

export const routeService = {
  getRoutes: async (filter?: string): Promise<Route[]> => {
    const response = await axios.get(API_URL, {
      params: { filter }
    });
    return response.data;
  },

  getRouteById: async (id: string): Promise<Route> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  createRoute: async (routeData: any, token: string): Promise<Route> => {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
    const response = await axios.post(API_URL, routeData, config);
    return response.data;
  },

  seedRoutes: async (): Promise<Route[]> => {
    const response = await axios.post(`${API_URL}/seed`);
    return response.data;
  }
};
