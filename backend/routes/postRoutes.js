import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as postController from '../controllers/postController.js';

const router = express.Router();

// Public Routes
router.get('/user/:id/posts', postController.getUserPosts);
router.get('/search', postController.search); // Public Search

// Protected Routes
router.use(protect);

router.get('/feed', postController.getFeedPosts);
// router.get('/search', postController.search); // Moved to public
router.post('/', postController.createPost);
router.post('/:id/like', postController.toggleLike);
router.post('/:id/comment', postController.addComment);
router.get('/:id/comments', postController.getPostComments);

export default router;
