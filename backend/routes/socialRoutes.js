
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET all posts
router.get('/', async (req, res) => {
    try {
        const SocialPost = mongoose.model('SocialPost');
        // Sort by _id descending (newest first)
        const posts = await SocialPost.find().sort({ _id: -1 });
        res.json(posts);
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
