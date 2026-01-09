import mongoose from 'mongoose';

const storySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['IMAGE', 'VIDEO'],
        default: 'IMAGE'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    expiresAt: {
        type: Date,
        default: () => new Date(+new Date() + 24 * 60 * 60 * 1000), // 24 hours from now
        index: { expires: '0s' } // TTL index
    },
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

export default mongoose.models.Story || mongoose.model('Story', storySchema);
