import express from 'express';
import { getStories, createStory, updateStory, deleteStory } from '../controllers/storyController.js';

const router = express.Router();

router.route('/')
    .get(getStories)
    .post(createStory);

router.route('/:id')
    .put(updateStory)
    .delete(deleteStory);

export default router;
