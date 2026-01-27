import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Route from '../models/Route.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, '../../.env') });

const seedRoutes = async () => {
    try {
        console.log('🔌 Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected.');

        console.log('🗑️ Clearing existing routes...');
        await Route.deleteMany({});

        console.log('🌱 Seeding new routes with local assets...');
        const sampleRoutes = [
            {
                title: 'Şile Sahil Yolu',
                description: 'Mavi ve yeşilin buluştuğu bu sahil yolunda rüzgarla dans edin. Keskin virajlar ve uzun düzlüklerin mükemmel dengesi. Asfalt kalitesi yüksek, manzara paha biçilemez.',
                distance: '145 km',
                estimatedTime: '2h 15m',
                difficulty: 'Orta',
                location: 'Şile, İstanbul',
                image: '/assets/routes/coastal.png',
                stats: { curves: 75, roadQuality: 90, traffic: 40 },
                tags: ['Sahil', 'Manzara', 'Hızlı', 'Virajlı'],
                riderCount: 1243,
                bestSeason: 'İlkbahar, Yaz',
                difficultyMetrics: { technical: 3, scenery: 5, speed: 4 },
                terrain: ['Asfalt'],
                coordinates: [
                    { lat: 41.1744, lng: 29.6116 },
                    { lat: 41.1780, lng: 29.6200 },
                    { lat: 41.1850, lng: 29.6300 },
                    { lat: 41.1900, lng: 29.6400 }
                ]
            },
            {
                title: 'Uludağ Zirve Tırmanışı',
                description: 'Bulutların üzerine çıkmaya hazır mısın? Keskin hairpin virajları ve serin dağ havasıyla gerçek bir sürüş testi. Teknik sürüşü sevenler için efsanevi bir rota.',
                distance: '42 km',
                estimatedTime: '1h 10m',
                difficulty: 'Zor',
                location: 'Bursa',
                image: '/assets/routes/mountain.png',
                stats: { curves: 95, roadQuality: 85, traffic: 30 },
                tags: ['Dağ', 'Teknik', 'Viraj', 'Soğuk'],
                riderCount: 856,
                bestSeason: 'Yaz, Sonbahar',
                difficultyMetrics: { technical: 5, scenery: 5, speed: 2 },
                terrain: ['Asfalt'],
                coordinates: [
                    { lat: 40.1828, lng: 29.0669 },
                    { lat: 40.1500, lng: 29.0800 },
                    { lat: 40.1200, lng: 29.1000 },
                    { lat: 40.0900, lng: 29.1300 }
                ]
            },
            {
                title: 'Belgrad Ormanı Keşfi',
                description: 'Şehrin gürültüsünden kaçıp doğanın kalbine yolculuk. Ağaç tünelleri arasından geçen bu rota, huzurlu ve keyifli bir sürüş vadediyor.',
                distance: '25 km',
                estimatedTime: '45m',
                difficulty: 'Kolay',
                location: 'Sarıyer, İstanbul',
                image: '/assets/routes/forest.png',
                stats: { curves: 40, roadQuality: 70, traffic: 50 },
                tags: ['Orman', 'Doğa', 'Kısa Rota', 'Huzur'],
                riderCount: 2105,
                bestSeason: 'Sonbahar, İlkbahar',
                difficultyMetrics: { technical: 2, scenery: 4, speed: 3 },
                terrain: ['Asfalt', 'Stabilize'],
                coordinates: [
                    { lat: 41.1790, lng: 28.9800 },
                    { lat: 41.1900, lng: 28.9900 },
                    { lat: 41.2000, lng: 29.0000 }
                ]
            },
            {
                title: 'İstanbul Gece Hattı',
                description: 'Şehir uyurken asfalt senin. Köprü ışıkları, boş caddeler ve neon tabelalar eşliğinde siberpunk bir sürüş deneyimi. Fotoğrafçılar için eşsiz duraklar.',
                distance: '60 km',
                estimatedTime: '1h 30m',
                difficulty: 'Orta',
                location: 'İstanbul',
                image: '/assets/routes/city.png',
                stats: { curves: 30, roadQuality: 95, traffic: 20 },
                tags: ['Gece', 'Şehir', 'Fotoğraf', 'Cruise'],
                riderCount: 3420,
                bestSeason: 'Her Mevsim (Gece)',
                difficultyMetrics: { technical: 2, scenery: 5, speed: 4 },
                terrain: ['Asfalt'],
                coordinates: [
                    { lat: 41.0082, lng: 28.9784 },
                    { lat: 41.0400, lng: 29.0100 },
                    { lat: 41.0900, lng: 29.0500 }
                ]
            }
        ];

        await Route.insertMany(sampleRoutes);
        console.log('✨ Routes seeded successfully!');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding routes:', error);
        process.exit(1);
    }
};

seedRoutes();
