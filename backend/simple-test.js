
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import User from './models/User.js';

async function testDB() {
    try {
        console.log("Init MongoServer...");
        const ms = await MongoMemoryServer.create();
        const uri = ms.getUri();
        console.log("Connecting to:", uri);

        await mongoose.connect(uri);
        console.log("Connected. State:", mongoose.connection.readyState);

        const u = await User.create({
            name: 'Test', username: 'test', email: 't@t.com', password: '123'
        });
        console.log("User created:", u._id);

        await mongoose.disconnect();
        await ms.stop();
        console.log("Done.");
    } catch (e) {
        console.error("Error:", e);
    }
}
testDB();
