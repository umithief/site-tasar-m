import express from 'express';
import { getRoutes, getRouteById, createRoute, seedRoutes } from '../controllers/routeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .get(getRoutes)
    .post(protect, admin, createRoute);

router.route('/seed')
    .post(seedRoutes); // Public for dev/demo purposes, restrict in prod

router.route('/:id')
    .get(getRouteById);

export default router;
