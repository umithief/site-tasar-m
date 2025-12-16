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
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Geçersiz ID formatı' });
        }

        const Category = mongoose.model('Category');
        const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedCategory) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }

        res.json(updatedCategory);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// DELETE /api/categories/:id
router.delete('/:id', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: 'Geçersiz ID formatı' });
        }

        const Category = mongoose.model('Category');
        const result = await Category.findByIdAndDelete(req.params.id);

        if (!result) {
            return res.status(404).json({ message: 'Kategori bulunamadı' });
        }

        res.json({ message: 'Kategori silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
