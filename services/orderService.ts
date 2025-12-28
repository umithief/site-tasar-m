
import { Order, CartItem, User } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';
import { logService } from './logService';
import { gamificationService, POINTS } from './gamificationService';
import { api } from './api';

export const orderService = {
    async createOrder(orderData: any): Promise<Order> {
        // Calculate points logic (simplified usage of passing total if needed)
        const totalAmount = orderData.totalPrice || orderData.total;
        const pointsEarned = Math.floor(totalAmount / 10) * POINTS.PER_10_TL_SPENT;

        if (CONFIG.USE_MOCK_API) {
            await delay(1000);
            // ... Mock implementation if needed, but for now focusing on structure matching
            // Ideally we mock the response or just log it
            return {} as Order;
        } else {
            // REAL BACKEND
            const response = await api.post('/orders', orderData);
            const result = response.data;

            if (pointsEarned > 0 && orderData.user?._id) {
                await gamificationService.addPoints(orderData.user._id, pointsEarned, 'Alışveriş Puanı');
            }

            return result;
        }
    },

    async getUserOrders(userId: string): Promise<Order[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(500);
            const allOrders = getStorage<Order[]>(DB.ORDERS, []);
            return allOrders.filter(order => order.userId === userId);
        } else {
            // REAL BACKEND
            try {
                const response = await api.get(`/orders?userId=${userId}`);
                return response.data;
            } catch (error) {
                console.error("Get User Orders Error", error);
                return [];
            }
        }
    },

    async getAllOrders(): Promise<Order[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(500);
            return getStorage<Order[]>(DB.ORDERS, []);
        } else {
            // REAL BACKEND
            try {
                const response = await api.get('/orders');
                return response.data;
            } catch (error) {
                console.error("Get All Orders Error", error);
                return [];
            }
        }
    },

    async getOrderById(id: string): Promise<Order | null> {
        if (CONFIG.USE_MOCK_API) {
            await delay(500);
            const orders = getStorage<Order[]>(DB.ORDERS, []);
            return orders.find(o => o._id === id) || null;
        } else {
            try {
                const response = await api.get(`/orders/${id}`);
                return response.data;
            } catch (error) {
                console.error("Get Order Error", error);
                return null;
            }
        }
    },

    async updateOrderStatus(orderId: string, status: string): Promise<void> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const orders = getStorage<Order[]>(DB.ORDERS, []);
            const index = orders.findIndex(o => o._id === orderId);
            if (index !== -1) {
                orders[index].status = status as any;
                setStorage(DB.ORDERS, orders);
            }
        } else {
            // REAL BACKEND
            await api.put(`/orders/${orderId}/status`, { status }); // Updated route
        }
    }
};
