import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import bcrypt from 'bcryptjs';

import { fileURLToPath } from 'url';
import uploadRoutes from './routes/uploadRoutes.js';
// import authRoutes from './routes/authRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import slideRoutes from './routes/slideRoutes.js';
import storyRoutes from './routes/storyRoutes.js';
import vlogRoutes from './routes/vlogRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import forumRoutes from './routes/forumRoutes.js';
import musicRoutes from './routes/musicRoutes.js';
import modelRoutes from './routes/modelRoutes.js';
import stolenRoutes from './routes/stolenRoutes.js';
import negotiationRoutes from './routes/negotiationRoutes.js';
import feedbackRoutes from './routes/feedbackRoutes.js';
import showcaseRoutes from './routes/showcaseRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import userRoutes from './routes/userRoutes.js';
import reelRoutes from './routes/reelRoutes.js';
import postRoutes from './routes/postRoutes.js';

// ... imports


import http from 'http';
import { initSync } from './socket.js';
import messageRoutes from './routes/messageRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Import Models to ensure registration
import './models/User.js';
import './models/Post.js'; // Registers 'SocialPost'
import './models/Order.js';
import './models/Message.js';

const __filename = fileURLToPath(import.meta.url);

dotenv.config();

const app = express();
const server = http.createServer(app); // Create HTTP server
const io = initSync(server); // Initialize Socket.io

const PORT = process.env.PORT || 5000;

// --- VERİTABANI BAĞLANTISI ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://umithief:14531453@motovibe.mslnxhq.mongodb.net/?appName=motovibe';

if (MONGO_URI.includes('14531453')) {
    console.warn('⚠️ UYARI: MongoDB bağlantı adresindeki <password> alanını değiştirmediniz.');
}

// Multer (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors({
    origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'https://motovibe.vercel.app', 'https://motovibe-frontend.onrender.com'], // Allow frontend
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH', 'HEAD'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Uploads klasörünü dışarıya aç (Resimlere erişim için)
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- MONGODB MODELS ---

// User Model moved to backend/models/User.js
// SocialPost Model moved to backend/models/Post.js

const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: String,
    image: String,
    images: [String],
    rating: { type: Number, default: 0 },
    features: [String],
    stock: { type: Number, default: 10 },
    isNegotiable: { type: Boolean, default: false }
}, { versionKey: false });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

// Order model moved to backend/models/Order.js

const slideSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: String,
    cta: { type: String, default: 'İNCELE' },
    action: { type: String, default: 'shop' },
    type: { type: String, default: 'image' },
    videoUrl: String
}, { versionKey: false });

const Slide = mongoose.models.Slide || mongoose.model('Slide', slideSchema);

const storySchema = new mongoose.Schema({
    label: { type: String, required: true },
    image: { type: String, required: true },
    color: { type: String, default: 'border-gray-500' },
    link: String
}, { versionKey: false });
const Story = mongoose.models.Story || mongoose.model('Story', storySchema);

const visitorSchema = new mongoose.Schema({
    date: { type: String, required: true },
    count: { type: Number, default: 0 }
}, { versionKey: false });
const Visitor = mongoose.models.Visitor || mongoose.model('Visitor', visitorSchema);

const analyticsSchema = new mongoose.Schema({
    type: { type: String, required: true },
    userId: String,
    userName: String,
    productId: Number,
    productName: String,
    duration: Number,
    timestamp: { type: Number, default: Date.now },
    date: { type: String, default: () => new Date().toLocaleDateString('tr-TR') }
}, { versionKey: false });
const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    image: { type: String, required: true },
    desc: String,
    count: String,
    className: String
}, { versionKey: false });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

const routeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    image: String,
    difficulty: String,
    distance: String,
    duration: String,
    location: String,
    bestSeason: String,
    tags: [String]
}, { versionKey: false });

const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);

const forumCommentSchema = new mongoose.Schema({
    _id: String,
    authorId: String,
    authorName: String,
    content: String,
    date: String,
    likes: { type: Number, default: 0 }
}, { versionKey: false });

