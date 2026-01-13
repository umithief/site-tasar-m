
import express from 'express';
import { getSettings, updateSettings } from '../controllers/uiController.js';
// Auth middleware can be added here if strict admin check is needed
// import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getSettings);

router.get('/', getSettings);
router.put('/:component', updateSettings);

// Branding Specific Routes - For cleaner separation we could make a new file, but keeping UI cohesive
import { getBranding, updateBranding } from '../controllers/uiController.js';
router.get('/branding', getBranding);
router.put('/branding', updateBranding);


export default router;
