import express from 'express';
import * as chatController from '../controllers/chatController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', chatController.getChats);
router.get('/:id/messages', chatController.getMessages);
router.post('/init', chatController.getOrCreateChat);

export default router;
