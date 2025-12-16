import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/slides
router.get('/', async (req, res) => {
    try {
        const Slide = mongoose.model('Slide');
        const slides = await Slide.find();
        res.json(slides);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/slides
router.post('/', async (req, res) => {
    try {
        const Slide = mongoose.model('Slide');
        const newSlide = new Slide(req.body);
        await newSlide.save();
        res.status(201).json(newSlide);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/slides/:id
router.put('/:id', async (req, res) => {
    try {
        const Slide = mongoose.model('Slide');
        const updatedSlide = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedSlide);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/slides/:id
router.delete('/:id', async (req, res) => {
    try {
        const Slide = mongoose.model('Slide');
        await Slide.findByIdAndDelete(req.params.id);
        res.json({ message: 'Slide silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
