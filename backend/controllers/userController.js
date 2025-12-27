import mongoose from 'mongoose';
import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'gizli-anahtar-123', {
        expiresIn: process.env.JWT_EXPIRES_IN || '30d'
    });
};

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user
        }
    });
};

// --- AUTH CONTROLLERS ---

export const registerUser = catchAsync(async (req, res, next) => {
    const { name, email, password, username } = req.body;

    // Basic validation
    if (!name || !email || !password) {
        return next(new AppError('Lütfen isim, e-posta ve şifre girin.', 400));
    }

    // Check existing
    const userExists = await User.findOne({ email });
    if (userExists) {
        return next(new AppError('Bu e-posta zaten kullanımda.', 400));
    }

    // Hash is handled in Model pre-save hook?
    // Wait, the User model I created in Step 1077 has standard assignment.
    // I need to ensure hashing is done.
    // The previous implementation in Step 1048's architecture *document* had a pre-save hook.
    // The *actual file* I wrote in Step 1077 did *not* have the pre-save hook for hashing explicitly written in the code content provided in the response (it just had helper `correctPassword`).
    // Wait, checking Step 1077 output...
    // "CodeContent: ... password: { type: String, required: true } ... userSchema.methods.correctPassword..."
    // It did NOT verify hashing on save.
    // I must hash it here manually or update the model. Refactoring model is better, but controller-based hashing is requested in prompt: "registerUser: Password hashing with bcrypt".

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
        name,
        email,
        username,
        password: hashedPassword
    });

    createSendToken(newUser, 201, res);
});

export const loginUser = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return next(new AppError('Lütfen e-posta ve şifre girin.', 400));
    }

    const user = await User.findOne({ email }); // Password is not selected by default? Model didn't set select: false.
    // If Model set select: false, I'd need .select('+password').
    // Step 1077 model: password: { type: String, required: true } (No select: false)

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new AppError('Hatalı e-posta veya şifre.', 401));
    }

    createSendToken(user, 200, res);
});

// --- SOCIAL CONTROLLERS ---

import { sendNotification } from '../socket.js'; // Ensure this is imported

export const toggleFollow = catchAsync(async (req, res, next) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return next(new AppError('Geçersiz Kullanıcı ID.', 400));
    }

    if (req.user.id === req.params.id) {
        return next(new AppError('Kendinizi takip edemezsiniz.', 400));
    }

    const { id: targetUserId } = req.params;
    const currentUserId = req.user.id;

    const currentUser = await User.findById(currentUserId);
    const targetUser = await User.findById(targetUserId);

    if (!targetUser || !currentUser) {
        return next(new AppError('Kullanıcı bulunamadı.', 404));
    }

    // Check if already following
    // Convert to string for reliable comparison (ObjectId vs String)
    const isFollowing = currentUser.following.some(id => id.toString() === targetUserId.toString());

    if (isFollowing) {
        // Unfollow
        await User.findByIdAndUpdate(currentUserId, { $pull: { following: targetUserId } });
        await User.findByIdAndUpdate(targetUserId, { $pull: { followers: currentUserId } });

        res.status(200).json({
            status: 'success',
            message: 'Takipten çıkıldı.',
            data: { isFollowing: false }
        });
    } else {
        // Follow (addToSet avoids duplicates naturally, but our check handles logic flow)
        await User.findByIdAndUpdate(currentUserId, { $addToSet: { following: targetUserId } });
        await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: currentUserId } });

        // Real-time Notification
        // Emit 'new_follower' specifically as requested
        const io = await import('../socket.js').then(m => m.getIO()).catch(() => null);
        if (io) {
            io.to(targetUserId.toString()).emit('new_follower', {
                followerId: currentUserId,
                followerName: req.user.name,
                followerAvatar: req.user.avatar
            });

            // Allow general notification as well for notification center
            sendNotification(targetUserId, 'follow', {
                senderId: currentUserId,
                senderName: req.user.name,
                message: `${req.user.name} seni takip etmeye başladı.`
            });
        }

        res.status(200).json({
            status: 'success',
            message: isFollowing ? 'Takip edildi.' : 'Takipten çıkıldı.',
            data: {
                isFollowing,
                followersCount: targetUser.followers.length,
                followingCount: currentUser.following.length
            }
        });
    }
});

export const getProfile = catchAsync(async (req, res, next) => {
    // Validate ID format to prevent CastError
    if (!mongoose.isValidObjectId(req.params.id)) {
        return next(new AppError('Kullanıcı bulunamadı (Geçersiz ID)', 404));
    }

    const user = await User.findById(req.params.id)
        .populate('followers', 'name avatar')
        .populate('following', 'name avatar')
        .populate('garage');

    if (!user) {
        return next(new AppError('Kullanıcı bulunamadı', 404));
    }

    const userObj = user.toObject();
    userObj.followersCount = user.followers.length;
    userObj.followingCount = user.following.length;

    res.status(200).json({
        status: 'success',
        data: { user: userObj }
    });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find().select('-password');
    res.status(200).json(users);
});

// --- GARAGE CONTROLLERS ---

export const addToGarage = catchAsync(async (req, res, next) => {
    const { brand, model, year, image } = req.body;

    if (!brand || !model) {
        return next(new AppError('Marka ve model gereklidir.', 400));
    }

    const user = await User.findByIdAndUpdate(
        req.user.id,
        {
            $push: {
                garage: { brand, model, year, image: image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=800' }
            }
        },
        { new: true, runValidators: true }
    );

    res.status(200).json({
        status: 'success',
        data: { garage: user.garage }
    });
});

export const removeFromGarage = catchAsync(async (req, res, next) => {
    const { garageId } = req.params;

    const user = await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { garage: { _id: garageId } } },
        { new: true }
    );

    res.status(200).json({
        status: 'success',
        data: { garage: user.garage }
    });
});

// --- CART CONTROLLERS ---

export const getCart = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).select('cart');
    res.status(200).json({
        status: 'success',
        data: { cart: user.cart }
    });
});

export const addToCart = catchAsync(async (req, res, next) => {
    const { productId, name, price, image, quantity = 1 } = req.body;

    // Check if item exists
    const user = await User.findById(req.user.id);
    const existingItemIndex = user.cart.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
        // Update quantity
        user.cart[existingItemIndex].quantity += quantity;
    } else {
        // Add new
        user.cart.push({ productId, name, price, image, quantity });
    }

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
        status: 'success',
        data: { cart: user.cart }
    });
});

export const removeFromCart = catchAsync(async (req, res, next) => {
    const { productId } = req.params;

    // Using pull to remove item
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { cart: { productId } } },
        { new: true }
    );

    res.status(200).json({
        status: 'success',
        data: { cart: user.cart }
    });
});

export const updateCartItem = catchAsync(async (req, res, next) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    const user = await User.findById(req.user.id);
    const item = user.cart.find(item => item.productId === productId);

    if (item) {
        item.quantity = quantity;
        await user.save({ validateBeforeSave: false });
    }

    res.status(200).json({
        status: 'success',
        data: { cart: user.cart }
    });
});
