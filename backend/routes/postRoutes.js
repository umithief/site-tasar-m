import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import * as postController from '../controllers/postController.js';

import { getDiscoveryFeed, getVibeSettings, updateVibeSettings } from '../controllers/feedController.js';

const router = express.Router();

// Public Routes
router.get('/user/:id/posts', postController.getUserPosts);
router.get('/search', postController.search); // Public Search

// Protected Routes
router.use(protect);

// VibeEngine Admin Routes
router.get('/config', getVibeSettings);
router.put('/config', updateVibeSettings);

// VibeEngine Discovery Feed
router.get('/discover', getDiscoveryFeed);

// Public/Explore Routes
router.get('/explore', postController.getExplorePosts);
router.get('/feed', postController.getFeedPosts);
// router.get('/search', postController.search); // Moved to public
router.post('/', postController.createPost);
router.post('/:id/like', postController.toggleLike);
router.post('/:id/comment', postController.addComment);
router.get('/:id/comments', postController.getPostComments);
router.delete('/:id', postController.deletePost);
router.put('/:id', postController.updatePost);

export default router;
