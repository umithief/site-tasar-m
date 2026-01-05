import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient() as any;

async function main() {
    const achievements = [
        {
            title: 'Centurion',
            description: 'Ride a total of 1000km',
            icon_key: 'trophy',
            category: 'DISTANCE',
            requirement_type: 'TOTAL_DISTANCE',
            requirement_value: 1000,
        },
        {
            title: 'Speed Demon',
            description: 'Reach a speed of 100km/h',
            icon_key: 'zap',
            category: 'SPEED',
            requirement_type: 'MAX_SPEED',
            requirement_value: 100,
        },
        {
            title: 'Explorer',
            description: 'Complete 10 rides',
            icon_key: 'map',
            category: 'DISTANCE',
            requirement_type: 'RIDE_COUNT',
            requirement_value: 10,
        },
        {
            title: 'Social Butterfly',
            description: 'Participate in 5 group events',
            icon_key: 'medal',
            category: 'SOCIAL',
            requirement_type: 'EVENT_COUNT',
            requirement_value: 5,
        },
    ];

    for (const ach of achievements) {
        await prisma.achievement.create({
            data: ach,
        });
    }

    console.log('Achievements seeded!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
