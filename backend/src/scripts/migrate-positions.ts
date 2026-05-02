import { PrismaClient } from '@prisma/client';
import { generateKeyBetween } from 'fractional-indexing';

const prisma = new PrismaClient();

async function main() {
    const allCourseIds = await prisma.contents.findMany({
        select: { course_id: true },
        distinct: ['course_id'],
    });

    for (const { course_id } of allCourseIds) {
        // Get all contents for this course, ordered by their current integer position
        const contents = await prisma.contents.findMany({
            where: { course_id },
            orderBy: { position: 'asc' },
        });

        // Generate valid fractional keys in order
        let prevKey: string | null = null;
        for (const content of contents) {
            const newKey = generateKeyBetween(prevKey, null);
            await prisma.contents.update({
                where: { id: content.id },
                data: { position: newKey },
            });
            prevKey = newKey;
        }

        console.log(`✅ Migrated ${contents.length} contents for course ${course_id}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());