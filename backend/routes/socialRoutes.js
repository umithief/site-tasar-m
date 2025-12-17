
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET all posts
router.get('/', async (req, res) => {
    try {
        const SocialPost = mongoose.model('SocialPost');
        const posts = await SocialPost.find().sort({ timestamp: -1 }); // Newest first (if timestamp works alphabetically or numeric)
        // If sorting strictly by date is needed, timestamp should ideally be a date object or ISO string.
        // Assuming current mock data uses "2 saat önce" which doesn't sort well, but new posts use "Şimdi".
        // For production, maybe rely on _id (natural creation order)
        res.json(posts.reverse()); // Reverse to show newest created first if implicit order
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new post
router.post('/', async (req, res) => {
    try {
        const SocialPost = mongoose.model('SocialPost');
        const newPost = new SocialPost(req.body);

        // Ensure timestamp is meaningful or keep "Şimdi" as requested
        newPost.timestamp = new Date().toLocaleString('tr-TR');

        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT like post
router.put('/:id/like', async (req, res) => {
    try {
        const SocialPost = mongoose.model('SocialPost');
        const post = await SocialPost.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Paylaşım bulunamadı' });

        post.likes += 1;
        await post.save();
        res.json(post);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE post (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const SocialPost = mongoose.model('SocialPost');
        await SocialPost.findByIdAndDelete(req.params.id);
        res.json({ message: 'Paylaşım silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
