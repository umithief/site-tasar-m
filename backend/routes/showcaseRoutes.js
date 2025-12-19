import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET all showcase items
router.get('/', async (req, res) => {
    try {
        const ShowcaseProduct = mongoose.model('ShowcaseProduct');
        const items = await ShowcaseProduct.find({});
        res.json(items);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new showcase item
router.post('/', async (req, res) => {
    try {
        const ShowcaseProduct = mongoose.model('ShowcaseProduct');
        const newItem = new ShowcaseProduct(req.body);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update showcase item
router.put('/:id', async (req, res) => {
    try {
        const ShowcaseProduct = mongoose.model('ShowcaseProduct');
        const updatedItem = await ShowcaseProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedItem);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE showcase item
router.delete('/:id', async (req, res) => {
    try {
        const ShowcaseProduct = mongoose.model('ShowcaseProduct');
        await ShowcaseProduct.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
