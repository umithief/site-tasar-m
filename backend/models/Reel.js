import mongoose from 'mongoose';

const reelSchema = new mongoose.Schema({
    userId: { type: String, required: true, ref: 'User' },
    userName: String,
    userAvatar: String,
    videoUrl: { type: String, required: true },
    thumbnailUrl: String,
    caption: String,
    bikeModel: String,
    isApproved: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    likes: { type: Number, default: 0 },
    views: { type: Number, default: 0 },
    likedBy: [String], // Array of user IDs
    createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

const Reel = mongoose.models.Reel || mongoose.model('Reel', reelSchema);

export default Reel;
