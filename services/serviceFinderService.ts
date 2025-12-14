
import { ServicePoint } from '../types';
import { delay } from './db';

const MOCK_SERVICES: ServicePoint[] = [
    {
        id: 'srv-1',
        name: 'MotoArt Maslak',
        type: 'private',
        categoryLabel: 'Özel Servis & Tuning',
        description: 'Tüm Japon ve İtalyan markaları için periyodik bakım, ağır bakım ve performance tuning hizmetleri.',
        address: 'Maslak Oto Sanayi 2. Kısım, Sarıyer/İstanbul',
        city: 'İstanbul',
        phone: '+90 212 555 0101',
        rating: 4.8,
        reviewCount: 124,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1596706900226-0e318df62293?q=80&w=800&auto=format&fit=crop',
        coordinates: { lat: 41.1122, lng: 29.0234 },
        brands: ['Yamaha', 'Honda', 'Kawasaki', 'Ducati']
    },
    {
        id: 'srv-2',
        name: 'Kadıköy Motor',
        type: 'official',
        categoryLabel: 'Yetkili Servis',
        description: 'Yamaha ve Honda yetkili servisi. Orijinal yedek parça ve garantili işçilik.',
        address: 'Hasanpaşa Mah. Fahrettin Kerim Gökay Cad. No:45, Kadıköy',
        city: 'İstanbul',
        phone: '+90 216 444 0202',
        rating: 4.5,
        reviewCount: 310,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=800&auto=format&fit=crop',
        coordinates: { lat: 40.9950, lng: 29.0400 },
        brands: ['Yamaha', 'Honda']
    },
    {
        id: 'srv-3',
        name: 'Lastik Park Bornova',
        type: 'tire',
        categoryLabel: 'Lastik & Balans',
        description: 'Motosiklet lastik değişimi, balans ve nitrojen dolumu. Michelin, Pirelli, Metzeler yetkili satıcısı.',
        address: 'Kazımdirik, 372. Sk. No:12, Bornova/İzmir',
        city: 'İzmir',
        phone: '+90 232 333 0303',
        rating: 4.9,
        reviewCount: 85,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1581321825690-919539c39733?q=80&w=800&auto=format&fit=crop',
        coordinates: { lat: 38.4622, lng: 27.2189 },
        brands: ['Michelin', 'Pirelli', 'Metzeler']
    },
    {
        id: 'srv-4',
        name: 'Ankara Custom Chopper',
        type: 'custom',
        categoryLabel: 'Custom & Boya',
        description: 'Harley-Davidson ve Chopper tarzı motorlar için özel tasarım, boya ve krom kaplama işlemleri.',
        address: 'İvedik OSB, 1354. Cad. No:88, Yenimahalle/Ankara',
        city: 'Ankara',
        phone: '+90 312 222 0404',
        rating: 4.7,
        reviewCount: 56,
        isVerified: false,
        image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c3d?q=80&w=800&auto=format&fit=crop',
        coordinates: { lat: 39.9800, lng: 32.7500 },
        brands: ['Harley-Davidson', 'Triumph']
    },
    {
        id: 'srv-5',
        name: 'MotoYedek Sirkeci',
        type: 'parts',
        categoryLabel: 'Yedek Parça',
        description: 'Her marka motosiklet için sıfır ve çıkma yedek parça temini. Kargo ile gönderim.',
        address: 'Hobyar, Mimar Vedat Sk. No:5, Fatih/İstanbul',
        city: 'İstanbul',
        phone: '+90 212 511 0505',
        rating: 4.2,
        reviewCount: 18,
        isVerified: false,
        image: 'https://images.unsplash.com/photo-1532649538666-93838aeef42e?q=80&w=800&auto=format&fit=crop',
        coordinates: { lat: 41.0140, lng: 28.9750 },
        brands: ['Universal']
    },
    {
        id: 'srv-6',
        name: 'TechMoto Antalya',
        type: 'private',
        categoryLabel: 'Özel Servis',
        description: 'Antalya bölgesinde güvenilir tamir ve bakım hizmeti. Yol yardım mevcuttur.',
        address: 'Kızılarık, Gazi Blv. No:120, Muratpaşa/Antalya',
        city: 'Antalya',
        phone: '+90 242 666 0606',
        rating: 4.6,
        reviewCount: 42,
        isVerified: true,
        image: 'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?q=80&w=800&auto=format&fit=crop',
        coordinates: { lat: 36.9050, lng: 30.7100 },
        brands: ['Honda', 'Suzuki', 'KTM']
    }
];

export const serviceFinderService = {
    async getServices(): Promise<ServicePoint[]> {
        await delay(500); // Simulate API latency
        return MOCK_SERVICES;
    }
};
