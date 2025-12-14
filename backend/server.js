import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import * as Minio from 'minio';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// --- VERİTABANI BAĞLANTISI ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://umithief:14531453@motovibe.mslnxhq.mongodb.net/?appName=motovibe';

if (MONGO_URI.includes('14531453')) {
    console.warn('⚠️ UYARI: MongoDB bağlantı adresindeki <password> alanını değiştirmediniz.');
}

// --- MINIO YAPILANDIRMASI ---
const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'localhost';
const MINIO_PORT = parseInt(process.env.MINIO_PORT || '9000');
const MINIO_USE_SSL = process.env.MINIO_USE_SSL === 'true';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
const BUCKET_NAME = process.env.MINIO_BUCKET_NAME || 'motovibe-assets';

let minioClient;
try {
    minioClient = new Minio.Client({
        endPoint: MINIO_ENDPOINT,
        port: MINIO_PORT,
        useSSL: MINIO_USE_SSL,
        accessKey: MINIO_ACCESS_KEY,
        secretKey: MINIO_SECRET_KEY
    });
} catch (err) {
    console.warn('⚠️ MinIO Client başlatılamadı. MinIO bağımlılıklarının kurulu olduğundan emin olun.');
}

// Bucket Kontrolü ve Oluşturma
const initMinio = async () => {
    if (!minioClient) return;
    try {
        const exists = await minioClient.bucketExists(BUCKET_NAME);
        if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
            console.log(`✅ MinIO Bucket oluşturuldu: ${BUCKET_NAME}`);

            // Public Read Policy (Basitleştirilmiş)
            const policy = {
                Version: "2012-10-17",
                Statement: [
                    {
                        Effect: "Allow",
                        Principal: { AWS: ["*"] },
                        Action: ["s3:GetObject"],
                        Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
                    }
                ]
            };
            await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
        }
    } catch (err) {
        console.error('❌ MinIO Başlatma Hatası:', err);
    }
};

// Multer (Memory Storage)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
    res.send('🚀 MotoVibe Backend Çalışıyor! API adresleri /api ile başlar.');
});

// --- MONGODB MODELS ---

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    joinDate: { type: String, default: () => new Date().toLocaleDateString('tr-TR') },
    phone: String,
    address: String,
    points: { type: Number, default: 0 },
    rank: { type: String, default: 'Scooter Çırağı' }
});
const User = mongoose.models.User || mongoose.model('User', userSchema);

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
});
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    date: { type: String, default: () => new Date().toLocaleDateString('tr-TR') },
    status: { type: String, default: 'Hazırlanıyor' },
    total: Number,
    items: [{
        productId: String,
        name: String,
        price: Number,
        quantity: Number,
        image: String
    }]
});
const Order = mongoose.models.Order || mongoose.model('Order', orderSchema);

const slideSchema = new mongoose.Schema({
    image: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: String,
    cta: { type: String, default: 'İNCELE' },
    action: { type: String, default: 'shop' },
    type: { type: String, default: 'image' },
    videoUrl: String
});
const Slide = mongoose.models.Slide || mongoose.model('Slide', slideSchema);

const storySchema = new mongoose.Schema({
    label: { type: String, required: true },
    image: { type: String, required: true },
    color: { type: String, default: 'border-gray-500' },
    link: String
});
const Story = mongoose.models.Story || mongoose.model('Story', storySchema);

const visitorSchema = new mongoose.Schema({
    date: { type: String, required: true },
    count: { type: Number, default: 0 }
});
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
});
const Analytics = mongoose.models.Analytics || mongoose.model('Analytics', analyticsSchema);

const categorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, required: true },
    image: { type: String, required: true },
    desc: String,
    count: String,
    className: String
});
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
});
const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);

const forumCommentSchema = new mongoose.Schema({
    id: String,
    authorId: String,
    authorName: String,
    content: String,
    date: String,
    likes: { type: Number, default: 0 }
});

const forumTopicSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
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
});
const ForumTopic = mongoose.models.ForumTopic || mongoose.model('ForumTopic', forumTopicSchema);

const musicSchema = new mongoose.Schema({
    id: String,
    title: String,
    artist: String,
    url: String,
    addedAt: String
});
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
});
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
});
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
});
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
});
const ServicePoint = mongoose.models.ServicePoint || mongoose.model('ServicePoint', servicePointSchema);


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
                { title: 'Trans Toros Geçişi', description: 'Akdeniz\'in zirvelerinde virajlı ve manzaralı bir sürüş.', image: 'https://images.unsplash.com/photo-1605152276897-4f618f831968?q=80&w=1200', difficulty: 'Zor', distance: '320 km', duration: '6 Saat', location: 'Antalya', bestSeason: 'İlkbahar', tags: ['Dağ', 'Viraj'] }
            ]);
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
                    id: 'TOPIC-INIT-1',
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

    } catch (error) {
        console.error('Veri tohumlama hatası:', error);
    }
};

// --- ROUTES ---

// 0. Upload Route (MinIO)
app.post('/api/upload', upload.single('file'), async (req, res) => {
    if (!minioClient) return res.status(500).json({ message: 'MinIO yapılandırılmadı.' });
    if (!req.file) return res.status(400).json({ message: 'Dosya bulunamadı.' });

    try {
        const fileName = `${Date.now()}-${req.file.originalname}`;
        const metaData = { 'Content-Type': req.file.mimetype };

        await minioClient.putObject(BUCKET_NAME, fileName, req.file.buffer, req.file.size, metaData);

        // URL oluştur (Eğer MinIO SSL kullanmıyorsa http, kullanıyorsa https)
        const protocol = MINIO_USE_SSL ? 'https' : 'http';
        const fileUrl = `${protocol}://${MINIO_ENDPOINT}:${MINIO_PORT}/${BUCKET_NAME}/${fileName}`;

        res.json({ url: fileUrl });
    } catch (error) {
        console.error('MinIO Upload Error:', error);
        res.status(500).json({ message: 'Dosya yüklenirken hata oluştu.' });
    }
});

// 1. Auth Routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Bu e-posta zaten kayıtlı.' });
        const newUser = new User({ name, email, password });
        if (newUser) await newUser.save();
        const userObj = newUser.toObject();
        delete userObj.password;
        res.status(201).json(userObj);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// User Profile Update (Missing Route Fix)
