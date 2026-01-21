
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createPost } from './controllers/postController.js';
import { getLatestActivity } from './controllers/activityController.js';

import User from './models/User.js';
import Route from './models/Route.js';
import RideActivity from './models/RideActivity.js';
import Post from './models/Post.js';

// Controller Wrapper to handle async/void return
const runController = (controllerFn, req, res) => {
    return new Promise((resolve, reject) => {
        // Intercept res.json and res.send to resolve
        const originalJson = res.json;
        res.json = (data) => {
            res.body = data;
            originalJson.call(res, data); // verify structure
            resolve(res);
            return res;
        };
        const originalStatus = res.status;
        res.status = (code) => {
            res.statusCode = code;
            return res; // maintain chain
        };

        // Mock Next to reject
        const next = (err) => {
            if (err) reject(err);
        };

        // Call the controller
        // Note: controllerFn(req, res, next) returns void usually because of catchAsync
        // But the internal async fn starts running.
        // We wait for res.json() to be called.
        try {
            const result = controllerFn(req, res, next);
            // If it returns a promise (some implementations do), we can use it, but safe to ignore
        } catch (e) {
            reject(e);
        }
    });
};

const mockRes = () => {
    const res = {};
    res.statusCode = 200;
    res.body = null;
    res.status = function (code) { this.statusCode = code; return this; };
    res.json = function (data) { this.body = data; return this; };
    return res;
};

const mockReq = (body = {}, user = {}) => ({ body, user, file: null });

async function verify() {
    let mongoServer;
    try {
        console.log("🚀 Starting Robust Verification...");
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri());

        // 1. Setup Data
        const user = await User.create({ name: 'Tester', username: 'test', email: 'test@t.com', password: '123' });
        const route = await Route.create({ title: 'Test Route', author: user._id });
        const activity = await RideActivity.create({
            user: user._id, route: route._id, distance: 10, startTime: new Date(), maxSpeed: 100
        });
        console.log("✅ Data Setup Complete");

        // 2. Test getLatestActivity
        const req1 = mockReq({}, { id: user._id });
        const res1 = mockRes();
        await runController(getLatestActivity, req1, res1);

        if (res1.statusCode === 200 && res1.body.route && res1.body.route.title === 'Test Route') {
            console.log("✅ getLatestActivity: Route Populated!");
        } else {
            throw new Error(`getLatestActivity Failed: ${JSON.stringify(res1.body)}`);
        }

        // 3. Test createPost
        const req2 = mockReq({
            content: "Hello",
            telemetry: { speed: 100, distance: 10, route: route._id }, // Frontend format
            linkedRoute: route._id,
            mediaUrl: "http://img.com/a.jpg"
        }, { id: user._id, name: 'Tester', avatar: 'x', rank: 'Noob' });
        const res2 = mockRes();

        await runController(createPost, req2, res2);

        if (res2.statusCode === 201) {
            console.log("✅ createPost: Success 201");
            const post = res2.body.data.post;

            // Deep Check
            const dbPost = await Post.findById(post._id);
            if (dbPost.linkedRoute && dbPost.linkedRoute.toString() === route._id.toString()) {
                console.log("✅ createPost: LinkedRoute Verified in DB!");
            } else {
                console.error("❌ createPost: LinkedRoute Missing in DB", dbPost);
            }
            if (dbPost.media[0].url === "http://img.com/a.jpg" && dbPost.images[0] === "http://img.com/a.jpg") {
                console.log("✅ createPost: Media/Images Sync Verified!");
            } else {
                console.error("❌ createPost: Media Sync Failed", dbPost.media);
            }

        } else {
            throw new Error(`createPost Failed: ${JSON.stringify(res2.body)}`);
        }

    } catch (e) {
        console.error("🚨 FAIL:", e);
    } finally {
        if (mongoServer) {
            await mongoose.disconnect();
            await mongoServer.stop();
        }
    }
}

verify();
