import { Injectable, ForbiddenException } from '@nestjs/common';
import { InstructorRepo } from './instructor.repo';

@Injectable()
export class InstructorService {
  constructor(private repo: InstructorRepo) {}

  async findCourses(instructorId: bigint) {
    return this.repo.findCoursesByInstructor(instructorId);
  }

  async getCourseOverview(instructorId: bigint, courseId: bigint) {
    return this.repo.getCourseOverview(instructorId, courseId);
  }

  async getCourseStudents(
    instructorId: bigint,
    courseId: bigint,
    offset: number,
    limit: number,
  ) {
    return this.repo.getCourseStudents(instructorId, courseId, offset, limit);
  }

  async getCoursePayments(instructorId: bigint, courseId: bigint) {
    return this.repo.getCoursePayments(instructorId, courseId);
  }
}
