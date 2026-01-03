const express = require('express');
const router = express.Router();
const activityController = require('../controllers/activityController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/latest', authMiddleware, activityController.getLatestActivity);
router.post('/', authMiddleware, activityController.createActivity);

module.exports = router;
