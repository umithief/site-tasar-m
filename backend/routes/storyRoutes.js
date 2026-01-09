import express from 'express';
import { createStory, getStories, viewStory } from '../controllers/storyController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
    .post(protect, createStory)
    .get(protect, getStories);

router.route('/:id/view')
    .post(protect, viewStory);

export default router;