const forumTopicSchema = new mongoose.Schema({
    _id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
    authorId: String,
    authorName: String,
    title: String,
    content: String,
    category: String,
    date: String,
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    comments: [forumCommentSchema],
    tags: [String]
}, { versionKey: false });

const ForumTopic = mongoose.models.ForumTopic || mongoose.model('ForumTopic', forumTopicSchema);

const musicSchema = new mongoose.Schema({
    title: String,
    artist: String,
    url: String,
    addedAt: String
}, { versionKey: false });

const Music = mongoose.models.Music || mongoose.model('Music', musicSchema);

const negotiationSchema = new mongoose.Schema({
    productId: Number,
    productName: String,
    productImage: String,
    originalPrice: Number,
    offerPrice: Number,
    userId: String,
    userName: String,
    status: { type: String, default: 'pending' },
    date: { type: String, default: () => new Date().toLocaleDateString('tr-TR') }
}, { versionKey: false });

const Negotiation = mongoose.models.Negotiation || mongoose.model('Negotiation', negotiationSchema);

const stolenItemSchema = new mongoose.Schema({
    serialNumber: { type: String, required: true },
    brand: String,
    model: String,
    category: String,
    dateStolen: String,
    city: String,
    contactInfo: String,
    description: String,
    status: { type: String, default: 'stolen' },
    dateReported: { type: String, default: () => new Date().toLocaleDateString('tr-TR') },
    image: String
}, { versionKey: false });

const StolenItem = mongoose.models.StolenItem || mongoose.model('StolenItem', stolenItemSchema);

const vlogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: String,
    locationName: String,
    coordinates: { lat: Number, lng: Number },
    videoUrl: { type: String, required: true },
    thumbnail: String,
    views: { type: String, default: '0' },
    productsUsed: [Number]
}, { versionKey: false });

const MotoVlog = mongoose.models.MotoVlog || mongoose.model('MotoVlog', vlogSchema);

const servicePointSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: String,
    categoryLabel: String,
    description: String,
    address: String,
    city: String,
    phone: String,
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    image: String,
    coordinates: { lat: Number, lng: Number },
    brands: [String]
}, { versionKey: false });
const ServicePoint = mongoose.models.ServicePoint || mongoose.model('ServicePoint', servicePointSchema);

const model3dSchema = new mongoose.Schema({
    name: { type: String, required: true },
    url: { type: String, required: true },
    poster: { type: String, required: true },
    category: String
}, { versionKey: false });

const Model3D = mongoose.models.Model3D || mongoose.model('Model3D', model3dSchema);

const feedbackSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    type: String,
    rating: Number,
    message: String,
    date: String,
    status: { type: String, default: 'new' }
}, { versionKey: false });

const Feedback = mongoose.models.Feedback || mongoose.model('Feedback', feedbackSchema);

const meetupEventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    type: String, // 'night-ride' | 'coffee' | 'track-day' | 'offroad'
    date: String,
    time: String,
    location: String,
    coordinates: { lat: Number, lng: Number },
    organizer: String,
    attendees: { type: Number, default: 0 },
    image: String,
    description: String
}, { versionKey: false });

const MeetupEvent = mongoose.models.MeetupEvent || mongoose.model('MeetupEvent', meetupEventSchema);

const showcaseProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    category: String,
    image: String,
    images: [String],
    rating: { type: Number, default: 0 },
    features: [String],
    stock: { type: Number, default: 0 },
    isNegotiable: { type: Boolean, default: false }
}, { versionKey: false });

const ShowcaseProduct = mongoose.models.ShowcaseProduct || mongoose.model('ShowcaseProduct', showcaseProductSchema);


