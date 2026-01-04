import mongoose from 'mongoose';

const rideSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    startTime: { type: Date, required: true },
    difficulty: {
        type: String,
        enum: ['Easy', 'Moderate', 'Hard'],
        required: true
    },
    // GeoJSON for Route
    route: {
        type: {
            type: String,
            enum: ['FeatureCollection'],
            default: 'FeatureCollection'
        },
        features: {
            type: [Object], // flexible for now, or define stricter GeoJSON schema
            default: []
        }
    },
    maxParticipants: { type: Number, default: 10 },
    creatorId: { type: String, required: true, ref: 'User' },
    participants: [{ type: String, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// Indexes for sorting/filtering
rideSchema.index({ startTime: 1 });

const Ride = mongoose.models.Ride || mongoose.model('Ride', rideSchema);

export default Ride;
