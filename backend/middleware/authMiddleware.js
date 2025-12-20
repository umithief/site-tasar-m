import jwt from 'jsonwebtoken';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';
import User from '../models/User.js';

export const protect = catchAsync(async (req, res, next) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new AppError('Giriş yapmanız gerekiyor.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli-anahtar-123');

    const currentUser = await User.findById(decoded.id);

    if (!currentUser) {
        return next(
            new AppError('Bu tokena ait kullanıcı artık mevcut değil.', 401)
        );
    }

    req.user = currentUser;
    next();
});
