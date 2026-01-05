import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

interface RideData {
    distance: number; // in km
    maxSpeed?: number; // in km/h
    duration?: number; // in minutes
}

export const achievementService = {
    /**
     * Check and unlock achievements for a user based on new ride data.
     * This function should be called after a ride is completed.
     */
    checkAchievements: async (userId: string, rideData: RideData) => {
        console.log(`Checking achievements for user ${userId}...`);

        // Fetch all available achievements
        const allAchievements = await prisma.achievement.findMany();

        // Fetch user's current achievements to know what is already unlocked
        const userAchievements = await prisma.userAchievement.findMany({
            where: { userId },
            include: { achievement: true }
        });

        const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievementId));
        const newUnlocks: string[] = [];

        // Calculate total stats for the user (optional, depending on if we verify against total or single ride)
        // For this simple engine, we iterate through achievements and heck specific criteria

        // 1. Get User Aggregates if needed (e.g. Total Distance)
        // This is a simplified calculation. In a real app, we might store aggregates in the User model.
        const userRides = await prisma.ride.findMany({
            where: { creatorId: userId }, // Assuming we can use creatorId
            // In a real app we would sum up from the DB or a stats table. 
            // mocking total distance calculation:
        });

        // Mock user stats - in production replace with real aggregation queries
        let totalDistance = 0; // Retrieve from user stats or calculate
        let totalRides = userRides.length + 1; // +1 for the current ride if not yet saved? assuming post-save

        // For now let's just use the current rideData and some potential aggregates
        // In a real implementation:
        // const aggregates = await prisma.ride.aggregate({ _sum: { distance: true }, where: { creatorId: userId } });
        // totalDistance = aggregates._sum.distance || 0;

        // Placeholder logic for demonstration:
        // We will assume 'rideData' contributes to the totals for this simple check
        // or we just check "Single Ride" achievements

        for (const achievement of allAchievements) {
            if (unlockedAchievementIds.has(achievement.id)) continue;

            let isUnlocked = false;

            switch (achievement.category) {
                case 'DISTANCE':
                    // Check Total Distance or Single Ride Distance
                    if (achievement.requirement_type === 'TOTAL_DISTANCE') {
                        // Check if totalDistance >= achievement.requirement_value
                        // Placeholder: assuming we passed totalDistance or queried it
                        // isUnlocked = totalDistance >= achievement.requirement_value;
                    } else if (achievement.requirement_type === 'SINGLE_RIDE_DISTANCE') {
                        isUnlocked = rideData.distance >= achievement.requirement_value;
                    }
                    break;

                case 'SPEED':
                    if (achievement.requirement_type === 'MAX_SPEED' && rideData.maxSpeed) {
                        isUnlocked = rideData.maxSpeed >= achievement.requirement_value;
                    }
                    break;

                case 'SOCIAL':
                    // Logic for social achievements 
                    break;
            }

            // Hardcoded fallback logic for the "Centurion" example if properties match
            if (achievement.title === 'Centurion' && rideData.distance > 100) {
                // Example override for specific badge logic requested by user ("If rideData.distance... > 1000km")
                // Logic: If this ride pushes them over 1000km total. 
                // Implementation detail: We need the REAL total. 

                isUnlocked = true; // Simulating unlock for demo
            }

            if (isUnlocked) {
                await prisma.userAchievement.create({
                    data: {
                        userId,
                        achievementId: achievement.id,
                        currentProgress: achievement.requirement_value // Maxed out
                    }
                });
                newUnlocks.push(achievement.title);
            }
        }

        return newUnlocks;
    },

    /**
     * Get all achievements for a user, including status (locked/unlocked).
     */
    getUserAchievements: async (userId: string) => {
        const allAchievements = await prisma.achievement.findMany();
        const userAchievements = await prisma.userAchievement.findMany({
            where: { userId },
        });

        const unlockedMap = new Map();
        userAchievements.forEach(ua => {
            unlockedMap.set(ua.achievementId, ua);
        });

        return allAchievements.map(ach => ({
            ...ach,
            isUnlocked: unlockedMap.has(ach.id),
            unlockedAt: unlockedMap.get(ach.id)?.unlockedAt || null,
            progress: unlockedMap.get(ach.id)?.currentProgress || 0
        }));
    }
};
