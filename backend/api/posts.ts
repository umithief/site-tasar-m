import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { CreatePostSchema } from '../validations/schemas';
import { z } from 'zod';

// Assuming a shared Prisma instance
const prisma = new PrismaClient();

// Middleware stub
const requireAuth = (req: any) => {
    // Check session/token
    return { id: 'user_123' }; // Mock user
};

export const createPostHandler = async (req: Request, res: Response) => {
    try {
        // 1. Auth Check
        const user = requireAuth(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        // 2. Input Validation
        const body = CreatePostSchema.parse(req.body);

        // 3. Image Upload (Mock Cloudinary/S3 Integration)
        // const imageUrl = await uploadToCloudinary(req.file); 
        const imageUrl = "https://images.unsplash.com/photo-1558980394-4c7c9299fe96?w=800&auto=format&fit=crop&q=60"; // Mock result

        // 4. Save to DB
        const post = await prisma.post.create({
            data: {
                content: body.content,
                locationName: body.locationName,
                rideId: body.rideId,
                imageUrl: imageUrl,
                userId: user.id,
            },
            include: {
                user: true, // Return user details
            }
        });

        return res.status(201).json(post);

    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ errors: error.issues });
        }
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};
