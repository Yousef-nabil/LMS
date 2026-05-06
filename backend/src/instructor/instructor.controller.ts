import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { InstructorService } from './instructor.service';

function parseId(raw: string, label = 'ID'): bigint {
  const n = Number(raw);
  if (!Number.isInteger(n) || n <= 0) {
    throw new BadRequestException(`${label} must be a positive integer`);
  }

  return BigInt(raw);
}

function parsePagination(
  limit: unknown,
  page: unknown,
): { offset: number; limitNum: number } {
  const limitNum = Number(limit);
  const pageNum = Number(page);

  if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
    throw new BadRequestException('limit must be an integer between 1 and 100');
  }

  if (!Number.isInteger(pageNum) || pageNum < 1) {
    throw new BadRequestException('page must be a positive integer');
  }

  return { offset: (pageNum - 1) * limitNum, limitNum };
}

@UseGuards(JwtAuthGuard)
@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get('courses')
  async getCourses(@Req() req) {
    const userId = BigInt(req.user?.sub);
    const data = await this.instructorService.findCourses(userId);
    return { success: true, data };
  }

  @Get('courses/:id/overview')
  async getCourseOverview(@Req() req, @Param('id') id: string) {
    const userId = BigInt(req.user?.sub);
    const courseId = parseId(id, 'Course ID');
    const data = await this.instructorService.getCourseOverview(
      userId,
      courseId,
    );
    return { success: true, data };
  }

  @Get('courses/:id/students')
  async getCourseStudents(
    @Req() req,
    @Param('id') id: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    const userId = BigInt(req.user?.sub);
    const courseId = parseId(id, 'Course ID');
    const { offset, limitNum } = parsePagination(limit, page);

    const data = await this.instructorService.getCourseStudents(
      userId,
      courseId,
      offset,
      limitNum,
    );
    return { success: true, data };
  }

  @Get('courses/:id/payments')
  async getCoursePayments(@Req() req, @Param('id') id: string) {
    const userId = BigInt(req.user?.sub);
    const courseId = parseId(id, 'Course ID');
    const data = await this.instructorService.getCoursePayments(
      userId,
      courseId,
    );
    return { success: true, data };
  }
}
