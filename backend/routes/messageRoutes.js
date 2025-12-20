import express from 'express';
import * as messageController from '../controllers/messageController.js';

const protect = async (req, res, next) => {
    // Temporary mock auth middleware
    if (req.body.userId || req.query.userId) {
        req.user = { _id: req.body.userId || req.query.userId };
    }
    next();
};

const router = express.Router();
router.use(protect);

router.get('/:userId', messageController.getConversation);
router.post('/', messageController.sendMessage);

export default router;
