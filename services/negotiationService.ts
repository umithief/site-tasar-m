
import { NegotiationOffer, NegotiationStatus, User, Product } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';

export const negotiationService = {
    // Admin için teklifleri getir
    async getOffers(): Promise<NegotiationOffer[]> {
        if (CONFIG.USE_MOCK_API) {
            await delay(500);
            return getStorage<NegotiationOffer[]>(DB.NEGOTIATIONS, []);
        } else {
            // REAL BACKEND
            try {
                const response = await fetch(`${CONFIG.API_URL}/negotiations`);
                if (!response.ok) return [];
                return await response.json();
            } catch {
                return [];
            }
        }
    },

    // Kullanıcı teklif gönderir
    async submitOffer(product: Product, offerPrice: number, user: User): Promise<NegotiationOffer> {
        const newOffer: NegotiationOffer = {
            id: `neg-${Date.now()}`,
            productId: product.id,
            productName: product.name,
            productImage: product.image,
            originalPrice: product.price,
            offerPrice: offerPrice,
            userId: user.id,
            userName: user.name,
            status: 'pending',
            date: new Date().toLocaleDateString('tr-TR')
        };

        if (CONFIG.USE_MOCK_API) {
            await delay(1000);
            let offers = getStorage<NegotiationOffer[]>(DB.NEGOTIATIONS, []);
            offers.unshift(newOffer);
            
            // Limit to last 20 offers to prevent storage overflow, especially if images are involved
            if (offers.length > 20) {
                offers = offers.slice(0, 20);
            }
            
            setStorage(DB.NEGOTIATIONS, offers);
            return newOffer;
        } else {
            // REAL BACKEND
            const response = await fetch(`${CONFIG.API_URL}/negotiations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newOffer)
            });
            return await response.json();
        }
    },

    // Admin durumu günceller (Kabul/Red)
    async updateOfferStatus(id: string, status: NegotiationStatus): Promise<void> {
        if (CONFIG.USE_MOCK_API) {
            await delay(500);
            const offers = getStorage<NegotiationOffer[]>(DB.NEGOTIATIONS, []);
            const index = offers.findIndex(o => o.id === id);
            if (index !== -1) {
                offers[index].status = status;
                setStorage(DB.NEGOTIATIONS, offers);
            }
        } else {
            // REAL BACKEND
            await fetch(`${CONFIG.API_URL}/negotiations/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
        }
    },

    // Kullanıcının belirli bir ürün için onaylanmış teklifi var mı kontrol et
    async checkUserOffer(userId: string, productId: number): Promise<NegotiationOffer | null> {
        if (CONFIG.USE_MOCK_API) {
            await delay(300);
            const offers = getStorage<NegotiationOffer[]>(DB.NEGOTIATIONS, []);
            // En son yapılan onaylanmış teklifi bul
            const offer = offers.find(o => o.userId === userId && o.productId === productId && o.status === 'accepted');
            return offer || null;
        } else {
            // REAL BACKEND (Currently fetching all and filtering, optimization needed for production)
            try {
                const response = await fetch(`${CONFIG.API_URL}/negotiations`);
                if (!response.ok) return null;
                const allOffers: NegotiationOffer[] = await response.json();
                const offer = allOffers.find(o => o.userId === userId && o.productId === productId && o.status === 'accepted');
                return offer || null;
            } catch {
                return null;
            }
        }
    }
};
