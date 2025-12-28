import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    startPoint: { type: String }, // Mobile: Starting location name
    endPoint: { type: String }, // Mobile: Ending location name
    distance: { type: String, required: true }, // Keeping as String for flexibility e.g., "120 km" or Number if preferred, maintaining String based on types.ts
    estimatedTime: { type: String, required: true },
    location: { type: String, required: true },
    coordinates: [{
        lat: Number,
        lng: Number
    }],
    vibeTags: [{ type: String }], // Mobile: Mood-based tags like 'Coastal', 'Mountain', 'City', 'Off-road'
    difficulty: {
        type: String,
        enum: ['Kolay', 'Orta', 'Zor', 'Extreme'],
        required: true
    },
    // Enhanced Difficulty Metrics (1-5)
    difficultyMetrics: {
        technical: { type: Number, min: 1, max: 5 },
        scenery: { type: Number, min: 1, max: 5 },
        speed: { type: Number, min: 1, max: 5 }
    },
    terrain: [{ type: String }], // 'Asphalt', 'Off-road', 'Coastal'
    images: [{ type: String }],
    image: { type: String, required: true }, // Main cover image
    videoUrl: { type: String },

    weatherPoint: { type: String }, // City name for weather API

    bestSeason: { type: String },

    stats: {
        curves: { type: Number, min: 0, max: 100 },
        roadQuality: { type: Number, min: 0, max: 100 },
        traffic: { type: Number, min: 0, max: 100 }
    },

    riderCount: { type: Number, default: 0 },

    tags: [{ type: String }],
    tips: [{ type: String }],

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    isFeatured: { type: Boolean, default: false }
}, {
    timestamps: true
});

const Route = mongoose.model('Route', routeSchema);

export default Route;
