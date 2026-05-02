import { Injectable } from '@nestjs/common';
import { CoursesRepo } from './courses.repo';
import { CreateContentDto } from './courses.dto';

@Injectable()
export class CoursesService {
  constructor(
    private coursesRepo: CoursesRepo,
  ) {}

  async getCourseContent(courseId: bigint) {
    return await this.coursesRepo.getCourseContent(courseId);
  }

  async getCourseEnrollments(courseId: bigint, offset: number, limit: number) {
    return await this.coursesRepo.getCourseEnrollments(courseId, offset, limit);
  }

  async getCoursesAnnouncements(courseId: bigint, offset: number, limit: number) {
    return await this.coursesRepo.getCoursesAnnouncements(courseId, offset, limit);
  }

  async getCourseAssignments(courseId: bigint, offset: number, limit: number) {
    return await this.coursesRepo.getCourseAssignments(courseId, offset, limit);
  }

  async createContent(courseId: bigint, data: CreateContentDto) {
    return await this.coursesRepo.createContent(courseId, data);
  }

  async reorderContent(
    courseId: bigint,
    contentId: bigint,
    prevId: bigint | null,
    nextId: bigint | null,
  ) {
    return await this.coursesRepo.reorderContent(
      courseId,
      contentId,
      prevId,
      nextId,
    );
  }

  async findAllForEnrollment() {
    return await this.coursesRepo.findAllForEnrollment();
  }
}