import { Injectable } from '@nestjs/common';
import { CoursesRepo } from './courses.repo';

@Injectable()
export class CoursesService {
  constructor(private coursesRepo: CoursesRepo) {}
  async getCourseContent(courseId: number) {
    return await this.coursesRepo.getCourseContent(courseId);
  }
  async getCourseEnrollments(courseId: number, offset: number, limit: number) {
    return await this.coursesRepo.getCourseEntrollments(
      courseId,
      offset,
      limit,
    );
  }
  async getCoursesAnnouncements(
    courseId: number,
    offset: number,
    limit: number,
  ) {
    return await this.coursesRepo.getCoursesAnnouncements(
      courseId,
      offset,
      limit,
    );
  }
  async getCourseAssignments(courseId: number, offset: number, limit: number) {
    return await this.coursesRepo.getCourseAssignments(courseId, offset, limit);
  }
  async updateCourseItemOrder(courseId: number) {
    return await this.coursesRepo.updateCourseItemOrder(courseId);
  }
}
