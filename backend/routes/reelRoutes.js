import express from 'express';
import {
    createReel,
    getReels,
    adminGetReels,
    updateReelStatus,
    deleteReel,
    interactReel
} from '../controllers/reelController.js';

const router = express.Router();

// Public / User Routes
router.get('/', getReels);
router.post('/upload', createReel);
router.post('/:id/interact', interactReel);

// Admin Routes (Should be protected in production, open for now based on request scope)
router.get('/admin/all', adminGetReels);
router.patch('/admin/:id', updateReelStatus);
router.delete('/admin/:id', deleteReel);

export default router;
