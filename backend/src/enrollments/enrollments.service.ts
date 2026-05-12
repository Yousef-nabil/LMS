import { Injectable } from '@nestjs/common';
import { EnrollmentsRepo } from './enrollments.repo';
import {
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
} from './enrollments.dto';
import { EnrollmentListItemDto } from './dto/enrollment-list-item.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private enrollmentsRepo: EnrollmentsRepo) {}

  async findById(enrollmentId: bigint): Promise<EnrollmentListItemDto> {
    return this.enrollmentsRepo.findById(enrollmentId);
  }

  async findByStudentId(
    studentId: bigint,
    offset: number,
    limit: number,
  ): Promise<EnrollmentListItemDto[]> {
    return this.enrollmentsRepo.findByStudentId(studentId, offset, limit);
  }

  async findByCourseId(
    courseId: bigint,
    offset: number,
    limit: number,
  ): Promise<EnrollmentListItemDto[]> {
    return this.enrollmentsRepo.findByCourseId(courseId, offset, limit);
  }

  async findEnrollment(
    studentId: bigint,
    courseId: bigint,
  ): Promise<EnrollmentListItemDto | null> {
    return this.enrollmentsRepo.findEnrollment(studentId, courseId);
  }

  async createEnrollment(
    studentId: bigint,
    courseId: bigint,
    data: CreateEnrollmentDto,
  ): Promise<EnrollmentListItemDto> {
    return this.enrollmentsRepo.createEnrollment(studentId, courseId, data);
  }

  async deleteEnrollment(
    enrollmentId: bigint,
    studentId: bigint,
  ): Promise<void> {
    return this.enrollmentsRepo.deleteEnrollment(enrollmentId, studentId);
  }

  async deleteEnrollmentByCourseAndStudent(
    courseId: bigint,
    studentId: bigint,
  ): Promise<void> {
    return this.enrollmentsRepo.deleteEnrollmentByCourseAndStudent(
      courseId,
      studentId,
    );
  }

  async updateEnrollment(
    enrollmentId: bigint,
    studentId: bigint,
    data: UpdateEnrollmentDto,
  ): Promise<EnrollmentListItemDto> {
    return this.enrollmentsRepo.updateEnrollment(
      enrollmentId,
      studentId,
      data,
    );
  }

  async getEnrollmentCount(courseId: bigint): Promise<number> {
    return this.enrollmentsRepo.getEnrollmentCount(courseId);
  }
}