// --- DATA SEEDING ---
const seedDatabase = async () => {
    try {
        const catCount = await Category.countDocuments();
        if (catCount === 0) {
            console.log('📦 Kategoriler veritabanına ekleniyor...');
            await Category.insertMany([
                { name: 'KASKLAR', type: 'Kask', image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop', desc: 'Maksimum Güvenlik', count: '142 Model', className: 'col-span-2 row-span-2' },
                { name: 'MONTLAR', type: 'Mont', image: 'https://images.unsplash.com/photo-1559582930-bb01987cf4dd?q=80&w=800&auto=format&fit=crop', desc: '4 Mevsim Koruma', count: '85 Model', className: 'col-span-2 row-span-1' },
                { name: 'ELDİVENLER', type: 'Eldiven', image: 'https://images.unsplash.com/photo-1555481771-16417c6f656c?q=80&w=800&auto=format&fit=crop', desc: 'Hassas Kontrol', count: '64 Model', className: 'col-span-1 row-span-1' },
                { name: 'BOTLAR', type: 'Bot', image: 'https://images.unsplash.com/photo-1555813456-96e25216239e?q=80&w=800&auto=format&fit=crop', desc: 'Sağlam Adımlar', count: '32 Model', className: 'col-span-1 row-span-1' },
                { name: 'EKİPMAN', type: 'Koruma', image: 'https://images.unsplash.com/photo-1584556966052-c229e215e03f?q=80&w=800&auto=format&fit=crop', desc: 'Zırh & Koruma', count: '95 Parça', className: 'col-span-1 md:col-span-2 row-span-1' },
                { name: 'İNTERKOM', type: 'İnterkom', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop', desc: 'İletişim', count: '12 Model', className: 'col-span-1 md:col-span-2 row-span-1' }
            ]);
        }

        const slideCount = await Slide.countDocuments();
        if (slideCount === 0) {
            console.log('📦 Slider görselleri veritabanına ekleniyor...');
            await Slide.insertMany([
                { id: 1, type: 'video', videoUrl: 'https://videos.pexels.com/video-files/5927870/5927870-uhd_2560_1440_30fps.mp4', image: "https://images.unsplash.com/photo-1609630875171-b1321377ee65?q=80&w=1920&auto=format&fit=crop", title: "RIDE THE FUTURE", subtitle: "YAPAY ZEKA DESTEKLİ EKİPMAN SEÇİMİ İLE TANIŞIN.", cta: "ALIŞVERİŞE BAŞLA", action: 'shop' },
                { id: 2, type: 'image', image: "https://images.unsplash.com/photo-1558981408-db0ecd8a1ee4?q=80&w=1920&auto=format&fit=crop", title: "CARBON & SPEED", subtitle: "PROFESYONELLER İÇİN GELİŞTİRİLMİŞ KASK KOLEKSİYONU.", cta: "KASKLARI GÖR", action: 'shop' },
                { id: 3, type: 'image', image: "https://images.unsplash.com/photo-1547053265-a0c602077e65?q=80&w=1920&auto=format&fit=crop", title: "OFFROAD SPIRIT", subtitle: "SINIRLARI ZORLAYAN MACERALAR İÇİN HAZIR OL.", cta: "KEŞFET", action: 'shop' }
            ]);
        }

        const routeCount = await Route.countDocuments();
        if (routeCount === 0) {
            console.log('📦 Rotalar veritabanına ekleniyor...');
            await Route.insertMany([
                {
                    title: 'Trans Toros Geçişi',
                    description: 'Akdeniz\'in zirvelerinde virajlı ve manzaralı bir sürüş.',
                    image: 'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=1200',
                    difficulty: 'Zor',
                    distance: '320 km',
                    estimatedTime: '6 Saat',
                    location: 'Antalya',
                    bestSeason: 'İlkbahar',
                    tags: ['Dağ', 'Viraj'],
                    coordinates: [
                        { lat: 36.8841, lng: 30.7056 },
                        { lat: 37.0000, lng: 30.8000 },
                        { lat: 37.1500, lng: 31.0000 },
                        { lat: 37.3000, lng: 31.2000 },
                        { lat: 37.5000, lng: 31.4000 }
                    ]
                }
            ]);
        } else {
            // FIX: Ensure Trans Toros has coordinates if they are missing (Migration)
            await Route.updateOne(
                { title: 'Trans Toros Geçişi' },
                {
                    $set: {
                        coordinates: [
                            { lat: 36.8841, lng: 30.7056 },
                            { lat: 37.0000, lng: 30.8000 },
                            { lat: 37.1500, lng: 31.0000 },
                            { lat: 37.3000, lng: 31.2000 },
                            { lat: 37.5000, lng: 31.4000 }
                        ]
                    }
                }
            );
        }

        const prodCount = await Product.countDocuments();
        if (prodCount === 0) {
            console.log('📦 Ürünler veritabanına ekleniyor...');
            await Product.insertMany([
                { name: "AeroSpeed Carbon Pro Kask", description: "Yüksek hız aerodinamiği için tasarlanmış ultra hafif karbon fiber kask. Maksimum görüş açısı ve gelişmiş havalandırma sistemi.", price: 8500, category: "Kask", image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop", images: ["https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop"], rating: 4.8, features: ["Karbon Fiber", "Pinlock"], stock: 15, isNegotiable: true },
                { name: "Urban Rider Deri Mont", description: "Şehir içi sürüşler için şık ve korumalı deri mont. D3O korumalar ile maksimum güvenlik, vintage görünüm.", price: 5200, category: "Mont", image: "https://images.unsplash.com/photo-1559582930-bb01987cf4dd?q=80&w=800&auto=format&fit=crop", images: ["https://images.unsplash.com/photo-1559582930-bb01987cf4dd?q=80&w=800&auto=format&fit=crop"], rating: 4.6, features: ["%100 Deri", "D3O"], stock: 8, isNegotiable: true },
                { name: "ProVision İnterkom", description: "Grup sürüşleri için kristal netliğinde ses sağlayan, uzun menzilli Bluetooth interkom.", price: 2900, category: "İnterkom", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop", images: ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop"], rating: 4.7, features: ["1.2km Menzil", "Su Geçirmez"], stock: 30, isNegotiable: false }
            ]);
        }

        const forumCount = await ForumTopic.countDocuments();
        if (forumCount === 0) {
            console.log('📦 Forum konuları veritabanına ekleniyor...');
            await ForumTopic.insertMany([
                {
                    // Remove 'id' field, rely on _id default
                    authorId: 'admin-001',
                    authorName: 'MotoVibe Admin',
                    title: 'MotoVibe Topluluğuna Hoş Geldiniz!',
                    content: 'Merhaba arkadaşlar, burası motosiklet tutkunlarının buluşma noktası. Deneyimlerinizi paylaşabilir, teknik sorular sorabilir veya gezi planlarınızı duyurabilirsiniz. Saygı çerçevesinde keyifli forumlar!',
                    category: 'Genel',
                    date: new Date().toLocaleDateString('tr-TR'),
                    likes: 42,
                    views: 1250,
                    comments: [],
                    tags: ['Duyuru', 'Kurallar']
                }
            ]);
        }

        // Social seeding removed

        const showcaseCount = await ShowcaseProduct.countDocuments();
        if (showcaseCount === 0) {
            console.log('📦 Vitrin ürünleri veritabanına ekleniyor...');
            await ShowcaseProduct.insertMany([
                {
                    name: 'CARBON X-1',
                    description: 'Saf karbon fiber yapı ile aerodinamik mükemmellik. Pistler için tasarlandı, sokaklar için geliştirildi.',
                    price: 12500,
                    category: 'Kask',
                    image: 'https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?auto=format&fit=crop&q=80&w=800',
                    images: [],
                    rating: 5,
                    features: ['Ultra Hafif Karbon Kabuk', 'Acil Durum Çıkarma Sistemi', 'MaxVision Pinlock', 'Rüzgar Tüneli Testli'],
                    stock: 3
                },
                {
                    name: 'VENOM 400',
                    description: 'Taktiksel üstünlükle benzersiz koruma. Venom 400 mont, askeri sınıf malzemeleri günlük sürüşünüze getiriyor.',
                    price: 8900,
                    category: 'Mont',
                    image: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800',
                    images: [],
                    rating: 4.8,
                    features: ['Cordura® Yapı', 'CE Seviye 2 Koruma', 'Su Geçirmez Membran', 'Sıvı Takviyesi Hazır'],
                    stock: 12
                },
                {
                    name: 'TITAN BOOTS',
                    description: 'Yerçekimi kadar sağlam bir denge. Titan botları, ekstrem koşullar için nihai tutuş ve bilek desteği sağlar.',
                    price: 6750,
                    category: 'Bot',
                    image: 'https://images.unsplash.com/photo-1609630875171-b132137746be?auto=format&fit=crop&q=80&w=800',
                    images: [],
                    rating: 4.9,
                    features: ['Gore-Tex Ekstrem', 'Vibram Taban', 'Kompozit Burun', 'Ayarlanabilir Toka Sistemi'],
                    stock: 8
                }
            ]);
        }

        // Seed Admin User (Always Ensure Correct Credentials)
        console.log('🛡️ Admin kullanıcısı (111@111) doğrulanıyor...');
        const User = mongoose.model('User');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('111', salt);

        await User.findOneAndUpdate(
            { email: '111@111' },
            {
                name: 'MotoVibe Admin',
                email: '111@111',
                password: hashedPassword,
                joinDate: '01.01.2024',
                isAdmin: true,
                points: 9999,
                rank: 'Yol Kaptanı',
                username: 'admin',
                bio: 'Sistemin kurucusu ve baş yöneticisi.'
            },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        console.log('✅ Admin hazır: 111@111 / 111');

    } catch (error) {
        console.error('Veri tohumlama hatası:', error);
    }
};

// --- ROUTES ---

// 0. Upload Route
app.use('/api/upload', uploadRoutes);


// authRoutes removed in favor of userRoutes
// app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/routes', routeRoutes);
app.use('/api/slides', slideRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/vlogs', vlogRoutes);
app.use('/api/vlogs', vlogRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes); // Using postRoutes as requested
app.use('/api/social', postRoutes); // Map legacy route to new logic
app.use('/api/reels', reelRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/showcase', showcaseRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use('/api/music', musicRoutes);
app.use('/api/models', modelRoutes);
app.use('/api/stolen-items', stolenRoutes);
app.use('/api/negotiations', negotiationRoutes);
app.use('/api/feedback', feedbackRoutes);

// --- GLOBAL ERROR HANDLER ---
app.use((err, req, res, next) => {
    console.error('🔥 HATA (Global Handler):', err);

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            status: 'error',
            message: Object.values(err.errors).map(val => val.message).join(', ')
        });
    }

    // Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return res.status(400).json({
            status: 'error',
            message: `${field} zaten kullanımda.`
        });
    }

    // JWT Error
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            status: 'error',
            message: 'Geçersiz token. Lütfen tekrar giriş yapın.'
        });
    }

    const statusCode = err.statusCode || 500;
    res.status(statusCode).json({
        status: 'error',
        message: err.message || 'Sunucu Hatası',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// --- FRONTEND STATIK DOSYALARINI SERVIS ET (PROD) ---
const frontendPath = path.join(__dirname, '../dist');
if (process.env.NODE_ENV === 'production' || process.env.SERVE_FRONTEND === 'true') {
    app.use(express.static(frontendPath));

    app.get(/(.*)/, (req, res) => {
        if (req.path.startsWith('/api')) { // API isteklerini engelleme
            return res.status(404).json({ message: 'API route found but method not handled or path wrong' });
        }
        res.sendFile(path.resolve(frontendPath, 'index.html'));
    });
} else {
    // Development modunda bilgilendirme
    app.get('/', (req, res) => {
        res.send('🚀 MotoVibe Backend (Dev) Çalışıyor! Frontend için Vite sunucusunu kullanın.');
    });
}

// --- START SERVER ---
if (process.argv[1] === __filename) {
    mongoose.connect(MONGO_URI)
        .then(async () => {
            console.log('✅ MongoDB bağlantısı başarılı');

            await seedDatabase();
            server.listen(PORT, () => {
                console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`);
                console.log(`📡 CORS Origin: Allowed`);
                console.log(`📂 Uploads: Local & Supabase enabled`);
            });
        })
        .catch(err => {
            console.error('❌ MongoDB bağlantı hatası:', err.message);
            process.exit(1);
        });
}

export default app;
