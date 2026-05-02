import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAllForEnrollment() {
    return this.prisma.courses.findMany({
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
  }
}
