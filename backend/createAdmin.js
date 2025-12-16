import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// User Schema (Must match server.js)
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    joinDate: { type: String, default: () => new Date().toLocaleDateString('tr-TR') },
    phone: String,
    address: String,
    points: { type: Number, default: 0 },
    rank: { type: String, default: 'Scooter Çırağı' }
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

const createAdmin = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected to MongoDB');

        const adminEmail = process.env.ADMIN_EMAIL || 'admin@motovibe.tr';
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

        // Check if admin exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('⚠️ Admin user already exists.');

            // Optional: Update password if you want to force reset
            // const salt = await bcrypt.genSalt(10);
            // existingAdmin.password = await bcrypt.hash(adminPassword, salt);
            // existingAdmin.isAdmin = true;
            // await existingAdmin.save();
            // console.log('✅ Admin password/status updated.');

            process.exit(0);
        }

        // Create new admin
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);

        const newAdmin = new User({
            name: 'MotoVibe Admin',
            email: adminEmail,
            password: hashedPassword,
            isAdmin: true,
            rank: 'MotoVibe Master'
        });

        await newAdmin.save();
        console.log(`✅ Admin user created successfully: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);

    } catch (error) {
        console.error('❌ Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

createAdmin();
