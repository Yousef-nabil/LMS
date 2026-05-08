import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateKeyBetween } from 'fractional-indexing';
import { CreateContentDto } from './courses.dto';
import { CourseListItemDto } from './dto/course-list-item.dto';

@Injectable()
export class CoursesRepo {
    constructor(private prisma: PrismaService) { }

    // throws 404 if course doesn't exist
    private async assertCourseExists(courseId: bigint): Promise<void> {
        const course = await this.prisma.courses.findUnique({
            where: { id: courseId },
            select: { id: true },
        });
if (!course) {
            throw new NotFoundException(`Course ${courseId} not found`);
        }
        }

    async findAllForEnrollment(offset: number, limit: number, search?: string): Promise<CourseListItemDto[]> {
        const courses = await this.prisma.courses.findMany({
            skip: offset,
            take: limit,
            where: search ? {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ],
            } : {},
            select: {
                id: true,
                title: true,
                description: true,
                price: true,
                thumbnail_url: true,
                created_at: true,
                users: {
                    select: {
                        name: true,
                    },
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return courses.map((course) => ({
            id: course.id.toString(),
            instructorName: course.users.name,
            title: course.title,
            description: course.description,
            price: course.price ? course.price.toString() : null,
            thumbnailUrl: course.thumbnail_url,
            createdAt: course.created_at.toISOString(),
        }));
    }

    async getCourseContent(courseId: bigint) {
        await this.assertCourseExists(courseId);

        return await this.prisma.contents.findMany({
            where: { course_id: courseId },
            orderBy: { position: 'asc' },
        });
    }

    async getCourseEnrollments(courseId: bigint, offset: number, limit: number) {
        await this.assertCourseExists(courseId);

        return await this.prisma.enrollments.findMany({
            where: { course_id: courseId },
            skip: offset,
            take: limit,
            include: {
                courses: true,
                users: { select: { name: true } },
            },
        });
    }

    async getCoursesAnnouncements(courseId: bigint, offset: number, limit: number) {
        await this.assertCourseExists(courseId);

        return await this.prisma.announcements.findMany({
            where: { course_id: courseId },
            skip: offset,
            take: limit,
            include: {
                courses: true,
                users: { select: { name: true } },
            },
        });
    }

    async getCourseAssignments(courseId: bigint, offset: number, limit: number) {
        await this.assertCourseExists(courseId);

        return await this.prisma.assignments.findMany({
            where: { course_id: courseId },
            skip: offset,
            take: limit,
            include: { courses: true },
        });
    }

    async createContent(courseId: bigint, data: CreateContentDto) {
        await this.assertCourseExists(courseId);

        const lastItem = await this.prisma.contents.findFirst({
            where: { course_id: courseId },
            orderBy: { position: 'desc' },
            select: { position: true },
        });

        const newRank = generateKeyBetween(lastItem?.position ?? null, null);

        return this.prisma.contents.create({
            data: {
                ...data,
                course_id: courseId,
                position: newRank,
            },
        });
    }

    async reorderContent(
        courseId: bigint,
        contentId: bigint,
        prevId: bigint | null,
        nextId: bigint | null,
    ) {
        return await this.prisma.$transaction(async (tx) => {

            // item can't be placed relative to itself
            if (prevId !== null && prevId === contentId) {
                throw new BadRequestException('prevId cannot be the same as contentId');
            }
            if (nextId !== null && nextId === contentId) {
                throw new BadRequestException('nextId cannot be the same as contentId');
            }

            // prev and next must be different items
            if (prevId !== null && nextId !== null && prevId === nextId) {
                throw new BadRequestException('prevId and nextId cannot be the same');
            }

            // fetch all three rows in one step
            const [content, prev, next] = await Promise.all([
                tx.contents.findFirst({
                    where: { id: contentId, course_id: courseId },
                }),
                prevId
                    ? tx.contents.findFirst({ where: { id: prevId, course_id: courseId } })
                    : null,
                nextId
                    ? tx.contents.findFirst({ where: { id: nextId, course_id: courseId } })
                    : null,
            ]);

            // validate all three exist in this course
            if (!content) {
                throw new NotFoundException(
                    `Content ${contentId} not found in course ${courseId}`,
                );
            }
            if (prevId && !prev) {
                throw new NotFoundException(
                    `prevId ${prevId} not found in course ${courseId}`,
                );
            }
            if (nextId && !next) {
                throw new NotFoundException(
                    `nextId ${nextId} not found in course ${courseId}`,
                );
            }

            // prev must come before next in the current order
            if (prev && next &&next.position&&prev.position && prev?.position >= next?.position) {
                throw new BadRequestException(
                    'prevId must come before nextId in the current order',
                );
            }

            // generate the new rank between prev and next
            let newRank: string;
            try {
                newRank = generateKeyBetween(
                    prev?.position ?? null,
                    next?.position ?? null,
                );
            } catch {
                throw new BadRequestException(
                    'No space left between the two positions. Please trigger a rebalance.',
                );
            }

            // skip the update if the item is already in the correct position
            if (newRank === content.position) {
                return content;
            }

            // update the item's position in O(1) time
            return await tx.contents.update({
                where: { id: contentId },
                data: { position: newRank },
            });
        });
    }
}