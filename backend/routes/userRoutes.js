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
router.put('/update-settings', protect, userController.updateSettings);
router.patch('/update-password', protect, userController.updatePassword);

// Social Actions (Protected)
router.use(protect);
router.post('/follow/:id', userController.toggleFollow);
// router.post('/unfollow/:id', userController.toggleFollow); // Single toggle endpoint handles both

// Garage
router.post('/garage', userController.addToGarage);
router.put('/garage/primary', userController.setPrimaryBike);
router.delete('/garage/:garageId', userController.removeFromGarage);

// Cart
router.get('/cart', userController.getCart);
router.post('/cart', userController.addToCart);
router.delete('/cart/:productId', userController.removeFromCart);
router.put('/cart/:productId', userController.updateCartItem);

export default router;
