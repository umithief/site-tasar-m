import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET all products (with optional text search & category filter)
router.get('/', async (req, res) => {
    try {
        const Product = mongoose.model('Product');
        const { search, category, sort } = req.query;

        let query = {};

        if (category && category !== 'all' && category !== 'Tümü') {
            query.category = category;
        }

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        let products = await Product.find(query);

        // Sorting (if needed locally or via DB)
        // Currently doing basic DB fetch. Complex sorts can be added to .sort()

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single product
router.get('/:id', async (req, res) => {
    try {
        const Product = mongoose.model('Product');
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Ürün bulunamadı' });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST new product
router.post('/', async (req, res) => {
    try {
        const Product = mongoose.model('Product');
        const newProduct = new Product(req.body);
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update product
router.put('/:id', async (req, res) => {
    try {
        const Product = mongoose.model('Product');
        const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedProduct);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE product
router.delete('/:id', async (req, res) => {
    try {
        const Product = mongoose.model('Product');
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Ürün silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
