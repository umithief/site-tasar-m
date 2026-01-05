import mongoose from 'mongoose';

const routeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    image: String,
    difficulty: String,
    distance: String,
    duration: String,
    location: String,
    bestSeason: String,
    tags: [String],
    coordinates: [{ lat: Number, lng: Number }]
}, { versionKey: false });

const Route = mongoose.models.Route || mongoose.model('Route', routeSchema);

export default Route;
