import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class InstructorRepo {
  constructor(private prisma: PrismaService) {}

  private async assertOwnsCourse(instructorId: bigint, courseId: bigint) {
    const course = await this.prisma.courses.findUnique({
      where: { id: courseId },
      select: { instructor_id: true },
    });
    if (!course) throw new NotFoundException(`Course ${courseId} not found`);
    if (BigInt(course.instructor_id) !== instructorId)
      throw new ForbiddenException('Not authorized for this course');
  }

  async findCoursesByInstructor(instructorId: bigint) {
    const courses = await this.prisma.courses.findMany({
      where: { instructor_id: instructorId },
      include: {
        _count: { select: { enrollments: true } },
        payments: { where: { status: 'completed' }, select: { amount: true } },
      },
      orderBy: { created_at: 'desc' },
    });

    return courses.map((c) => ({
      id: c.id.toString(),
      title: c.title,
      price: c.price ? c.price.toString() : null,
      enrollmentsCount: c._count?.enrollments ?? 0,
      revenue: (c.payments ?? [])
        .reduce((s, p) => s + Number(p.amount), 0)
        .toFixed(2),
      createdAt: c.created_at.toISOString(),
    }));
  }

  async getCourseOverview(instructorId: bigint, courseId: bigint) {
    await this.assertOwnsCourse(instructorId, courseId);

    const [enrollmentsCount, revenueAgg, recentEnrollments, recentSubmissions] =
      await Promise.all([
        this.prisma.enrollments.count({ where: { course_id: courseId } }),
        this.prisma.payments.aggregate({
          _sum: { amount: true },
          where: { course_id: courseId, status: 'completed' },
        }),
        this.prisma.enrollments.findMany({
          where: { course_id: courseId },
          orderBy: { enrollment_date: 'desc' },
          take: 5,
          include: { users: { select: { id: true, name: true, email: true } } },
        }),
        this.prisma.submissions.findMany({
          where: { assignments: { course_id: courseId } },
          orderBy: { submission_date: 'desc' },
          take: 5,
          include: {
            users: { select: { id: true, name: true } },
            assignments: true,
          },
        }),
      ]);

    return {
      enrollmentsCount,
      revenue: (revenueAgg._sum.amount ?? 0).toString(),
      recentEnrollments: recentEnrollments.map((e) => ({
        id: e.id.toString(),
        student: {
          id: e.student_id.toString(),
          name: e.users?.name,
          email: e.users?.email,
        },
        date: e.enrollment_date.toISOString(),
      })),
      recentSubmissions: recentSubmissions.map((s) => ({
        id: s.id.toString(),
        studentId: s.student_id.toString(),
        assignmentId: s.assignment_id.toString(),
        score: s.auto_graded_score ? s.auto_graded_score.toString() : null,
        date: s.submission_date.toISOString(),
      })),
    };
  }

  async getCourseStudents(
    instructorId: bigint,
    courseId: bigint,
    offset: number,
    limit: number,
  ) {
    await this.assertOwnsCourse(instructorId, courseId);

    const rows = await this.prisma.enrollments.findMany({
      where: { course_id: courseId },
      skip: offset,
      take: limit,
      include: { users: true },
      orderBy: { enrollment_date: 'desc' },
    });

    return rows.map((r) => ({
      id: r.id.toString(),
      studentId: r.student_id.toString(),
      name: r.users?.name,
      email: r.users?.email,
      enrolledAt: r.enrollment_date.toISOString(),
    }));
  }

  async getCoursePayments(instructorId: bigint, courseId: bigint) {
    await this.assertOwnsCourse(instructorId, courseId);
    const rows = await this.prisma.payments.findMany({
      where: { course_id: courseId },
      orderBy: { transaction_date: 'desc' },
      include: { users: { select: { id: true, name: true, email: true } } },
    });
    return rows.map((r) => ({
      id: r.id.toString(),
      studentId: r.student_id.toString(),
      studentName: r.users?.name ?? null,
      studentEmail: r.users?.email ?? null,
      amount: r.amount.toString(),
      status: r.status,
      date: r.transaction_date.toISOString(),
    }));
  }
}
