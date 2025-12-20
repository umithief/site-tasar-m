import User from '../models/User.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

// Follow a user
export const followUser = catchAsync(async (req, res, next) => {
    // 1. Check if user is trying to follow themselves
    if (req.params.id === req.user.id) {
        return next(new AppError('You cannot follow yourself.', 400));
    }

    // 2. Add to following list of current user
    const currentUser = await User.findByIdAndUpdate(req.user.id, {
        $addToSet: { following: req.params.id } // $addToSet prevents duplicates
    });

    // 3. Add to followers list of target user
    await User.findByIdAndUpdate(req.params.id, {
        $addToSet: { followers: req.user.id }
    });

    res.status(200).json({
        status: 'success',
        message: 'User followed successfully.'
    });
});

// Unfollow a user
export const unfollowUser = catchAsync(async (req, res, next) => {
    await User.findByIdAndUpdate(req.user.id, {
        $pull: { following: req.params.id }
    });

    await User.findByIdAndUpdate(req.params.id, {
        $pull: { followers: req.user.id }
    });

    res.status(200).json({
        status: 'success',
        message: 'User unfollowed.'
    });
});

export const getProfile = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
        .populate('followers', 'name avatar')
        .populate('following', 'name avatar')
        .populate('garage');

    if (!user) {
        return next(new AppError('No user found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: { user }
    });
});
