import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { EnrollmentListItemDto } from './dto/enrollment-list-item.dto';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from './enrollments.dto';

@Injectable()
export class EnrollmentsRepo {
  constructor(private prisma: PrismaService) { }

  private async assertEnrollmentExists(
    enrollmentId: bigint,
  ): Promise<void> {
    const enrollment = await this.prisma.enrollments.findUnique({
      where: { id: enrollmentId },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment ${enrollmentId} not found`,
      );
    }
  }

  private mapToDto(enrollment: any): EnrollmentListItemDto {
    return {
      id: enrollment.id.toString(),
      studentId: enrollment.student_id.toString(),
      studentName: enrollment.users?.name || '',
      courseId: enrollment.course_id.toString(),
      courseTitle: enrollment.courses?.title || '',
      paymentId: enrollment.payment_id?.toString() || null,
      enrollmentDate: enrollment.enrollment_date.toISOString(),
    };
  }

  async findById(
    enrollmentId: bigint,
  ): Promise<EnrollmentListItemDto> {
    const enrollment = await this.prisma.enrollments.findUnique({
      where: { id: enrollmentId },
      include: {
        users: {
          select: { name: true },
        },
        courses: {
          select: { title: true },
        },
      },
    });

    if (!enrollment) {
      throw new NotFoundException(
        `Enrollment ${enrollmentId} not found`,
      );
    }

    return this.mapToDto(enrollment);
  }

  async findByStudentId(
    studentId: bigint,
    offset: number,
    limit: number,
  ): Promise<EnrollmentListItemDto[]> {
    const enrollments = await this.prisma.enrollments.findMany({
      where: { student_id: studentId },
      skip: offset,
      take: limit,
      include: {
        courses: {
          include: {
            _count: {
              select: { enrollments: true },
            },
            users: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: { enrollment_date: 'desc' },
    });

    return enrollments.map((enrollment) =>
      this.mapToDto(enrollment),
    );
  }

  async findByCourseId(
    courseId: bigint,
    offset: number,
    limit: number,
  ): Promise<EnrollmentListItemDto[]> {
    const enrollments = await this.prisma.enrollments.findMany({
      where: { course_id: courseId },
      skip: offset,
      take: limit,
      include: {
        users: {
          select: { name: true },
        },
      },
      orderBy: { enrollment_date: 'desc' },
    });

    return enrollments.map((enrollment) =>
      this.mapToDto(enrollment),
    );
  }

  async findEnrollment(
    studentId: bigint,
    courseId: bigint,
  ): Promise<EnrollmentListItemDto | null> {
    const enrollment = await this.prisma.enrollments.findUnique({
      where: {
        student_id_course_id: {
          student_id: studentId,
          course_id: courseId,
        },
      },
      include: {
        users: { select: { name: true } },
        courses: { select: { title: true } },
      },
    });

    if (!enrollment) return null;
    return this.mapToDto(enrollment);
  }

  async createEnrollment(
    studentId: bigint,
    courseId: bigint,
    data: CreateEnrollmentDto,
  ): Promise<EnrollmentListItemDto> {
    // Check for existing enrollment
    const existing = await this.prisma.enrollments.findUnique({
      where: {
        student_id_course_id: {
          student_id: studentId,
          course_id: courseId,
        },
      },
    });

    if (existing) {
      throw new BadRequestException(
        'You are already enrolled in this course',
      );
    }

    // Verify course exists and is published
    const course = await this.prisma.courses.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }
    /*
        if (!course.is_published) {
          throw new ForbiddenException(
            'This course is not available for enrollment',
          );
        }
    */
    const { courseId: _courseId, ...restData } = data;
    const enrollment = await this.prisma.enrollments.create({
      data: {
        ...restData,
        student_id: studentId,
        course_id: courseId,
        payment_id: null,
      },
      include: {
        users: { select: { name: true } },
        courses: { select: { title: true } },
      },
    });

    return this.mapToDto(enrollment);
  }

  async deleteEnrollment(
    enrollmentId: bigint,
    studentId: bigint,
  ): Promise<void> {
    await this.assertEnrollmentExists(enrollmentId);

    const enrollment = await this.prisma.enrollments.findUnique({
      where: { id: enrollmentId },
    });

    if (enrollment?.student_id !== studentId) {
      throw new ForbiddenException(
        'You are not authorized to unenroll from this course',
      );
    }

    await this.prisma.enrollments.delete({
      where: { id: enrollmentId },
    });
  }

  async deleteEnrollmentByCourseAndStudent(
    courseId: bigint,
    studentId: bigint,
  ): Promise<void> {
    const enrollment = await this.prisma.enrollments.findUnique({
      where: {
        student_id_course_id: {
          student_id: studentId,
          course_id: courseId,
        },
      },
    });

    if (enrollment) {
      await this.prisma.enrollments.delete({
        where: { id: enrollment.id },
      });
    }
  }

  async updateEnrollment(
    enrollmentId: bigint,
    studentId: bigint,
    data: UpdateEnrollmentDto,
  ): Promise<EnrollmentListItemDto> {
    await this.assertEnrollmentExists(enrollmentId);

    const enrollment = await this.prisma.enrollments.findUnique({
      where: { id: enrollmentId },
    });

    if (enrollment?.student_id !== studentId) {
      throw new ForbiddenException(
        'You are not authorized to update this enrollment',
      );
    }

    const updated = await this.prisma.enrollments.update({
      where: { id: enrollmentId },
      data: {
        status: data.status,
      } as any,
      include: {
        users: { select: { name: true } },
        courses: { select: { title: true } },
      },
    });

    return this.mapToDto(updated);
  }

  async getEnrollmentCount(courseId: bigint): Promise<number> {
    return this.prisma.enrollments.count({
      where: { course_id: courseId },
    });
  }
}