import Post from '../models/Post.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Get Feed Posts (From Following + Own)
export const getFeedPosts = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1. Get current user's following list
    const currentUser = await User.findById(req.user.id);

    // 2. Fetch posts where user is in 'following' list OR is the current user
    const posts = await Post.find({
        user: { $in: [...currentUser.following, req.user.id] }
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'comments.user',
            select: 'name avatar'
        })
        .lean();

    const postsWithLikeStatus = posts.map(post => ({
        ...post,
        isLiked: post.likes.some(id => id.toString() === req.user.id.toString())
    }));

    const total = await Post.countDocuments({
        user: { $in: [...currentUser.following, req.user.id] }
    });

    res.status(200).json({
        status: 'success',
        results: postsWithLikeStatus.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: { posts: postsWithLikeStatus }
    });
});

export const createPost = catchAsync(async (req, res, next) => {
    const { content, mediaUrl, images } = req.body;

    if (!content && !mediaUrl && (!images || images.length === 0)) {
        return next(new AppError('İçerik boş olamaz.', 400));
    }

    const finalImages = images && images.length > 0 ? images : (mediaUrl ? [mediaUrl] : []);

    const newPost = await Post.create({
        user: req.user.id,
        userName: req.user.name,
        userAvatar: req.user.avatar,
        content,
        images: finalImages,
        mediaUrl: finalImages.length > 0 ? finalImages[0] : null // Keep backward compatibility
    });

    res.status(201).json({
        status: 'success',
        data: { post: newPost }
    });
});

export const toggleLike = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new AppError('Post bulunamadı.', 404));
    }

    // Check if like exists
    const isLiked = post.likes.includes(req.user.id);

    if (isLiked) {
        // Unlike
        post.likes.pull(req.user.id);
        post.likeCount = Math.max(0, post.likeCount - 1);
    } else {
        // Like
        post.likes.push(req.user.id);
        post.likeCount += 1;

        // Notify Post Owner (if not self)
        if (post.user.toString() !== req.user.id.toString()) {
            sendNotification(post.user, 'like', {
                senderId: req.user.id,
                senderName: req.user.name,
                postId: post._id,
                message: `${req.user.name} gönderini beğendi.`
            });
        }
    }

    await post.save();

    res.status(200).json({
        status: 'success',
        message: isLiked ? 'Beğeni geri alındı' : 'Beğenildi',
        data: {
            likes: post.likes,
            likeCount: post.likeCount
        }
    });
});

export const addComment = catchAsync(async (req, res, next) => {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) return next(new AppError('Post bulunamadı.', 404));
    if (!content) return next(new AppError('Yorum boş olamaz', 400));

    const comment = {
        user: req.user.id,
        authorName: req.user.name,
        // authorAvatar: req.user.avatar,
        content,
        timestamp: Date.now()
    };

    post.comments.push(comment);
    post.commentCount += 1;

    await post.save();

    // Re-fetch or simplistic return (Populate user for frontend display)
    // For now returning post
    res.status(201).json({
        status: 'success',
        message: 'Yorum eklendi',
        data: { comments: post.comments }
    });
});


export const getUserPosts = catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    // Check if user exists? Optional.

    const posts = await Post.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate({
            path: 'comments.user',
            select: 'name avatar'
        })
        .lean();

    // Calculate isLiked if user is authenticated
    let postsWithLikeStatus = posts;
    if (req.user) {
        postsWithLikeStatus = posts.map(post => ({
            ...post,
            isLiked: post.likes.some(id => id.toString() === req.user.id.toString())
        }));
    }

    res.status(200).json({
        status: 'success',
        results: postsWithLikeStatus.length,
        data: { posts: postsWithLikeStatus }
    });
});
