import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourseListItemDto } from './dto/course-list-item.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForEnrollment(): Promise<CourseListItemDto[]> {
    const courses = await this.prisma.courses.findMany({
      select: {
        title: true,
        description: true,
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

    return courses.map((course) => ({
      instructorName: course.users.name,
      title: course.title,
      description: course.description,
      price: course.price ? course.price.toString() : null,
      createdAt: course.created_at.toISOString(),
    }));
  }
}
