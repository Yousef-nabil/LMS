import { BadRequestException, Injectable } from '@nestjs/common';
import { CoursesRepo } from './courses.repo';
import { CreateContentDto, CreateCourseDto, UpdateCourseDto } from './courses.dto';

@Injectable()
export class CoursesService {
  constructor(private coursesRepo: CoursesRepo) {}

  async getCourseContentForUser(courseId: bigint, userId: bigint) {
    return await this.coursesRepo.getCourseContentForUser(courseId, userId);
  }

  async getCourseEnrollments(courseId: bigint, offset: number, limit: number) {
    return await this.coursesRepo.getCourseEnrollments(courseId, offset, limit);
  }

  async getCoursesAnnouncements(
    courseId: bigint,
    offset: number,
    limit: number,
  ) {
    return await this.coursesRepo.getCoursesAnnouncements(
      courseId,
      offset,
      limit,
    );
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

  async findAllForEnrollment(offset: number, limit: number, search?: string) {
    return await this.coursesRepo.findAllForEnrollment(offset, limit, search);
  }

  async findMyEnrolledCourses(
    userId: bigint,
    offset: number,
    limit: number,
    search?: string,
  ) {
    return await this.coursesRepo.findMyEnrolledCourses(
      userId,
      offset,
      limit,
      search,
    );
  }

  async findById(courseId: bigint) {
    return await this.coursesRepo.findById(courseId);
  }

  async findByInstructorId(instructorId: bigint) {
    return await this.coursesRepo.findByInstructorId(instructorId);
  }

  async createCourse(instructorId: bigint, data: CreateCourseDto) {
    return await this.coursesRepo.createCourse(instructorId, data);
  }

  async updateCourse(courseId: bigint, instructorId: bigint, data: UpdateCourseDto) {
    return await this.coursesRepo.updateCourse(courseId, instructorId, data);
  }

  async deleteCourse(courseId: bigint, instructorId: bigint) {
    return await this.coursesRepo.deleteCourse(courseId, instructorId);
  }

  async deleteContent(courseId: bigint, instructorId: bigint, contentId: bigint) {
    const course = await this.coursesRepo.findById(courseId);
    
    const courseRaw = await this.coursesRepo.findByInstructorId(instructorId);
    if (!courseRaw.find(c => c.id === courseId.toString())) {
       throw new BadRequestException('You are not authorized to delete content from this course');
    }

    return await this.coursesRepo.deleteContent(courseId, contentId);
  }
}
