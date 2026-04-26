import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CoursesRepo {
    constructor(private prisma: PrismaService) { }
    async getCourseContent(courseId: number) {
        return await this.prisma.contents.findMany({
            where: {
                course_id: courseId,
            },
        });
    }
    async getCourseEntrollments(courseId: number, offset: number, limit: number) {
        return await this.prisma.enrollments.findMany({
            where: {
                course_id: courseId,
            },
            skip: offset,
            take: limit,
            include: {
                courses: true,
                users: {
                    select: {
                        name: true,
                    },
                },
            },
        });
    }
    async getCoursesAnnouncements(
        courseId: number,
        offset: number,
        limit: number,
    ) {
        return await this.prisma.announcements.findMany({
            where: {
                course_id: courseId,
            },
            skip: offset,
            take: limit,
            include: {
                courses: true,
                users: {
                    select: {
                        name: true,
                    },
                },
            },
        });
    }
    async getCourseAssignments(courseId: number, offset: number, limit: number) {
        return await this.prisma.assignments.findMany({
            where: {
                course_id: courseId,
            },
            skip: offset,
            take: limit,
            include: {
                courses: true,
            },
        });
    }
    async updateCourseItemOrder(courseId: number, order: number) {
        await this.prisma.$transaction(async (tx) => {
            await tx.contents.updateMany({
                where: {
                    order: courseId,
                    position: { gte: order }
                },  
                data: {
                    position: { increment: 1 }
                }
            });

            await tx.contents.update({
                where: { id: courseId },
                data: { position: order }
            });
        });
    }
}
