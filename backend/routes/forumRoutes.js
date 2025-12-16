import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET all topics
router.get('/', async (req, res) => {
    try {
        const ForumTopic = mongoose.model('ForumTopic');
        const topics = await ForumTopic.find().sort({ date: -1 }); // Newest first
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET query topics (search/filter)
router.get('/search', async (req, res) => {
    try {
        const ForumTopic = mongoose.model('ForumTopic');
        const { q, category } = req.query;
        let query = {};

        if (category && category !== 'Tümü') query.category = category;
        if (q) query.title = { $regex: q, $options: 'i' };

        const topics = await ForumTopic.find(query);
        res.json(topics);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single topic
router.get('/:id', async (req, res) => {
    try {
        // Search by ID or custom ID string (e.g. TOPIC-1)
        const ForumTopic = mongoose.model('ForumTopic');
        let topic = await ForumTopic.findOne({ id: req.params.id });

        // If not found by custom ID, try ObjectId
        if (!topic && mongoose.Types.ObjectId.isValid(req.params.id)) {
            topic = await ForumTopic.findById(req.params.id);
        }

        if (!topic) return res.status(404).json({ message: 'Konu bulunamadı' });

        // Increase views
        topic.views += 1;
        await topic.save();

        res.json(topic);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new topic
router.post('/', async (req, res) => {
    try {
        const ForumTopic = mongoose.model('ForumTopic');
        const newTopic = new ForumTopic(req.body);
        // Ensure custom ID if not provided (simple strategy)
        if (!newTopic.id) {
            newTopic.id = `TOPIC-${Date.now()}`;
        }
        await newTopic.save();
        res.status(201).json(newTopic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// POST comment to topic
router.post('/:id/comments', async (req, res) => {
    try {
        const ForumTopic = mongoose.model('ForumTopic');
        const { content, authorId, authorName } = req.body;

        const topic = await ForumTopic.findOne({ id: req.params.id }) || await ForumTopic.findById(req.params.id);
        if (!topic) return res.status(404).json({ message: 'Konu bulunamadı' });

        const newComment = {
            id: `cmt-${Date.now()}`,
            content,
            authorId,
            authorName,
            date: new Date().toLocaleDateString('tr-TR'),
            likes: 0
        };

        topic.comments.push(newComment);
        await topic.save();
        res.status(201).json(topic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT like topic
router.put('/:id/like', async (req, res) => {
    try {
        const ForumTopic = mongoose.model('ForumTopic');
        const topic = await ForumTopic.findOne({ id: req.params.id }) || await ForumTopic.findById(req.params.id);
        if (!topic) return res.status(404).json({ message: 'Konu bulunamadı' });

        topic.likes += 1;
        await topic.save();
        res.json(topic);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
