import React from 'react';
import { Product, ProductCategory } from '../types';
import { WebShop } from './desktop/WebShop';
import { ShopSidebar } from './desktop/ShopSidebar'; // Ensure imports if needed or WebShop handles it.
// Actually WebShop handles layout.

interface ShopProps {
    products: Product[];
    onAddToCart: (product: Product, event?: React.MouseEvent) => void;
    onProductClick: (product: Product) => void;
    favoriteIds: string[];
    onToggleFavorite: (product: Product) => void;
    onQuickView: (product: Product) => void; // WebShop handles quick view internally but maybe we want to sync?
    onNavigate: (view: any) => void;
    initialCategory?: ProductCategory | 'ALL';
}

export const Shop: React.FC<ShopProps> = ({
    products,
    onAddToCart,
    onProductClick,
    favoriteIds,
    onToggleFavorite,
    onQuickView,
    onNavigate,
    initialCategory = 'ALL'
}) => {
    // We delegate completely to WebShop for the desktop experience
    return (
        <WebShop
            // We pass products if we want WebShop to use them, but WebShop defines its own state. 
            // Let's pass them to avoid re-fetching if App already has them. 
            // I need to update WebShop to accept 'products' prop first.
            // For now, I will let WebShop fetch or better yet, I will use a prop in WebShop.
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            favoriteIds={favoriteIds}
        // WebShop currently manages its own products state but I will update it.
        />
    );
};
