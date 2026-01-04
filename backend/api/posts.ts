import { NextApiRequest, NextApiResponse } from 'next';
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    try {
        // 1. Auth Check
        const user = requireAuth(req);
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        // 2. Input Validation
        const body = CreatePostSchema.parse(req.body);

        // 3. Image Upload (Mock Cloudinary/S3 Integration)
        // const imageUrl = await uploadToCloudinary(req.file); 
        const imageUrl = "https://via.placeholder.com/600"; // Mock result

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
            return res.status(400).json({ errors: error.errors });
        }
        console.error(error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
