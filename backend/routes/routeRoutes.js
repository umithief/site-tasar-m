import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/routes
router.get('/', async (req, res) => {
    try {
        const Route = mongoose.model('Route');
        const routes = await Route.find();
        res.json(routes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/routes
router.post('/', async (req, res) => {
    try {
        const Route = mongoose.model('Route');
        const newRoute = new Route(req.body);
        await newRoute.save();
        res.status(201).json(newRoute);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/routes/:id
router.delete('/:id', async (req, res) => {
    try {
        const Route = mongoose.model('Route');
        await Route.findByIdAndDelete(req.params.id);
        res.json({ message: 'Rota silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
