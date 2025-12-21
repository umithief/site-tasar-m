import express from 'express';
import * as messageController from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.use(protect);

// Order matters! /threads needs to be before /:userId
router.get('/threads', messageController.getThreads);
router.get('/:userId', messageController.getConversation);
router.post('/', messageController.sendMessage);

export default router;
