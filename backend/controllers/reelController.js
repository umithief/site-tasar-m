import Reel from '../models/Reel.js';
import User from '../models/User.js';

// Create a new reel (Upload)
export const createReel = async (req, res) => {
    try {
        const { userId, videoUrl, thumbnailUrl, caption, bikeModel } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const newReel = new Reel({
            userId,
            userName: user.name,
            userAvatar: user.avatar || user.image, // Fallback logic
            videoUrl,
            thumbnailUrl,
            caption,
            bikeModel
        });

        await newReel.save();
        res.status(201).json(newReel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get approved reels for the homepage (Featured first)
export const getReels = async (req, res) => {
    try {
        const reels = await Reel.find({ isApproved: true })
            .sort({ isFeatured: -1, createdAt: -1 })
            .limit(20);
        res.status(200).json(reels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all reels (including pending)
export const adminGetReels = async (req, res) => {
    try {
        const reels = await Reel.find().sort({ createdAt: -1 });
        res.status(200).json(reels);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Update Status (Approve/Feature)
export const updateReelStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isApproved, isFeatured } = req.body;

        const updateData = {};
        if (typeof isApproved !== 'undefined') updateData.isApproved = isApproved;
        if (typeof isFeatured !== 'undefined') updateData.isFeatured = isFeatured;

        const updatedReel = await Reel.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json(updatedReel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete Reel
export const deleteReel = async (req, res) => {
    try {
        const { id } = req.params;
        await Reel.findByIdAndDelete(id);
        res.status(200).json({ message: 'Reel deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Like/View Interaction
export const interactReel = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, userId } = req.body; // type: 'like' or 'view'

        const reel = await Reel.findById(id);
        if (!reel) return res.status(404).json({ message: 'Reel not found' });

        if (type === 'view') {
            reel.views += 1;
        } else if (type === 'like') {
            if (reel.likedBy.includes(userId)) {
                reel.likes -= 1;
                reel.likedBy = reel.likedBy.filter(uid => uid !== userId);
            } else {
                reel.likes += 1;
                reel.likedBy.push(userId);
            }
        }

        await reel.save();
        res.status(200).json(reel);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
