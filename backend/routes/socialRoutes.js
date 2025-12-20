import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/social - Fetch Feed
router.get('/', async (req, res) => {
    try {
        const SocialPost = mongoose.model('SocialPost');
        const posts = await SocialPost.find().sort({ createdAt: -1 });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/social - Create Post
router.post('/', async (req, res) => {
    try {
        const SocialPost = mongoose.model('SocialPost');
        // Expects { userId, userName, userAvatar, content, images, bikeModel, userRank }
        const newPost = new SocialPost({
            ...req.body,
            createdAt: new Date(),
            timestamp: 'Şimdi'
        });
        await newPost.save();
        res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST /api/social/:id/like - Toggle Like
router.post('/:id/like', async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) return res.status(400).json({ message: 'User ID required' });

        const SocialPost = mongoose.model('SocialPost');
        const post = await SocialPost.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });

        const likeIndex = post.likedBy.indexOf(userId);
        if (likeIndex === -1) {
            post.likedBy.push(userId);
            post.likes += 1;
        } else {
            post.likedBy.splice(likeIndex, 1);
            post.likes = Math.max(0, post.likes - 1);
        }

        await post.save();
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/social/:id/comment - Add Comment
router.post('/:id/comment', async (req, res) => {
    try {
        const { authorId, authorName, content } = req.body;
        const SocialPost = mongoose.model('SocialPost');
        const post = await SocialPost.findById(req.params.id);

        if (!post) return res.status(404).json({ message: 'Post not found' });

        const newComment = {
            _id: new mongoose.Types.ObjectId().toString(),
            authorId,
            authorName,
            content,
            date: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
            likes: 0
        };

        post.commentList.push(newComment);
        post.comments = post.commentList.length;
        await post.save();

        res.status(201).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
