import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/events
router.get('/', async (req, res) => {
    try {
        const MeetupEvent = mongoose.model('MeetupEvent');
        const events = await MeetupEvent.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/events
router.post('/', async (req, res) => {
    try {
        const MeetupEvent = mongoose.model('MeetupEvent');
        const newEvent = new MeetupEvent(req.body);
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/events/:id
router.put('/:id', async (req, res) => {
    try {
        const MeetupEvent = mongoose.model('MeetupEvent');
        const updatedEvent = await MeetupEvent.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedEvent);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/events/:id
router.delete('/:id', async (req, res) => {
    try {
        const MeetupEvent = mongoose.model('MeetupEvent');
        await MeetupEvent.findByIdAndDelete(req.params.id);
        res.json({ message: 'Etkinlik silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
