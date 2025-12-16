import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET all stolen items
router.get('/', async (req, res) => {
    try {
        const StolenItem = mongoose.model('StolenItem');
        const items = await StolenItem.find().sort({ dateReported: -1 });
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST report stolen item
router.post('/', async (req, res) => {
    try {
        const StolenItem = mongoose.model('StolenItem');
        const newItem = new StolenItem(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update status
router.put('/:id', async (req, res) => {
    try {
        const StolenItem = mongoose.model('StolenItem');
        const updatedItem = await StolenItem.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
