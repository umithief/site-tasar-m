import mongoose from 'mongoose';

// Comment schema moved to separate model


const postSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    // Cache user details for feed performance
    userName: String,
    userAvatar: String,
    userRank: String,
    bikeModel: String,

    content: { type: String, trim: true },
    images: [String], // Array of URLs
    mediaUrl: { type: String }, // Backwards compatibility or sinle video

    // Engagement
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // comments: Removed embedded array in favor of separate Comment collection for scalability

    // Meta

    // Meta
    location: String,
    hashtags: [String],

    // Ride Stats Integration
    rideStats: {
        maxSpeed: Number,
        distance: Number,
        duration: String,
        routeSvg: String,
        rideId: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' } // Link to actual route if needed
    },

    // Counters (managed via hooks or controllers for perf)
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 }
}, {
    timestamps: true,
    versionKey: false
});

// Indexes for feed performance
postSchema.index({ user: 1, createdAt: -1 });

const Post = mongoose.models.SocialPost || mongoose.model('SocialPost', postSchema); // Keep 'SocialPost' collection name to match previous steps
export default Post;
