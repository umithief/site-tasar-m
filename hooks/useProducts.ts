import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuthStore } from '../store/authStore';

export interface Product {
    _id: string;
    name: string;
    brand: string;
    category: string;
    price: number;
    image: string;
    description: string;
    compatibleModels: string[]; // e.g. ["R1M", "CBR1000RR"]
    likes?: number;
}

export const useProducts = () => {
    const { user } = useAuthStore();
    const primaryBike = user?.garage?.[0]; // Assuming first bike is primary

    return useQuery({
        queryKey: ['products'],
        queryFn: async () => {
            const res = await api.get('/products');
            // Assuming response structure { status: 'success', data: { products: [...] } } or just array based on endpoint
            // Providing fallback for different potential backend structures
            return res.data.data?.products || res.data || [];
        },
        select: (products: Product[]) => {
            if (!primaryBike) return products;

            // Sort compatible items to the top
            return [...products].sort((a, b) => {
                const aOk = a.compatibleModels?.includes(primaryBike.model) || a.brand === primaryBike.brand;
                const bOk = b.compatibleModels?.includes(primaryBike.model) || b.brand === primaryBike.brand;
                if (aOk && !bOk) return -1;
                if (!aOk && bOk) return 1;
                return 0;
            });
        }
    });
};
