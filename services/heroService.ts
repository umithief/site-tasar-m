import { Slide } from '../types';

const STORAGE_KEY = 'motovibe_hero_slides';

const MOCK_SLIDES: Slide[] = [
    {
        _id: '1',
        title: "ŞEHRİN HAKİMİ OL",
        subtitle: "En iyi rotaları keşfet, grubunu kur, asfalta izini bırak.",
        image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=1000&auto=format&fit=crop",
        buttonText: "SÜRÜŞE BAŞLA",
        buttonLink: "/ride-mode",
        order: 1,
        isActive: true
    },
    {
        _id: '2',
        title: "SINIRLARI ZORLA",
        subtitle: "Telemetri verilerinle performansını analiz et, virajların ustası ol.",
        image: "https://images.unsplash.com/photo-1558980664-2506fca6bfc2?q=80&w=1000&auto=format&fit=crop",
        buttonText: "VERİLERİ GÖR",
        buttonLink: "/mototool",
        order: 2,
        isActive: true
    }
];

export const heroService = {
    getSlides: async (): Promise<Slide[]> => {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_SLIDES));
            return MOCK_SLIDES;
        }
        return JSON.parse(stored).sort((a: Slide, b: Slide) => a.order - b.order);
    },

    getSlide: async (id: string): Promise<Slide | undefined> => {
        const slides = await heroService.getSlides();
        return slides.find(s => s._id === id);
    },

    addSlide: async (slide: Omit<Slide, '_id'>): Promise<Slide> => {
        const slides = await heroService.getSlides();
        const newSlide = {
            ...slide,
            _id: Date.now().toString(),
            order: slides.length + 1
        };
        const updated = [...slides, newSlide];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return newSlide;
    },

    updateSlide: async (id: string, updates: Partial<Slide>): Promise<Slide> => {
        const slides = await heroService.getSlides();
        const index = slides.findIndex(s => s._id === id);
        if (index === -1) throw new Error('Slide not found');

        const updated = { ...slides[index], ...updates };
        slides[index] = updated;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(slides));
        return updated;
    },

    deleteSlide: async (id: string): Promise<void> => {
        const slides = await heroService.getSlides();
        const filtered = slides.filter(s => s._id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    },

    reorderSlides: async (orderedIds: string[]): Promise<void> => {
        const slides = await heroService.getSlides();
        const updated = orderedIds.map((id, index) => {
            const slide = slides.find(s => s._id === id);
            if (slide) {
                return { ...slide, order: index + 1 };
            }
            return slide;
        }).filter(Boolean) as Slide[];

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
};
