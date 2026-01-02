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
    onCartClick?: () => void;
}

export const Shop: React.FC<ShopProps> = ({
    products,
    onAddToCart,
    onProductClick,
    favoriteIds,
    onToggleFavorite,
    onQuickView,
    onNavigate,
    initialCategory = 'ALL',
    onCartClick
}) => {
    // We delegate completely to WebShop for the desktop experience
    return (
        <WebShop
            products={products} // Pass products down
            onAddToCart={onAddToCart}
            onToggleFavorite={onToggleFavorite}
            favoriteIds={favoriteIds}
            onCartClick={onCartClick}
            onNavigate={onNavigate}
        />
    );
};
