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

export const toggleFollow = catchAsync(async (req, res, next) => {
    if (req.user.id === req.params.id) {
        return next(new AppError('Kendinizi takip edemezsiniz.', 400));
    }

    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow || !currentUser) {
        return next(new AppError('Kullanıcı bulunamadı.', 404));
    }

    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
        // Unfollow
        await User.findByIdAndUpdate(req.user.id, { $pull: { following: req.params.id } });
        await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user.id } });

        res.status(200).json({ status: 'success', message: 'Takipten çıkıldı.' });
    } else {
        // Follow
        await User.findByIdAndUpdate(req.user.id, { $push: { following: req.params.id } });
        await User.findByIdAndUpdate(req.params.id, { $push: { followers: req.user.id } });

        // Notify Target
        sendNotification(req.params.id, 'follow', {
            senderId: req.user.id,
            senderName: req.user.name,
            message: `${req.user.name} seni takip etmeye başladı.`
        });

        res.status(200).json({ status: 'success', message: 'Takip edildi.' });
    }
});

export const getProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
        .populate('followers', 'name avatar')
        .populate('following', 'name avatar')
        .populate('garage');

    if (!user) {
        return next(new AppError('Kullanıcı bulunamadı', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { user }
    });
});

export const getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find().select('-password');
    res.status(200).json(users);
});
