import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/categories
router.get('/', async (req, res) => {
    try {
        const Category = mongoose.model('Category');
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/categories
router.post('/', async (req, res) => {
    try {
        const Category = mongoose.model('Category');
        const newCategory = new Category(req.body);
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/categories/:id
router.put('/:id', async (req, res) => {
    try {
        const Category = mongoose.model('Category');
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedCategory);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
    try {
        const Category = mongoose.model('Category');
        await Category.findByIdAndDelete(req.params.id);
        res.json({ message: 'Kategori silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
