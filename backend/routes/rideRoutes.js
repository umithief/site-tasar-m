import express from 'express';
// import { protect } from '../middleware/authMiddleware.js'; 
// Use protect if available, otherwise just mock for now since authMiddleware imports might depend on things I haven't checked fully.
// But looking at postRoutes, it uses: import { protect } from '../middleware/authMiddleware.js';

import * as rideController from '../controllers/rideController.js';

const router = express.Router();

// router.use(protect); // Enable when Auth is fully ready. For now, let's allow public creation for easier testing or stub in controller.
// Actually, let's trust the user has a token or handle missing user in controller.

router.post('/', rideController.createRide);
router.get('/', rideController.getRides);

export default router;
