import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET my orders (requires userId query param or auth middleware)
router.get('/', async (req, res) => {
    try {
        const Order = mongoose.model('Order');
        const { userId } = req.query;

        let query = {};
        if (userId) query.userId = userId;

        const orders = await Order.find(query).sort({ _id: -1 }); // Newest first
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single order
router.get('/:id', async (req, res) => {
    try {
        const Order = mongoose.model('Order');
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Sipariş bulunamadı' });
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST place order
router.post('/', async (req, res) => {
    try {
        const Order = mongoose.model('Order');
        const newOrder = new Order(req.body);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update order status (Admin)
router.put('/:id', async (req, res) => {
    try {
        const Order = mongoose.model('Order');
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
