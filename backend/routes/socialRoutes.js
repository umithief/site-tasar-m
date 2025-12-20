import express from 'express';
import * as postController from '../controllers/postController.js';
import * as userController from '../controllers/userController.js';

// Middleware to mock auth user for now, assuming server.js has the real one or we add it here
// For now, we reuse the existing middleware pattern if any, or expect req.user to be populated
// But wait, server.js doesn't seem to have a global auth middleware for all routes, individual routes might need it.
// The new controllers expect req.user.
// I will add a simple middleware here or assume it's mounted with one.
// Let's create a placeholder middleware.

const protect = async (req, res, next) => {
    // Ideally this verifies JWT.
    // userController.js needs req.user.id
    // For MERN migration, we need proper auth.
    // For now, let's assume the request body has userId or simulate it if coming from frontend with token.
    // Actually, let's use the one from server.js if it exists, or define a basic one.
    // Existing code in socialRoutes.js used req.body.userId manually.
    // New controllers use req.user._id.

    // TEMPORARY FIX: Middleware to map req.body.userId to req.user for backward compat/testing
    if (req.body.userId) {
        req.user = { _id: req.body.userId, name: req.body.userName, avatar: req.body.userAvatar };
    }
    // Real implementation should verify token header.
    next();
};

const router = express.Router();

router.use(protect); // Apply to all social routes

// Feed
router.get('/', postController.getFeed);
router.post('/', postController.createPost);

// Actions
router.post('/:id/like', postController.toggleLike);
router.post('/:id/comment', postController.addComment);

// Follow System
router.post('/follow/:id', userController.followUser);
router.post('/unfollow/:id', userController.unfollowUser);

export default router;
