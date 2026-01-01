import Post from '../models/Post.js';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Import Comment model
import Comment from '../models/Comment.js';

// Get Feed Posts (From Following + Own)
export const getFeedPosts = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 1. Get current user's following list (Select only following field for performance)
    const currentUser = await User.findById(req.user.id).select('following');

    // Safety check: Ensure following is an array, default to empty
    const followingIds = currentUser?.following ? currentUser.following.map(id => id.toString()) : [];

    // Add current user's ID to the list (to see own posts)
    // Using Set to prevent duplicates if user somehow follows themselves
    const allowedUserIds = [...new Set([...followingIds, req.user.id.toString()])];

    // 2. Fetch posts strictly from this list
    const posts = await Post.find({
        user: { $in: allowedUserIds }
    })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

    const postsWithLikeStatus = posts.map(post => ({
        ...post,
        isLiked: post.likes.some(id => id.toString() === req.user.id.toString())
    }));

    const total = await Post.countDocuments({
        user: { $in: allowedUserIds }
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
            const { sendNotification } = await import('../socket.js');
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

    const newComment = await Comment.create({
        content,
        author: req.user.id,
        post: post._id
    });

    // Update post meta
    post.commentCount += 1;
    await post.save();

    // Populate for return
    await newComment.populate('author', 'name avatar');

    // Notify Post Owner (if not self)
    if (post.user.toString() !== req.user.id.toString()) {
        const { sendNotification } = await import('../socket.js');
        sendNotification(post.user, 'comment', {
            senderId: req.user.id,
            senderName: req.user.name,
            senderAvatar: req.user.avatar,
            postId: post._id,
            commentId: newComment._id,
            message: `${req.user.name} gönderine yorum yaptı: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`
        });
    }

    res.status(201).json({
        status: 'success',
        message: 'Yorum eklendi',
        data: { comment: newComment }
    });
});

export const getPostComments = catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const comments = await Comment.find({ post: id })
        .sort({ createdAt: -1 })
        .populate('author', 'name avatar');

    res.status(200).json({
        status: 'success',
        results: comments.length,
        data: { comments }
    });
});


export const getUserPosts = catchAsync(async (req, res, next) => {
    const userId = req.params.id;

    // Check if user exists? Optional.

    const posts = await Post.find({ user: userId })
        .sort({ createdAt: -1 })

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

export const search = catchAsync(async (req, res, next) => {
    const { q } = req.query;

    if (!q) {
        return next(new AppError('Arama terimi gereklidir.', 400));
    }

    // Search Users
    const users = await User.find({
        $or: [
            { name: { $regex: q, $options: 'i' } },
            { username: { $regex: q, $options: 'i' } }
        ]
    }).select('name username avatar profileImage bike rank').limit(10);

    // Search Posts (Hashtags) - Simple implementation: Find posts with content matching #query
    // For now, just regex on content
    /* 
    const posts = await Post.find({
        content: { $regex: `#${q}`, $options: 'i' }
    }).limit(5);
    */

    res.status(200).json({
        status: 'success',
        users,
        hashtags: [] // Placeholder for now
    });
});
