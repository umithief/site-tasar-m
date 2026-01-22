import React from 'react';
import { ViewState } from '../types';
import { ArrowRight } from 'lucide-react';
import { Button } from './ui/Button';

interface HeroProps {
    onNavigate: (view: ViewState) => void;
}

export const Hero: React.FC<HeroProps> = ({ onNavigate }) => {
    return (
        <section className="relative w-full h-screen min-h-[700px] bg-black overflow-hidden">

            {/* Static Background Image */}
            <div className="absolute inset-0">
                <img
                    src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=1920&auto=format&fit=crop"
                    alt="MotoVibe Hero"
                    className="w-full h-full object-cover"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto px-6 md:px-12">
                    <div className="max-w-2xl">
                        {/* Badge */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-12 h-[2px] bg-[#E2FF3B]" />
                            <span className="text-[#E2FF3B] text-sm font-bold tracking-widest uppercase">
                                Premium Koleksiyon
                            </span>
                        </div>

                        {/* Title */}
                        <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
                            MOTOSĠKLET<br />
                            TUTKUSU
                        </h1>

                        {/* Subtitle */}
                        <p className="text-lg text-gray-300 mb-8 max-w-lg">
                            Profesyonel ekipmanlar, güvenli sürüş deneyimi. Yalnızca motorunuza değil, hayallerinize de değer katın.
                        </p>

                        {/* CTA Button */}
                        <Button
                            onClick={() => onNavigate('shop')}
                            className="bg-[#E2FF3B] text-black hover:bg-white px-8 py-4 text-base font-bold"
                        >
                            ÜRÜNLERĠ KEŞFET
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
};
