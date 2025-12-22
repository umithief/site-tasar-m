
import React from 'react';
import { SocialHub } from './social/SocialHub';
import { Product, ViewState, User } from '../types';

interface HomeProps {
    products?: Product[]; // Kept for compatibility but unused
    onAddToCart?: any;
    onProductClick?: any;
    favoriteIds?: any;
    onToggleFavorite?: any;
    onQuickView?: any;
    onCompare?: any;
    compareList?: any;
    onNavigate: (view: ViewState, data?: any) => void;
    onToggleMenu?: any;
}

// Home is now the Social Feed Container
export const Home: React.FC<HomeProps> = ({ onNavigate }) => {
    return (
        <SocialHub
            user={null} // SocialHub handles auth internally via store usually, or we can pass null
            onNavigate={onNavigate}
        />
    );
};
