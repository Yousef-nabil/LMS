import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateKeyBetween } from 'fractional-indexing';
import {
    BadRequestException,
    NotFoundException,
} from '@nestjs/common';

@Injectable()
export class CoursesRepo {
    constructor(private prisma: PrismaService) { }

    async getCourseContent(courseId: bigint) {
        return await this.prisma.contents.findMany({
            where: { course_id: courseId },
            orderBy: { position: 'asc' },
        });
    }

    async getCourseEnrollments(courseId: bigint, offset: number, limit: number) {
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
        return await this.prisma.assignments.findMany({
            where: { course_id: courseId },
            skip: offset,
            take: limit,
            include: { courses: true },
        });
    }

    async createContent(courseId: bigint, data: any) {
        const lastItem = await this.prisma.contents.findFirst({
            where: { course_id: courseId },
            orderBy: { position: 'desc' },
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


            // if prevId and nextId are equal to contentId, that means the item is trying to be moved relative to itself, which is a no-op and likely a client error
            if (prevId === contentId || nextId === contentId) {
                throw new BadRequestException(
                    'prevId and nextId cannot be the same as contentId',
                );
            }

            // prevId and nextId can't be the same
            if (prevId !== null && nextId !== null && prevId === nextId) {
                throw new BadRequestException('prevId and nextId cannot be the same');
            }

            // the content being moved must exist and belong to the specified course
            const content = await tx.contents.findFirst({
                where: { id: contentId, course_id: courseId },
            });
            if (!content) {
                throw new NotFoundException(
                    `Content ${contentId} not found in course ${courseId}`,
                );
            }

            // verify prevId and nextId belong to the same course 
            const [prev, next] = await Promise.all([
                prevId
                    ? tx.contents.findFirst({ where: { id: prevId, course_id: courseId } })
                    : null,
                nextId
                    ? tx.contents.findFirst({ where: { id: nextId, course_id: courseId } })
                    : null,
            ]);

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

            // prevId must come before nextId in the current order
            if (prev && next && prev.position >= next.position) {
                throw new BadRequestException(
                    'prevId must come before nextId in the current order',
                );
            }

            // generate a new position between prev and next
            let newRank: string;
            try {
                newRank = generateKeyBetween(
                    prev?.position ?? null,
                    next?.position ?? null,
                );
            } catch {
                // fractional-indexing throws when there is no space left between
                // two adjacent keys — this should be extremely rare with rebalancing
                throw new BadRequestException(
                    'No space left between the two positions. Please trigger a rebalance.',
                );
            }

            // if the new rank leads to the same position then there's no need to update
            if (newRank === content.position) {
                return content; // nothing to do
            }

            // update the content with the new position in O(1) time
            return await tx.contents.update({
                where: { id: contentId },
                data: { position: newRank },
            });
        });
    }
}