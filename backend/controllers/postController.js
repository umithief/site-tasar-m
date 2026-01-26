import mongoose from 'mongoose';
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
    const { caption, content, tags, media, telemetry, linkedBike, linkedRoute, images, mediaUrl } = req.body;

    // 1. Validation: Ensure caption or media exists
    const hasMedia = (media && media.length > 0) || (images && images.length > 0) || mediaUrl || req.file;
    const postContent = caption || content;

    if (!postContent && !hasMedia) {
        return next(new AppError('İçerik veya medya gereklidir.', 400));
    }

    // 2. Media Handling
    let finalMedia = media || [];
    let finalImages = images || [];

    // Ensure array structures
    if (!Array.isArray(finalMedia)) finalMedia = [];
    if (!Array.isArray(finalImages)) finalImages = [];

    // Handle File Upload (Mock)
    if (req.file) {
        const mockUrl = `https://motovibe-storage.com/${req.file.filename}-${Date.now()}.jpg`;
        const type = req.file.mimetype.startsWith('video') ? 'VIDEO' : 'IMAGE';

        finalMedia.push({
            url: mockUrl,
            type: type,
            isHudOverlayActive: false
        });

        if (type === 'IMAGE') {
            finalImages.push(mockUrl);
        }
    }

    // Legacy compatibility: Map 'mediaUrl' string
    if (mediaUrl && typeof mediaUrl === 'string') {
        const type = mediaUrl.match(/\.(mp4|mov|webm)$/i) ? 'VIDEO' : 'IMAGE';

        // Add to media if not exists
        if (!finalMedia.some(m => m.url === mediaUrl)) {
            finalMedia.push({ url: mediaUrl, type: type });
        }

        // Add to images if it's an image
        if (type === 'IMAGE' && !finalImages.includes(mediaUrl)) {
            finalImages.push(mediaUrl);
        }
    }

    // Bi-directional sync: Ensure all 'media' images are in 'images' array
    finalMedia.forEach(m => {
        if (m.type === 'IMAGE' && m.url && !finalImages.includes(m.url)) {
            finalImages.push(m.url);
        }
    });

    // Bi-directional sync: Ensure all 'images' string URLs are in 'media' array
    finalImages.forEach(url => {
        if (!finalMedia.some(m => m.url === url)) {
            finalMedia.push({ url: url, type: 'IMAGE' });
        }
    });

    // 3. Create the Post Document
    const newPost = await Post.create({
        user: req.user.id,
        userName: req.user.name,
        userAvatar: req.user.avatar,
        userRank: req.user.rank,
        caption: postContent,
        content: postContent, // Keep sync
        tags: tags || [],
        media: finalMedia,
        images: finalImages, // Explicitly save legacy array for frontend compatibility

        // Map Telemetry
        telemetry: telemetry ? {
            speed: telemetry.speed,
            leanAngle: telemetry.leanAngle,
            gForce: telemetry.gForce,
            locationLabel: telemetry.locationLabel || telemetry.location,
            distance: telemetry.distance
        } : undefined,

        // Map older rideStats if telemetry provided for backward compat
        rideStats: telemetry ? {
            maxSpeed: telemetry.speed,
            leanAngle: telemetry.leanAngle,
            distance: telemetry.distance
        } : undefined,

        linkedBike,
        linkedRoute,
        location: telemetry?.locationLabel || req.body.location
    });

    // 4. Update Linked Bike Mileage (Optional Micro-feature)
    if (linkedBike && telemetry?.distance) {
        try {
            // Try to find the bike model if it exists
            const Bike = mongoose.models.Bike;
            if (Bike) {
                await Bike.findByIdAndUpdate(linkedBike, {
                    $inc: { mileage: telemetry.distance }
                });
            }
        } catch (error) {
            console.warn("Failed to update bike mileage:", error.message);
        }
    }

    // 5. Populate References
    await newPost.populate('user', 'name avatar rank');
    if (mongoose.models.Bike) await newPost.populate('linkedBike');
    if (mongoose.models.Route) await newPost.populate('linkedRoute');

    // 6. Return Response
    res.status(201).json({
        success: true,
        status: 'success',
        message: "Sürüş kaydı başarıyla paylaşıldı.",
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
    }).select('name username avatar profileImage bike rank').limit(5);

    // Search Rides (Group Rides)
    const rides = await mongoose.model('Ride').find({
        $or: [
            { title: { $regex: q, $options: 'i' } },
            { description: { $regex: q, $options: 'i' } },
            { startLocation: { $regex: q, $options: 'i' } }
        ]
    }).populate('creator', 'name avatar').limit(5);

    // Search Routes (Saved Routes)
    const routes = await mongoose.model('Route').find({
        $or: [
            { title: { $regex: q, $options: 'i' } },
            { location: { $regex: q, $options: 'i' } },
            { tags: { $in: [new RegExp(q, "i")] } }
        ]
    }).limit(5);

    res.status(200).json({
        status: 'success',
        users,
        rides,
        routes,
        hashtags: []
    });
});

export const deletePost = catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new AppError('Post bulunamadı.', 404));
    }

    // Check if user is owner or admin (optional admin override)
    if (post.user.toString() !== req.user.id.toString() && !req.user.isAdmin) {
        return next(new AppError('Bu işlemi yapmaya yetkiniz yok.', 403));
    }

    // Use deleteOne or findByIdAndDelete
    await Post.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});

export const updatePost = catchAsync(async (req, res, next) => {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
        return next(new AppError('Post bulunamadı.', 404));
    }

    if (post.user.toString() !== req.user.id.toString()) {
        return next(new AppError('Bu işlemi yapmaya yetkiniz yok.', 403));
    }

    if (content) post.content = content;

    await post.save();

    res.status(200).json({
        status: 'success',
        data: { post }
    });
});

export const getExplorePosts = catchAsync(async (req, res, next) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { category, q } = req.query;

    let query = {};

    // Filter by Category
    if (category && category !== 'trending') {
        // Assuming 'tags' or a 'category' field. 
        // If your posts don't have categories, you might grep content or tags.
        // For now, let's assume we search tags or content if category is like a tag
        query = {
            $or: [
                { tags: category },
                { content: { $regex: category, $options: 'i' } }
            ]
        };
    }

    // Search Query (Text Search)
    if (q) {
        query = {
            ...query,
            $or: [
                { content: { $regex: q, $options: 'i' } },
                { userName: { $regex: q, $options: 'i' } }
            ]
        };
    }

    // "Trending" logic: Sort by likes/comments instead of date? 
    // For now, let's just stick to date or random for "explore" feel, 
    // but if category is 'trending', maybe sort by likes.
    let sortOptions = { createdAt: -1 };
    if (category === 'trending') {
        sortOptions = { likeCount: -1, createdAt: -1 };
    }

    const posts = await Post.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        // .populate('user', 'name avatar rank') // Removed for performance: utilizing cached user fields
        .lean();

    const total = await Post.countDocuments(query);

    // Add isLiked status if user is logged in
    let postsWithMetadata = posts;
    if (req.user) {
        postsWithMetadata = posts.map(post => ({
            ...post,
            isLiked: post.likes ? post.likes.some(id => id.toString() === req.user.id.toString()) : false
        }));
    }

    res.status(200).json({
        status: 'success',
        results: postsWithMetadata.length,
        total,
        page,
        pages: Math.ceil(total / limit),
        data: { posts: postsWithMetadata }
    });
});
