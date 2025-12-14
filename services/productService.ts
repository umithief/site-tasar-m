
import { Product } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { PRODUCTS as INITIAL_PRODUCTS } from '../constants';
import { CONFIG } from './config';

export const productService = {
  async getProducts(): Promise<Product[]> {
    if (CONFIG.USE_MOCK_API) {
        const storedProducts = getStorage<Product[]>(DB.PRODUCTS, []);
        // Varsayılan ürünlere stok bilgisi ekle (eğer yoksa)
        if (storedProducts.length === 0) {
            const productsWithStock = INITIAL_PRODUCTS.map(p => ({...p, stock: 10}));
            setStorage(DB.PRODUCTS, productsWithStock);
            return productsWithStock;
        }
        return storedProducts;
    } else {
        // REAL BACKEND
        try {
            const response = await fetch(`${CONFIG.API_URL}/products`);
            if (!response.ok) return [];
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch products:", error);
            // Hata durumunda uygulamanın çökmesini engellemek için boş dizi veya varsayılan ürünleri dön
            return INITIAL_PRODUCTS.map(p => ({...p, stock: 10}));
        }
    }
  },

  // NEW METHOD: Get specific products by IDs
  async getProductsByIds(ids: number[]): Promise<Product[]> {
      const allProducts = await this.getProducts();
      return allProducts.filter(p => ids.includes(p.id));
  },

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    // Images array'ini ve ana resmi garanti altına al
    const safeProduct = {
        ...product,
        images: product.images || [product.image],
        image: product.image || (product.images && product.images[0]) || '',
        stock: product.stock || 0,
        model3d: product.model3d || ''
    };

    if (CONFIG.USE_MOCK_API) {
        await delay(500);
        const products = getStorage<Product[]>(DB.PRODUCTS, []);
        const newProduct: Product = {
            ...safeProduct,
            id: Date.now(),
        };
        products.unshift(newProduct);
        setStorage(DB.PRODUCTS, products);
        return newProduct;
    } else {
        // REAL BACKEND
        const response = await fetch(`${CONFIG.API_URL}/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(safeProduct)
        });
        return await response.json();
    }
  },

  async deleteProduct(id: number): Promise<void> {
    if (CONFIG.USE_MOCK_API) {
        await delay(300);
        const products = getStorage<Product[]>(DB.PRODUCTS, []);
        const filtered = products.filter(p => p.id !== id);
        setStorage(DB.PRODUCTS, filtered);
    } else {
        // REAL BACKEND
        await fetch(`${CONFIG.API_URL}/products/${id}`, {
            method: 'DELETE'
        });
    }
  },

  async updateProduct(product: Product): Promise<void> {
    // Images array'ini ve ana resmi garanti altına al
    const safeProduct = {
        ...product,
        images: product.images || [product.image],
        image: product.image || (product.images && product.images[0]) || '',
        stock: product.stock || 0,
        model3d: product.model3d || ''
    };

    if (CONFIG.USE_MOCK_API) {
        await delay(300);
        const products = getStorage<Product[]>(DB.PRODUCTS, []);
        const index = products.findIndex(p => p.id === product.id);
        if (index !== -1) {
            products[index] = safeProduct;
            setStorage(DB.PRODUCTS, products);
        }
    } else {
        // REAL BACKEND
        await fetch(`${CONFIG.API_URL}/products/${product.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(safeProduct)
        });
    }
  }
};
