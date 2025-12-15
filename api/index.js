import app from '../backend/server.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

// Cached connection for Vercel cold starts
let isConnected = false;

export default async function handler(req, res) {
    if (!isConnected) {
        try {
            await mongoose.connect(MONGO_URI);
            isConnected = true;
            console.log("✅ Vercel: MongoDB Connected");
        } catch (error) {
            console.error("❌ Vercel: MongoDB Connection Error", error);
            // Don't crash, let the app try to handle or fail request
        }
    }

    return app(req, res);
}
