import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as postController from '../controllers/postController.js';

const router = express.Router();

router.use(protect); // Protect all post routes

router.get('/feed', postController.getFeedPosts);
router.post('/', postController.createPost);
router.post('/:id/like', postController.toggleLike);
router.post('/:id/comment', postController.addComment);

export default router;
