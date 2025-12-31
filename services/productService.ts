import { Product } from '../types';
import { CONFIG } from './config';

export const productService = {

    async getProducts(): Promise<Product[]> {
        try {
            const response = await fetch(`${CONFIG.API_URL}/products`);
            if (!response.ok) {
                console.warn('Products API returned status:', response.status);
                return [];
            }
            const data = await response.json();
            return Array.isArray(data) ? data : (data.data || []);
        } catch (error) {
            console.error("Failed to fetch products:", error);
            return [];
        }
    },

    // Get specific products by APIs
    async getProductsByIds(ids: string[]): Promise<Product[]> {
        // Optimization: In a real app, you might want a specific endpoint like /products?ids=...
        // For now, filtering client-side after fetch is okay if dataset is small, 
        // but ideally we should fetch only what we need.
        const allProducts = await this.getProducts();
        return allProducts.filter(p => ids.includes(p._id));
    },

    async addProduct(product: Omit<Product, '_id'>): Promise<Product> {
        // Ensure images array and main image are present
        const safeProduct = {
            ...product,
            images: product.images || [product.image],
            image: product.image || (product.images && product.images[0]) || '',
            stock: product.stock || 0,
            model3d: product.model3d || ''
        };

        const response = await fetch(`${CONFIG.API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(safeProduct)
        });
        if (!response.ok) throw new Error('Failed to add product');
        return await response.json();
    },

    async deleteProduct(id: string): Promise<void> {
        const response = await fetch(`${CONFIG.API_URL}/products/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete product');
    },

    async updateProduct(product: Product): Promise<void> {
        const safeProduct = {
            ...product,
            images: product.images || [product.image],
            image: product.image || (product.images && product.images[0]) || '',
            stock: product.stock || 0,
            model3d: product.model3d || ''
        };

        const response = await fetch(`${CONFIG.API_URL}/products/${product._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(safeProduct)
        });
        if (!response.ok) throw new Error('Failed to update product');
    }
};
