import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateKeyBetween } from 'fractional-indexing';
import { CreateContentDto, CreateCourseDto, UpdateCourseDto } from './courses.dto';
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

    private mapToDto(course: any): CourseListItemDto {
        return {
            id: course.id.toString(),
            instructorName: course.users?.name || '',
            title: course.title,
            description: course.description,
            thumbnailUrl: course.thumbnail_url,
            price: course.price ? course.price.toString() : null,
            createdAt: course.created_at.toISOString(),
            enrollmentsCount: course._count?.enrollments,
        };
    }

    async findById(courseId: bigint): Promise<CourseListItemDto> {
        const course = await this.prisma.courses.findUnique({
            where: { id: courseId },
            include: {
                _count: {
                    select: { enrollments: true }
                },
                users: {
                    select: { name: true }
                }
            },
        });

        if (!course) {
            throw new NotFoundException(`Course ${courseId} not found`);
        }

        return this.mapToDto(course);
    }

    async findAllForEnrollment(): Promise<CourseListItemDto[]> {
        const courses = await this.prisma.courses.findMany({
            select: {
                id: true,
                title: true,
                description: true,
                thumbnail_url: true,
                price: true,
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

        return courses.map((course) => this.mapToDto(course));
    }

    async findByInstructorId(instructorId: bigint): Promise<CourseListItemDto[]> {
        const courses = await this.prisma.courses.findMany({
            where: { instructor_id: instructorId },
            include: {
                _count: {
                    select: { enrollments: true }
                },
                users: {
                    select: { name: true }
                }
            },
            orderBy: { created_at: 'desc' },
        });

        return courses.map((course) => this.mapToDto(course));
    }

    async createCourse(instructorId: bigint, data: CreateCourseDto): Promise<CourseListItemDto> {
        if (!data) {
            console.error('createCourse: data is undefined', { instructorId });
            throw new BadRequestException('Course data is required');
        }
        const { thumbnailUrl, ...rest } = data;
        const course = await this.prisma.courses.create({
            data: {
                ...rest,
                thumbnail_url: thumbnailUrl,
                instructor_id: instructorId,
            },
            include: {
                users: { select: { name: true } },
                _count: { select: { enrollments: true } },
            },
        });
        return this.mapToDto(course);
    }

    async updateCourse(courseId: bigint, instructorId: bigint, data: UpdateCourseDto): Promise<CourseListItemDto> {
        if (!data) {
            console.error('updateCourse: data is undefined', { courseId, instructorId });
            throw new BadRequestException('Update data is required');
        }
        const course = await this.prisma.courses.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            throw new NotFoundException(`Course ${courseId} not found`);
        }

        if (course.instructor_id !== instructorId) {
            throw new BadRequestException('You are not authorized to update this course');
        }

        const { thumbnailUrl, ...rest } = data;
        const updated = await this.prisma.courses.update({
            where: { id: courseId },
            data: {
                ...rest,
                thumbnail_url: thumbnailUrl,
            },
            include: {
                users: { select: { name: true } },
                _count: { select: { enrollments: true } },
            },
        });
        return this.mapToDto(updated);
    }

    async deleteCourse(courseId: bigint, instructorId: bigint) {
        const course = await this.prisma.courses.findUnique({
            where: { id: courseId },
        });

        if (!course) {
            throw new NotFoundException(`Course ${courseId} not found`);
        }

        if (course.instructor_id !== instructorId) {
            throw new BadRequestException('You are not authorized to delete this course');
        }

        return await this.prisma.courses.delete({
            where: { id: courseId },
        });
    }

    async getCourseContent(courseId: bigint) {
        await this.assertCourseExists(courseId);

        return await this.prisma.contents.findMany({
            where: { course_id: courseId },
            orderBy: { position: 'asc' },
        });
    }

    async deleteContent(courseId: bigint, contentId: bigint) {
        await this.assertCourseExists(courseId);

        return await this.prisma.contents.delete({
            where: {
                id: contentId,
                course_id: courseId,
            },
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

        const { fileUrl, fileSize, thumbnailUrl, ...rest } = data;

        return this.prisma.contents.create({
            data: {
                ...rest,
                file_url: fileUrl,
                file_size: fileSize,
                thumbnail_url: thumbnailUrl,
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