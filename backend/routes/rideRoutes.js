import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createRide, getRide, getUserRides, deleteRide } from '../controllers/rideController.js';

const router = express.Router();

// Public Routes
// (None currently, keeping rides protected or public but fetched via ID)

// Protected Routes
router.route('/')
    .post(protect, createRide);

router.route('/:id')
    .get(getRide) // Can be public depending on isPublic flag logic in controller
    .delete(protect, deleteRide);

router.route('/user/:userId')
    .get(getUserRides);

export default router;
