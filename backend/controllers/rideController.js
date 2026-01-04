import Ride from '../models/Ride.js';
import User from '../models/User.js'; // Ensure User model is imported if needed for queries
import { CreateRideSchema } from '../validations/schemas.js';
import { z } from 'zod';

export const createRide = async (req, res) => {
    try {
        const user = req.user;
        const body = CreateRideSchema.parse(req.body);

        // Fallback user finding logic for MongoDB
        let creatorId = 'user_123';
        if (user) {
            creatorId = user._id || user.id;
        } else {
            // Find first admin or user as fallback
            const fallbackUser = await User.findOne();
            if (fallbackUser) creatorId = fallbackUser._id;
        }

        const ride = await Ride.create({
            title: body.title,
            description: body.description,
            startTime: new Date(body.startTime),
            difficulty: body.difficulty,
            route: body.route,
            maxParticipants: body.maxParticipants || 10,
            creatorId: creatorId
        });

        // Populate creator info
        // Note: In Mongoose, we usually populate in a separate query or aggregate if needed immediately, 
        // but for creation response, basic data is often enough or we can do:
        // await ride.populate('creator', 'name avatar'); 
        // Assuming 'creator' virtual or simple fetch. 
        // For now, returning the ride object.

        res.status(201).json(ride);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error("Create Ride Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const getRides = async (req, res) => {
    try {
        const rides = await Ride.find({
            startTime: { $gte: new Date() }
        })
            .sort({ startTime: 1 })
            .limit(50)
        // Manual "populate" since we store creatorId as String matching Supabase/Custom ID, 
        // not necessarily an ObjectId if relying on external auth.
        // However, if we migrated User to Mongoose fully, we can use populate.
        // Let's assume logical linking for now or basic populate if reference is set up.
        // .populate('creatorId', 'name avatar'); 

        // For this specific codebase, users seem to be in MongoDB, so we can try to fetch creator details manually
        // or if creatorId is the _id.
        // Let's iterate and attach creator info wrapper if needed, but for MVP standard find is okay.

        // Improve: Fetch creators manually to attach author info
        const creatorIds = [...new Set(rides.map(r => r.creatorId))];
        const creators = await User.find({ _id: { $in: creatorIds } }).select('name avatar username');
        const creatorMap = creators.reduce((acc, curr) => ({ ...acc, [curr._id]: curr }), {});

        const ridesWithCreator = rides.map(ride => ({
            ...ride.toObject(),
            creator: creatorMap[ride.creatorId] || { name: 'Unknown', avatar: '' }
        }));

        res.status(200).json(ridesWithCreator);
    } catch (error) {
        console.error("Get Rides Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
