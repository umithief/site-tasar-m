import mongoose from 'mongoose';

const vibeConfigSchema = new mongoose.Schema({
    // Singleton ID
    _id: { type: String, default: 'default_config' },

    // 1. Engagement Weights
    weights: {
        like: { type: Number, default: 10 },
        comment: { type: Number, default: 30 },
        share: { type: Number, default: 50 },
        save: { type: Number, default: 60 }
    },

    // 2. Multipliers
    multipliers: {
        telemetry: { type: Number, default: 1.5 },
        affinity: { type: Number, default: 1.3 },
        pro: { type: Number, default: 1.2 }
    },

    // 3. Time Decay
    timeDecay: {
        enabled: { type: Boolean, default: true },
        factor: { type: Number, default: 1.8 } // Power factor
    },

    // 4. Sponsored Content
    sponsored: {
        enabled: { type: Boolean, default: true },
        frequency: { type: Number, default: 8 }, // Every Nth post
        minRating: { type: Number, default: 4.5 }
    },

    lastUpdated: { type: Date, default: Date.now }
}, { versionKey: false });

const VibeConfig = mongoose.models.VibeConfig || mongoose.model('VibeConfig', vibeConfigSchema);

export default VibeConfig;
