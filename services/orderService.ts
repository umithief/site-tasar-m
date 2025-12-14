
import { Order, CartItem, User } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';
import { logService } from './logService';
import { gamificationService, POINTS } from './gamificationService';

export const orderService = {
  async createOrder(user: User, items: CartItem[], total: number): Promise<Order> {
    // Calculate points: 1 point per 10 TL
    const pointsEarned = Math.floor(total / 10) * POINTS.PER_10_TL_SPENT;

    if (CONFIG.USE_MOCK_API) {
        await delay(1000);
        const orders = getStorage<Order[]>(DB.ORDERS, []);
        const newOrder: Order = {
            id: `MV-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            userId: user.id,
            date: new Date().toLocaleDateString('tr-TR'),
            status: 'Hazırlanıyor',
            total: total,
            items: items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            }))
        };
        orders.unshift(newOrder);
        setStorage(DB.ORDERS, orders);

        // LOG: Yeni Sipariş
        await logService.addLog('success', 'Yeni Sipariş', `Sipariş No: ${newOrder.id} - Tutar: ₺${total}`);
        
        // Gamification: Add Points
        if (pointsEarned > 0) {
            await gamificationService.addPoints(user.id, pointsEarned, 'Alışveriş Puanı');
        }

        return newOrder;
    } else {
        // REAL BACKEND
        const orderData = {
            userId: user.id,
            total: total,
            items: items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            }))
        };
        
        const response = await fetch(`${CONFIG.API_URL}/orders`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();
        // Backend kullanırken de frontend logunu güncelle (Mock mode ile uyumlu olması için)
        if(CONFIG.USE_MOCK_API) {
            await logService.addLog('success', 'Yeni Sipariş', `Tutar: ₺${total}`);
        }
        
        // Backend should handle points ideally, but for now we call service
        if (pointsEarned > 0) {
            await gamificationService.addPoints(user.id, pointsEarned, 'Alışveriş Puanı');
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
        const response = await fetch(`${CONFIG.API_URL}/orders?userId=${userId}`);
        if (!response.ok) return [];
        return await response.json();
    }
  },

  async getAllOrders(): Promise<Order[]> {
      if (CONFIG.USE_MOCK_API) {
          await delay(500);
          return getStorage<Order[]>(DB.ORDERS, []);
      } else {
          // REAL BACKEND
          const response = await fetch(`${CONFIG.API_URL}/orders`);
          if (!response.ok) return [];
          return await response.json();
      }
  },

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
      if (CONFIG.USE_MOCK_API) {
          await delay(300);
          const orders = getStorage<Order[]>(DB.ORDERS, []);
          const index = orders.findIndex(o => o.id === orderId);
          if (index !== -1) {
              orders[index].status = status as any;
              setStorage(DB.ORDERS, orders);
          }
      } else {
          // REAL BACKEND
          await fetch(`${CONFIG.API_URL}/orders/${orderId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status })
          });
      }
  }
};
