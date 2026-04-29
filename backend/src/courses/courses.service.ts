import { Injectable } from '@nestjs/common';
import { CoursesRepository } from './courses.repository';
import { CourseListItemDto } from './dto/course-list-item.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly coursesRepo: CoursesRepository) {}

  async findAllForEnrollment(): Promise<CourseListItemDto[]> {
    const courses = await this.coursesRepo.findAllForEnrollment();

    return courses.map((course) => ({
      instructorName: course.users.name,
      title: course.title,
      description: course.description,
      price: course.price ? course.price.toString() : null,
      createdAt: course.created_at.toISOString(),
    }));
  }
}
