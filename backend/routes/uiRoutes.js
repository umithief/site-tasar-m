
import express from 'express';
import { getSettings, updateSettings } from '../controllers/uiController.js';
// Auth middleware can be added here if strict admin check is needed
// import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/:component', updateSettings);

export default router;
