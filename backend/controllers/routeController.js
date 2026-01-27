import Route from '../models/Route.js';
import catchAsync from '../utils/catchAsync.js';

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
const getRoutes = catchAsync(async (req, res) => {
    const { filter } = req.query;

    let query = {};
    if (filter && filter !== 'All') {
        if (filter === 'Coastal') query = { ...query, tags: 'Sahil' }; // Map helper
        if (filter === 'Mountain') query = { ...query, tags: 'Dağ' };
        if (filter === 'Forest') query = { ...query, tags: 'Orman' };
        // Add more filters as needed or generic tag search
        // Also support English tags for backward compat if needed
        if (filter === 'Coastal' || filter === 'Sahil') query = { ...query, tags: { $in: ['Sahil', 'Coastal'] } };
    }

    const routes = await Route.find(query).sort({ createdAt: -1 });
    res.json(routes);
});

// @desc    Get route by ID
// @route   GET /api/routes/:id
// @access  Public
const getRouteById = catchAsync(async (req, res) => {
    const route = await Route.findById(req.params.id).populate('author', 'name avatar');
    if (route) {
        res.json(route);
    } else {
        res.status(404);
        throw new Error('Route not found');
    }
});

// @desc    Create a route
// @route   POST /api/routes
// @access  Private/Admin (or User)
const createRoute = catchAsync(async (req, res) => {
    const route = new Route({
        ...req.body,
        author: req.user._id
    });

    const createdRoute = await route.save();
    res.status(201).json(createdRoute);
});

// @desc    Seed Routes (Temporary for verification)
// @route   POST /api/routes/seed
// @access  Public
const seedRoutes = catchAsync(async (req, res) => {
    await Route.deleteMany({});

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

    const createdRoutes = await Route.insertMany(sampleRoutes);
    res.json(createdRoutes);
});

export { getRoutes, getRouteById, createRoute, seedRoutes };
