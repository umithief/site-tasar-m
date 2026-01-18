import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    image: String,
    difficulty: String,
    distance: String,
    duration: String, // Keep for backward compat
    estimatedTime: String,
    location: String,
    bestSeason: String,
    tags: [String],
    coordinates: [{ lat: Number, lng: Number }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    rating: { type: Number, default: 0 },
    riderCount: { type: Number, default: 0 },
    weather: String,
    stats: {
        curves: Number,
        roadQuality: Number,
        traffic: Number
    }
}, { versionKey: false });

const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);

export default Route;
