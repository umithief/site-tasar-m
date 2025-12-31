import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

// Auth Routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

// Profile
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getProfile);
router.put('/profile', protect, userController.updateProfile);

// Social Actions (Protected)
router.use(protect);
router.post('/follow/:id', userController.toggleFollow);
// router.post('/unfollow/:id', userController.toggleFollow); // Single toggle endpoint handles both

export default router;
