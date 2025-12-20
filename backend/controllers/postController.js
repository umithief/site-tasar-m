import Post from '../models/Post.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get Feed
export const getFeed = catchAsync(async (req, res, next) => {
    const posts = await Post.find().sort({ createdAt: -1 }); // Simplify for now (global feed)
    res.status(200).json(posts);
});

// Create Post
export const createPost = catchAsync(async (req, res, next) => {
    const { content, bikeModel, userRank } = req.body;

    // In a real app, logic to handle file upload would be here or in middleware
    // req.body should contain { content, images, etc. }

    const newPost = await Post.create({
        user: req.user._id, // Assumes auth middleware populates req.user
        userName: req.user.name,
        userAvatar: req.user.avatar,
        content,
        bikeModel, // Optional
        userRank,  // Optional
        images: req.body.images || [],
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })
    });

    res.status(201).json(newPost);
});

// Toggle Like
export const toggleLike = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new AppError('No post found with that ID.', 404));
    }

    // Check if user already liked
    // Note: likes array stores ObjectIds
    const userIdStr = req.user._id.toString();
    const index = post.likes.findIndex(id => id.toString() === userIdStr);

    if (index === -1) {
        // Not liked yet -> Like it
        post.likes.push(req.user._id);
        post.likeCount = (post.likeCount || 0) + 1;
    } else {
        // Already liked -> Unlike it
        post.likes.splice(index, 1);
        post.likeCount = Math.max(0, (post.likeCount || 0) - 1);
    }

    await post.save();

    res.status(200).json(post);
});

// Add Comment
export const addComment = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post) return next(new AppError('Post not found.', 404));

    const newComment = {
        user: req.user._id,
        authorName: req.user.name, // Cache name
        // authorAvatar: req.user.avatar,
        content: req.body.content,
        timestamp: Date.now()
    };

    post.comments.push(newComment);
    post.commentCount = (post.commentCount || 0) + 1;
    await post.save();

    res.status(201).json(post);
});