app.put('/api/auth/profile', async (req, res) => {
    try {
        // Basic implementation for profile updates
        // In a real app, you would use req.user.id from middleware
        // Here we assume the client sends the email or id to identify the user
        const { id, email, ...updates } = req.body;
        if (!id && !email) {
            return res.status(400).json({ message: 'User ID or Email required' });
        }

        const filter = id ? { _id: id } : { email };
        const updatedUser = await User.findOneAndUpdate(filter, updates, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userObj = updatedUser.toObject();
        delete userObj.password;
        res.json(userObj);
    } catch (error) {
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// ADMIN LOGIN (BACKDOOR + DB CHECK)
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. BACKDOOR: Acil durum admin girişi (Veritabanı boşsa bile çalışır)
        if (email === 'admin@motovibe.tr' && password === 'admin123') {
            return res.json({
                id: 'admin-001',
                name: 'MotoVibe Admin',
                email: 'admin@motovibe.tr',
                isAdmin: true,
                joinDate: '01.01.2024'
            });
        }

        // 2. DB CHECK: Normal kullanıcı kontrolü
        const user = await User.findOne({ email, password });
        if (!user) return res.status(400).json({ message: 'Hatalı e-posta veya şifre.' });

        const userObj = user.toObject();
        delete userObj.password;
        res.json(userObj);
    } catch (error) {
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// 2. Product Routes
app.get('/api/products', async (req, res) => {
    try {
        const p = await Product.find().sort({ _id: -1 });
        res.json(p);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/products', async (req, res) => {
    try {
        const p = new Product(req.body);
        if (p) await p.save();
        res.status(201).json(p);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.put('/api/products/:id', async (req, res) => {
    try {
        const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(p);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 3. Order Routes
app.get('/api/orders', async (req, res) => {
    try {
        const { userId } = req.query;
        const q = userId ? { userId } : {};
        const o = await Order.find(q).sort({ date: -1 });
        res.json(o);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/orders', async (req, res) => {
    try {
        const o = new Order(req.body);
        if (o) await o.save();
        res.status(201).json(o);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.put('/api/orders/:id', async (req, res) => {
    try {
        const o = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(o);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 4. Slide Routes
app.get('/api/slides', async (req, res) => {
    try {
        const s = await Slide.find(); res.json(s);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/slides', async (req, res) => {
    try {
        const s = new Slide(req.body);
        if (s) await s.save();
        res.status(201).json(s);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.put('/api/slides/:id', async (req, res) => {
    try {
        const s = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(s);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.delete('/api/slides/:id', async (req, res) => {
    try {
        await Slide.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 5. Story Routes
app.get('/api/stories', async (req, res) => {
    try {
        const s = await Story.find(); res.json(s);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/stories', async (req, res) => {
    try {
        const s = new Story(req.body);
        if (s) await s.save();
        res.status(201).json(s);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.put('/api/stories/:id', async (req, res) => {
    try {
        const s = await Story.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(s);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.delete('/api/stories/:id', async (req, res) => {
    try {
        await Story.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 6. Stats Routes
app.get('/api/stats', async (req, res) => {
    try {
        const all = await Visitor.find();
        const total = all.reduce((s, v) => s + v.count, 0);
        res.json({ totalVisits: total, todayVisits: 0 });
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/stats/visit', async (req, res) => {
    try {
        const today = new Date().toLocaleDateString('tr-TR');
        let v = await Visitor.findOne({ date: today });
        if (v) {
            v.count++;
        } else {
            v = new Visitor({ date: today, count: 1 });
        }

        // Defensive check: Ensure v is valid before saving
        if (v && typeof v.save === 'function') {
            await v.save();
        }

        res.json({ success: true });
    } catch (e) {
        console.error("Visit Stats Error:", e);
        res.status(500).json({ message: e.message });
    }
});

// 7. Analytics Routes
app.get('/api/analytics/dashboard', async (req, res) => {
    try {
        const { range } = req.query;
        const now = Date.now();
        let startTime = 0;
        if (range === '24h') startTime = now - (24 * 60 * 60 * 1000);
        else if (range === '7d') startTime = now - (7 * 24 * 60 * 60 * 1000);
        else if (range === '30d') startTime = now - (30 * 24 * 60 * 60 * 1000);

        const events = await Analytics.find({ timestamp: { $gte: startTime } });

        const productViews = {};
        const productAdds = {};
        let totalProductViews = 0;
        let totalAddToCart = 0;
        let totalCheckouts = 0;
        let totalDuration = 0;
        let durationCount = 0;

        res.json({
            totalProductViews, totalAddToCart, totalCheckouts, avgSessionDuration: 0, topViewedProducts: [], topAddedProducts: [], activityTimeline: []
        });
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/analytics/event', async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ message: 'No body provided' });
        }
        const e = new Analytics(req.body);
        // Defensive check
        if (e && typeof e.save === 'function') {
            await e.save();
        }
        res.json({ success: true });
    } catch (e) {
        console.error("Analytics Event Error:", e);
        res.status(500).json({ message: e.message });
    }
});

// 8. Category Routes
app.get('/api/categories', async (req, res) => {
    try {
        const c = await Category.find(); res.json(c);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/categories', async (req, res) => {
    try {
        const c = new Category(req.body);
        if (c) await c.save();
        res.status(201).json(c);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.put('/api/categories/:id', async (req, res) => {
    try {
        const c = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(c);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.delete('/api/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 9. Route Routes
app.get('/api/routes', async (req, res) => {
    try {
        const r = await Route.find(); res.json(r);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/routes', async (req, res) => {
    try {
        const r = new Route(req.body);
        if (r) await r.save();
        res.status(201).json(r);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.put('/api/routes/:id', async (req, res) => {
    try {
        const r = await Route.findByIdAndUpdate(req.params.id, req.body, { new: true }); res.json(r);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.delete('/api/routes/:id', async (req, res) => {
    try {
        await Route.findByIdAndDelete(req.params.id); res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 10. Music Routes
app.get('/api/music', async (req, res) => {
    try {
        const m = await Music.find(); res.json(m);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/music', async (req, res) => {
    try {
        const m = new Music(req.body);
        if (m) await m.save();
        res.status(201).json(m);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.put('/api/music/:id', async (req, res) => {
    try {
        const m = await Music.findOneAndUpdate({ id: req.params.id }, req.body, { new: true }); res.json(m);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.delete('/api/music/:id', async (req, res) => {
    try {
        await Music.findOneAndDelete({ id: req.params.id }); res.json({ message: 'Deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});


// 11. Forum Routes
app.get('/api/forum/topics', async (req, res) => {
    try {
        const topics = await ForumTopic.find().sort({ _id: -1 });
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 12. Negotiation Routes
app.get('/api/negotiations', async (req, res) => {
    try {
        const offers = await Negotiation.find().sort({ _id: -1 });
        res.json(offers);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/negotiations', async (req, res) => {
    try {
        const n = new Negotiation(req.body);
        if (n) await n.save();
        res.status(201).json(n);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.put('/api/negotiations/:id', async (req, res) => {
    try {
        const n = await Negotiation.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
        res.json(n);
    } catch (e) { res.status(500).json({ message: e.message }); }
});


// 13. Stolen Items Routes
app.get('/api/stolen', async (req, res) => {
    try {
        const items = await StolenItem.find().sort({ _id: -1 });
        res.json(items);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/stolen', async (req, res) => {
    try {
        const item = new StolenItem(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 14. Vlog Routes
app.get('/api/vlogs', async (req, res) => {
    try {
        const vlogs = await MotoVlog.find().sort({ _id: -1 });
        res.json(vlogs);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/vlogs', async (req, res) => {
    try {
        const vlog = new MotoVlog(req.body);
        await vlog.save();
        res.status(201).json(vlog);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// 15. Service Finder Routes
app.get('/api/services', async (req, res) => {
    try {
        const services = await ServicePoint.find();
        res.json(services);
    } catch (e) { res.status(500).json({ message: e.message }); }
});

app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.delete('/api/users/:id', async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/forum/topics/:id/like', async (req, res) => {
    try {
        const t = await ForumTopic.findOne({ id: req.params.id }) || await ForumTopic.findById(req.params.id);
        if (t) { t.likes++; await t.save(); res.json({ success: true, likes: t.likes }); }
        else res.status(404).json({ message: 'Not found' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});
app.post('/api/forum/topics/:id/comments', async (req, res) => {
    try {
        const t = await ForumTopic.findOne({ id: req.params.id }) || await ForumTopic.findById(req.params.id);
        if (t) { t.comments.push({ ...req.body, id: Date.now(), date: new Date().toLocaleDateString('tr-TR') }); await t.save(); res.json(t); }
        else res.status(404).json({ message: 'Not found' });
    } catch (e) { res.status(500).json({ message: e.message }); }
});

// --- START SERVER ---
mongoose.connect(MONGO_URI)
    .then(async () => {
        console.log('✅ MongoDB bağlantısı başarılı');
        await initMinio(); // Initialize MinIO Bucket
        await seedDatabase();
        app.listen(PORT, () => console.log(`🚀 Server çalışıyor: http://localhost:${PORT}`));
    })
    .catch(err => {
        console.error('❌ MongoDB bağlantı hatası:', err.message);
    });