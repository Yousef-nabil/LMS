import { Controller, Get } from '@nestjs/common';
import { CourseListItemDto } from './dto/course-list-item.dto';
import { CoursesService } from './courses.service';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(): Promise<CourseListItemDto[]> {
    return this.coursesService.findAllForEnrollment();
  }
}
