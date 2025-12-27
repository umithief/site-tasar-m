import { create } from 'zustand';
import { api } from '../services/api';

interface CartItem {
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
}

interface CartState {
    cart: CartItem[];
    isLoading: boolean;
    error: string | null;

    fetchCart: () => Promise<void>;
    addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => Promise<void>;
    removeFromCart: (productId: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number) => Promise<void>;
    clearCart: () => void;
}

export const useCartStore = create<CartState>((set, get) => ({
    cart: [],
    isLoading: false,
    error: null,

    fetchCart: async () => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.get('/users/cart');
            set({ cart: response.data.data.cart, isLoading: false });
        } catch (error: any) {
            console.error('Failed to fetch cart', error);
            set({ error: 'Sepet yüklenemedi', isLoading: false });
        }
    },

    addToCart: async (item) => {
        // Optimistic Update
        const currentCart = get().cart;
        const existingItemIndex = currentCart.findIndex(i => i.productId === item.productId);

        let newCart = [...currentCart];
        if (existingItemIndex > -1) {
            newCart[existingItemIndex].quantity += (item.quantity || 1);
        } else {
            newCart.push({ ...item, quantity: item.quantity || 1 });
        }

        set({ cart: newCart });

        try {
            await api.post('/users/cart', item);
        } catch (error) {
            console.error('Failed to add to cart', error);
            // Revert on error
            set({ cart: currentCart });
        }
    },

    removeFromCart: async (productId) => {
        const currentCart = get().cart;
        set({ cart: currentCart.filter(item => item.productId !== productId) });

        try {
            await api.delete(`/users/cart/${productId}`);
        } catch (error) {
            console.error('Failed to remove from cart', error);
            set({ cart: currentCart });
        }
    },

    updateQuantity: async (productId, quantity) => {
        const currentCart = get().cart;
        set({
            cart: currentCart.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            )
        });

        try {
            await api.put(`/users/cart/${productId}`, { quantity });
        } catch (error) {
            console.error('Failed to update quantity', error);
            set({ cart: currentCart });
        }
    },

    clearCart: () => set({ cart: [] })
}));
