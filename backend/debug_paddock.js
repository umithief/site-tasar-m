
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://umithief:14531453@motovibe.mslnxhq.mongodb.net/?appName=motovibe';

const socialPostSchema = new mongoose.Schema({
    userId: String,
    userName: String,
    content: String,
}, { versionKey: false, collection: 'socialposts' });

const SocialPost = mongoose.models.SocialPost || mongoose.model('SocialPost', socialPostSchema);

async function checkPaddock() {
    console.log('🔍 Connecting to MongoDB...');
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected.');

        const count = await SocialPost.countDocuments();
        console.log(`📊 Total Paddock Posts: ${count}`);

        if (count > 0) {
            const posts = await SocialPost.find().limit(3);
            console.log('📝 First 3 posts:');
            console.log(JSON.stringify(posts, null, 2));
        } else {
            console.log('❌ No posts found in "socialposts" collection.');
            console.log('💡 Tip: server.js seeding logic should populate this if empty on startup.');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('👋 Disconnected.');
    }
}

checkPaddock();
