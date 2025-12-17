
import { CategoryItem, ProductCategory } from '../types';
import { DB, getStorage, setStorage, delay } from './db';
import { CONFIG } from './config';

// Varsayılan Kategoriler (Unsplash Kaynaklı - Premium/Dark Tema)
const DEFAULT_CATEGORIES: CategoryItem[] = [
  {
    _id: 'cat_1',
    name: 'KASKLAR',
    type: ProductCategory.HELMET,
    // Koyu tonlu, vizör detaylı kask görseli
    image: 'https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?q=80&w=800&auto=format&fit=crop',
    desc: 'Maksimum Güvenlik',
    count: '142 Model',
    className: 'col-span-2 row-span-2'
  },
  {
    _id: 'cat_2',
    name: 'MONTLAR',
    type: ProductCategory.JACKET,
    // Deri ceket dokusu ve sürücü duruşu
    image: 'https://images.unsplash.com/photo-1559582930-bb01987cf4dd?q=80&w=800&auto=format&fit=crop',
    desc: '4 Mevsim Koruma',
    count: '85 Model',
    className: 'col-span-2 row-span-1'
  },
  {
    _id: 'cat_3',
    name: 'ELDİVENLER',
    type: ProductCategory.GLOVES,
    // Gidon tutan eldivenli el detayı
    image: 'https://images.unsplash.com/photo-1555481771-16417c6f656c?q=80&w=800&auto=format&fit=crop',
    desc: 'Hassas Kontrol',
    count: '64 Model',
    className: 'col-span-1 row-span-1'
  },
  {
    _id: 'cat_4',
    name: 'BOTLAR',
    type: ProductCategory.BOOTS,
    // Motosiklet botu ve vites pedalı detayı
    image: 'https://images.unsplash.com/photo-1555813456-96e25216239e?q=80&w=800&auto=format&fit=crop',
    desc: 'Sağlam Adımlar',
    count: '32 Model',
    className: 'col-span-1 row-span-1'
  },
  {
    _id: 'cat_5',
    name: 'EKİPMAN',
    type: ProductCategory.PROTECTION,
    // Yarış tulumu ve koruma ekipmanı detayı
    image: 'https://images.unsplash.com/photo-1584556966052-c229e215e03f?q=80&w=800&auto=format&fit=crop',
    desc: 'Zırh & Koruma',
    count: '95 Parça',
    className: 'col-span-1 md:col-span-2 row-span-1'
  },
  {
    _id: 'cat_6',
    name: 'İNTERKOM',
    type: ProductCategory.INTERCOM,
    // Kask üzeri teknoloji/iletişim temalı
    image: 'https://images.unsplash.com/photo-1596706900226-0e318df62293?q=80&w=800&auto=format&fit=crop',
    desc: 'İletişim',
    count: '12 Model',
    className: 'col-span-1 md:col-span-2 row-span-1'
  },
];

export const categoryService = {
  async getCategories(): Promise<CategoryItem[]> {
    if (CONFIG.USE_MOCK_API) {
      await delay(300);
      const stored = getStorage<CategoryItem[]>(DB.CATEGORIES, []);
      // Reset to default if empty or using old loremflickr links (update check)
      if (stored.length === 0 || stored[0].image.includes('loremflickr.com')) {
        setStorage(DB.CATEGORIES, DEFAULT_CATEGORIES);
        return DEFAULT_CATEGORIES;
      }
      return stored;
    } else {
      // REAL BACKEND
      try {
        const response = await fetch(`${CONFIG.API_URL}/categories`);
        if (!response.ok) return DEFAULT_CATEGORIES;
        return await response.json();
      } catch {
        return DEFAULT_CATEGORIES;
      }
    }
  },

  async addCategory(category: Omit<CategoryItem, '_id'>): Promise<CategoryItem> {
    if (CONFIG.USE_MOCK_API) {
      await delay(500);
      const categories = getStorage<CategoryItem[]>(DB.CATEGORIES, []);
      const newCat: CategoryItem = {
        ...category,
        _id: `cat_${Date.now()}`,
      };
      categories.push(newCat);
      setStorage(DB.CATEGORIES, categories);
      return newCat;
    } else {
      // REAL BACKEND
      const response = await fetch(`${CONFIG.API_URL}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });
      return await response.json();
    }
  },

  async updateCategory(category: CategoryItem): Promise<void> {
    const targetId = category._id;

    if (!targetId) {
      console.error("Update failed: Missing category ID", category);
      throw new Error('Kategori ID bulunamadı');
    }

    if (CONFIG.USE_MOCK_API) {
      await delay(300);
      const categories = getStorage<CategoryItem[]>(DB.CATEGORIES, []);
      const index = categories.findIndex(c => c._id === targetId);
      if (index !== -1) {
        categories[index] = { ...category, _id: targetId };
        setStorage(DB.CATEGORIES, categories);
      }
    } else {
      // REAL BACKEND
      await fetch(`${CONFIG.API_URL}/categories/${targetId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });
    }
  },

  async deleteCategory(id: string): Promise<void> {
    if (!id) {
      console.error("Delete failed: Missing ID");
      return;
    }

    if (CONFIG.USE_MOCK_API) {
      await delay(300);
      const categories = getStorage<CategoryItem[]>(DB.CATEGORIES, []);
      const filtered = categories.filter(c => c._id !== id);
      setStorage(DB.CATEGORIES, filtered);
    } else {
      // REAL BACKEND
      await fetch(`${CONFIG.API_URL}/categories/${id}`, {
        method: 'DELETE'
      });
    }
  }
};
