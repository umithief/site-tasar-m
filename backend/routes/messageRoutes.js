import express from 'express';
import { getThreads, getConversation, sendMessage } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/threads', getThreads);
router.get('/conversation/:userId', getConversation);
router.post('/', sendMessage);

export default router;
