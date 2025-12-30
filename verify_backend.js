import mongoose from 'mongoose';

// Hardcoded URI from server.js (for testing only)
const MONGO_URI = 'mongodb+srv://umithief:14531453@motovibe.mslnxhq.mongodb.net/?appName=motovibe';

async function verify() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected!');

        console.log('--- TEST 1: User.find() ---');
        // Define minimal schema to avoiding model compilation errors if full schema depends on other things
        const userSchema = new mongoose.Schema({ name: String }, { strict: false });
        // Use try-catch for model creation in case it's already defined
        let User;
        try {
            User = mongoose.model('User');
        } catch {
            User = mongoose.model('User', userSchema);
        }

        const users = await User.find().limit(5).select('-password');
        console.log(`User.find() success. Count: ${users.length}`);

        console.log('--- TEST 2: Message Aggregation ---');
        const messageSchema = new mongoose.Schema({}, { strict: false });
        let Message;
        try {
            Message = mongoose.model('Message');
        } catch {
            Message = mongoose.model('Message', messageSchema);
        }

        // We need a valid user ID for the match. Let's use the first user found.
        if (users.length > 0) {
            const userId = users[0]._id;
            console.log(`Using User ID: ${userId}`);

            const threads = await Message.aggregate([
                {
                    $match: {
                        $or: [{ sender: userId }, { receiver: userId }]
                    }
                },
                {
                    $sort: { timestamp: -1 }
                },
                {
                    $group: {
                        _id: {
                            $cond: [
                                { $eq: ["$sender", userId] },
                                "$receiver",
                                "$sender"
                            ]
                        },
                        lastMessage: { $first: "$content" },
                        lastMessageTime: { $first: "$timestamp" }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                {
                    $project: {
                        id: '$_id',
                        userName: '$user.name'
                    }
                }
            ]);
            console.log(`Message aggregation success. Threads: ${threads.length}`);
        } else {
            console.log('Skipping Message test (no users found)');
        }

        console.log('ALL TESTS PASSED');

    } catch (error) {
        console.error('TEST FAILED:', error);
    } finally {
        await mongoose.disconnect();
    }
}

verify();
