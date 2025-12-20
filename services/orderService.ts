
import { Order, CartItem, User } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';
import { logService } from './logService';
import { gamificationService, POINTS } from './gamificationService';
import { api } from './api';

export const orderService = {
    async createOrder(user: User, items: CartItem[], total: number): Promise<Order> {
        // Calculate points: 1 point per 10 TL
        const pointsEarned = Math.floor(total / 10) * POINTS.PER_10_TL_SPENT;

        if (CONFIG.USE_MOCK_API) {
            await delay(1000);
            const orders = getStorage<Order[]>(DB.ORDERS, []);
            const newOrder: Order = {
                _id: `MV_${new Date().getFullYear()}_${Math.floor(1000 + Math.random() * 9000)}`,
                userId: user._id,
                date: new Date().toLocaleDateString('tr-TR'),
                status: 'Hazırlanıyor',
                total: total,
                items: items.map(item => ({
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                }))
            };
            orders.unshift(newOrder);
            setStorage(DB.ORDERS, orders);

            // LOG: Yeni Sipariş
            await logService.addLog('success', 'Yeni Sipariş', `Sipariş No: ${newOrder._id} - Tutar: ₺${total}`);

            // Gamification: Add Points
            if (pointsEarned > 0) {
                await gamificationService.addPoints(user._id, pointsEarned, 'Alışveriş Puanı');
            }

            return newOrder;
        } else {
            // REAL BACKEND
            const orderData = {
                userId: user._id,
                total: total,
                items: items.map(item => ({
                    productId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image
                }))
            };

            const response = await api.post('/orders', orderData);
            const result = response.data;

            if (pointsEarned > 0) {
                await gamificationService.addPoints(user._id, pointsEarned, 'Alışveriş Puanı');
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
            await api.put(`/orders/${orderId}`, { status });
        }
    }
};
