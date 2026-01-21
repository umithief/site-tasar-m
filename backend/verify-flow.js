
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createPost } from './controllers/postController.js';
import { getLatestActivity } from './controllers/activityController.js';

// Import Models
import User from './models/User.js';
import Post from './models/Post.js';
import RideActivity from './models/RideActivity.js';
import Route from './models/Route.js';

// Mocks
const mockReq = (body = {}, user = {}, params = {}, query = {}) => ({
    body, user, params, query, file: null
});
const mockRes = () => {
    const res = {};
    res.statusCode = 200; // Default
    res.body = null;
    res.status = (code) => { res.statusCode = code; return res; };
    res.json = (data) => { res.body = data; return res; };
    return res;
};
const next = (err) => {
    if (err) {
        console.error("❌ NEXT CALLED WITH ERROR:", err.message);
        // Manually bubble error for script
        throw err;
    }
};

async function runTest() {
    console.log("🚀 Starting Verification...");
    const mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());

    let userId, routeId;

    try {
        // 1. Create User
        console.log("--------------------------------");
        console.log("STEP 1: Create User");
        try {
            const user = await User.create({
                name: 'Test Rider',
                email: 'rider@test.com',
                password: 'password123',
                username: 'testrider'
            });
            userId = user._id;
            console.log("✅ User Created:", userId.toString());
        } catch (e) {
            console.error("❌ User Create Failed:", e);
            throw e;
        }

        // 2. Create Route
        console.log("STEP 2: Create Route");
        try {
            const route = await Route.create({
                title: 'Scenic Coastal Ride',
                author: userId, // Correct field
                location: 'Antalya',
                distance: "25km"
            });
            routeId = route._id;
            console.log("✅ Route Created:", routeId.toString());
        } catch (e) {
            console.error("❌ Route Create Failed:", e);
            throw e;
        }

        // 3. Create Ride Activity
        console.log("STEP 3: Create Ride Activity");
        try {
            const activity = await RideActivity.create({
                user: userId,
                route: routeId,
                distance: 25.5,
                maxSpeed: 120,
                startTime: new Date()
            });
            console.log("✅ Ride Activity Created:", activity._id.toString());
        } catch (e) {
            console.error("❌ Ride Activity Create Failed:", e);
            throw e;
        }

        // 4. Test Activity Controller
        console.log("STEP 4: Test getLatestActivity");
        const reqAct = mockReq({}, { id: userId });
        const resAct = mockRes();
        await getLatestActivity(reqAct, resAct);

        if (resAct.statusCode === 200) {
            console.log("✅ Activity Fetch Status 200");
            if (resAct.body.route && resAct.body.route.title === 'Scenic Coastal Ride') {
                console.log("✅ Route Populated Correctly:", resAct.body.route.title);
            } else {
                console.error("❌ Route Population Failed. Got:", resAct.body.route);
            }
        } else {
            console.error("❌ Activity Fetch Failed with status:", resAct.statusCode, resAct.body);
        }

        // 5. Test Post Creation
        console.log("STEP 5: Test createPost");
        const payload = {
            content: "My Sunday Ride",
            telemetry: {
                speed: 120,
                distance: 25.5,
                route: routeId // Frontend passes full object or ID, but here pretending ID
            },
            linkedRoute: routeId,
            mediaUrl: "http://test.com/img.jpg"
        };
        const reqPost = mockReq(payload, { id: userId, name: "Test Rider", avatar: "av.jpg", rank: "Pro" });
        const resPost = mockRes();

        await createPost(reqPost, resPost, next);

        if (resPost.statusCode === 201) {
            console.log("✅ Post Created Status 201");
            const post = resPost.body.data.post;
            if (post.linkedRoute && post.linkedRoute._id) {
                // populate is called in controller, so it should be an object
                const linkedId = post.linkedRoute._id.toString();
                if (linkedId === routeId.toString()) {
                    console.log("✅ Post Linked to Route Correctly");
                } else {
                    console.log("❌ Linked Route ID Mismatch:", linkedId);
                }
            } else {
                console.log("❌ linkedRoute not populated or missing");
            }

            if (post.media[0].url === "http://test.com/img.jpg") {
                console.log("✅ Media saved correctly");
            }
        } else {
            console.error("❌ Post Create Failed:", resPost.statusCode, resPost.body);
        }

    } catch (error) {
        console.error("🚨 SCRIPT CRASHED:", error);
    } finally {
        await mongoose.disconnect();
        await mongoServer.stop();
        console.log("🏁 Verification Complete");
    }
}

runTest();
