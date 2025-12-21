import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as postController from '../controllers/postController.js';

const router = express.Router();

// Public Routes
router.get('/user/:id/posts', postController.getUserPosts);

// Protected Routes
router.use(protect);

router.get('/feed', postController.getFeedPosts);
router.post('/', postController.createPost);
router.post('/:id/like', postController.toggleLike);
router.post('/:id/comment', postController.addComment);

export default router;
