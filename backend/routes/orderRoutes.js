import express from 'express';
import mongoose from 'mongoose';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET my orders (requires userId query param or auth middleware)
router.get('/', protect, async (req, res) => {
    try {
        const Order = mongoose.model('Order');

        let query = {};
        if (!req.user.isAdmin) {
            query.userId = req.user._id.toString();
        } else {
            const { userId } = req.query;
            if (userId) query.userId = userId;
        }

        const orders = await Order.find(query).sort({ _id: -1 }); // Newest first
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET single order
router.get('/:id', protect, async (req, res) => {
    try {
        const Order = mongoose.model('Order');
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Sipariş bulunamadı' });

        // Check ownership
        if (order.userId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
            return res.status(403).json({ message: 'Bu siparişi görüntüleme yetkiniz yok' });
        }

        res.json(order);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST place order
router.post('/', protect, async (req, res) => {
    try {
        const Order = mongoose.model('Order');
        const orderData = { ...req.body, userId: req.user._id.toString() };
        const newOrder = new Order(orderData);
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// PUT update order status (Admin)
router.put('/:id', protect, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
        }
        const Order = mongoose.model('Order');
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedOrder);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

export default router;
