import { PrismaClient } from '@prisma/client';
import { CreateRideSchema } from '../validations/schemas.js';
import { z } from 'zod';

const prisma = new PrismaClient();

export const createRide = async (req, res) => {
    try {
        // Mock Auth - In real app use req.user from middleware
        // const user = req.user; 
        // For now, using admin or first user found? 
        // Or if protect middleware is used, req.user is available.
        // Assuming protect middleware is used:
        const user = req.user;

        if (!user) {
            // Fallback for dev if auth middleware bypassed or not working yet
            // return res.status(401).json({ message: 'Unauthorized' });
        }

        const body = CreateRideSchema.parse(req.body);

        const ride = await prisma.ride.create({
            data: {
                title: body.title,
                description: body.description,
                startTime: new Date(body.startTime),
                difficulty: body.difficulty,
                route: body.route,
                maxParticipants: body.maxParticipants || 10,
                // If user is set, use user.id, otherwise hardcode for dev/demo if allowed
                // If user is set, use user.id, otherwise find a fallback user or use a specific ID
                creatorId: user ? (user._id || user.id) : (await prisma.user.findFirst())?.id || 'manual_fix_needed',
            },
            include: {
                creator: true,
                _count: { select: { posts: true } }
            }
        });

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
        const rides = await prisma.ride.findMany({
            orderBy: { startTime: 'asc' },
            where: {
                startTime: { gte: new Date() }
            },
            include: {
                creator: true
            },
            take: 50
        });
        res.status(200).json(rides);
    } catch (error) {
        console.error("Get Rides Error:", error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
