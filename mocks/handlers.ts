
import { http, HttpResponse } from 'msw';
import { CONFIG } from '../services/config';
import { PRODUCTS, DEFAULT_SLIDES } from '../constants';

// Define handlers that intercept requests to the backend API
// and return mock data based on the constants.
export const handlers = [
  // Products
  http.get(`${CONFIG.API_URL}/products`, () => {
    return HttpResponse.json(PRODUCTS);
  }),

  // Slides
  http.get(`${CONFIG.API_URL}/slides`, () => {
    return HttpResponse.json(DEFAULT_SLIDES);
  }),

  // Auth (Mock Login)
  http.post(`${CONFIG.API_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;
    
    // Simulate admin login
    if (body.email === 'admin@motovibe.tr' && body.password === 'admin123') {
        return HttpResponse.json({ 
            id: 'admin-001', 
            name: 'MotoVibe Admin', 
            email: 'admin@motovibe.tr', 
            isAdmin: true, 
            joinDate: '01.01.2024' 
        });
    }
    
    return HttpResponse.json({
        id: 'user-123',
        name: 'Demo User',
        email: body.email,
        isAdmin: false,
        joinDate: new Date().toLocaleDateString()
    });
  }),

  // Routes
  http.get(`${CONFIG.API_URL}/routes`, () => {
      // Return empty or mock routes
      return HttpResponse.json([]);
  }),

  // Fallback for other requests (pass through)
  http.all('*', ({ request }) => {
      return; 
  })
];
