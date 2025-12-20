
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// POST follow user
router.post('/:id/follow', async (req, res) => {
    try {
        const User = mongoose.model('User');
        const targetUser = await User.findById(req.params.id);

        if (!targetUser) {
            return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
        }

        // Increment followers count
        targetUser.followers = (targetUser.followers || 0) + 1;
        await targetUser.save();

        // Note: Logic to update "following" count of the request sender is omitted 
        // as we rely on client-side state or auth middleware for "me".

        res.json({ message: 'Takip edildi', followers: targetUser.followers });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
