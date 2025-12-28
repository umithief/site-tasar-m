import Route from '../models/Route.js';
import catchAsync from '../utils/catchAsync.js';

// @desc    Get all routes
// @route   GET /api/routes
// @access  Public
const getRoutes = catchAsync(async (req, res) => {
    const { filter } = req.query;

    let query = {};
    if (filter && filter !== 'All') {
        if (filter === 'Coastal') query = { ...query, tags: 'Coastal' };
        if (filter === 'Mountain') query = { ...query, tags: 'Mountain' };
        if (filter === 'Forest') query = { ...query, tags: 'Forest' };
        // Add more filters as needed or generic tag search
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
            title: 'Şile Coastal Run',
            description: 'Experience the breathtaking Black Sea coast with a perfect mix of high-speed straights and technical curves.',
            distance: '145 km',
            estimatedTime: '2h 15m',
            difficulty: 'Orta',
            location: 'Şile, Istanbul',
            image: 'https://images.unsplash.com/photo-1519003300449-6cb3878b2d18?q=80&w=1000&auto=format&fit=crop',
            stats: { curves: 75, roadQuality: 90, traffic: 40 },
            tags: ['Coastal', 'Scenic', 'Fast'],
            riderCount: 1243,
            bestSeason: 'Spring, Summer',
            difficultyMetrics: { technical: 3, scenery: 5, speed: 4 },
            terrain: ['Asphalt'],
            coordinates: [{ lat: 41.1744, lng: 29.6116 }] // Şile approx
        },
        {
            title: 'Uludağ Summit Climb',
            description: 'A technical mountain pass challenging even the most experienced riders with its hairpin turns.',
            distance: '42 km',
            estimatedTime: '1h 10m',
            difficulty: 'Zor',
            location: 'Bursa',
            image: 'https://images.unsplash.com/photo-1625026412613-2287c2b3e8c0?q=80&w=1000&auto=format&fit=crop',
            stats: { curves: 95, roadQuality: 85, traffic: 30 },
            tags: ['Mountain', 'Technical', 'Curves'],
            riderCount: 856,
            bestSeason: 'Summer, Autumn',
            difficultyMetrics: { technical: 5, scenery: 5, speed: 2 },
            terrain: ['Asphalt'],
            coordinates: [{ lat: 40.1828, lng: 29.0669 }] // Uludağ approx
        }
    ];

    const createdRoutes = await Route.insertMany(sampleRoutes);
    res.json(createdRoutes);
});

export { getRoutes, getRouteById, createRoute, seedRoutes };
