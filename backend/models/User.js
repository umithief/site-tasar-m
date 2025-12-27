import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    username: { type: String, unique: true, trim: true, sparse: true }, // Added username
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // select: false breaks some existing auth logic if not careful, keeping generic for now
    avatar: { type: String, default: 'default-avatar.png' },
    bio: { type: String, maxlength: 150 },

    isAdmin: { type: Boolean, default: false },
    joinDate: { type: String, default: () => new Date().toLocaleDateString('tr-TR') },
    phone: String,
    address: String,
    points: { type: Number, default: 0 },
    rank: { type: String, default: 'Scooter Çırağı' },

    // Premium Moto Data
    garage: [{
        brand: String,
        model: String,
        year: Number,
        image: String
    }],

    // Shopping Cart
    cart: [{
        productId: String,
        name: String,
        price: Number,
        image: String,
        quantity: { type: Number, default: 1 }
    }],

    // Social Graph
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    // Settings
    isPremium: { type: Boolean, default: false }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    versionKey: false
});

// Helper to check password
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.models.User || mongoose.model('User', userSchema);
export default User;
