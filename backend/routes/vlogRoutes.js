import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/vlogs
router.get('/', async (req, res) => {
    try {
        const MotoVlog = mongoose.model('MotoVlog');
        const vlogs = await MotoVlog.find();
        res.json(vlogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/vlogs
router.post('/', async (req, res) => {
    try {
        const MotoVlog = mongoose.model('MotoVlog');
        const newVlog = new MotoVlog(req.body);
        await newVlog.save();
        res.status(201).json(newVlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/vlogs/:id
router.put('/:id', async (req, res) => {
    try {
        const MotoVlog = mongoose.model('MotoVlog');
        const updatedVlog = await MotoVlog.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedVlog);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/vlogs/:id
router.delete('/:id', async (req, res) => {
    try {
        const MotoVlog = mongoose.model('MotoVlog');
        await MotoVlog.findByIdAndDelete(req.params.id);
        res.json({ message: 'Vlog silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
