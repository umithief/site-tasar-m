
import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET all stories
router.get('/', async (req, res) => {
    try {
        const Story = mongoose.model('Story');
        const stories = await Story.find();
        res.json(stories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new story
router.post('/', async (req, res) => {
    try {
        const Story = mongoose.model('Story');
        const newStory = new Story(req.body);
        await newStory.save();
        res.status(201).json(newStory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE story
router.delete('/:id', async (req, res) => {
    try {
        const Story = mongoose.model('Story');
        const { id } = req.params;
        await Story.findByIdAndDelete(id);
        res.json({ message: 'Story deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
