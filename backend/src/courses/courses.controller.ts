import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';

import { CoursesService } from './courses.service';
import { ReorderContentDto, CreateContentDto } from './courses.dto';
import { CourseListItemDto } from './dto/course-list-item.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

// parse and validate a single ID param, throwing 400 if invalid
function parseId(raw: string, label = 'ID'): bigint {
  const n = Number(raw);

  if (!Number.isInteger(n) || n <= 0) {
    throw new BadRequestException(`${label} must be a positive integer`);
  }

  return BigInt(raw);
}

// parse and validate pagination params
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

  return {
    offset: (pageNum - 1) * limitNum,
    limitNum,
  };
}

function parseAuthenticatedUserId(req: Request): bigint {
  const userId = (req as any)?.user?.sub;

  if (!userId) {
    throw new BadRequestException('Authenticated user is missing');
  }

  return parseId(String(userId), 'User ID');
}

@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  async findAll(
    @Query('limit') limit = 6,
    @Query('page') page = 1,
    @Query('search') search?: string,
  ): Promise<CourseListItemDto[]> {
    const { offset, limitNum } = parsePagination(limit, page);
    return this.coursesService.findAllForEnrollment(offset, limitNum, search);
  }

  @Get('/me/enrolled')
  async findMyEnrolledCourses(
    @Req() req: Request,
    @Query('limit') limit = 6,
    @Query('page') page = 1,
    @Query('search') search?: string,
  ): Promise<CourseListItemDto[]> {
    const { offset, limitNum } = parsePagination(limit, page);
    const userId = parseAuthenticatedUserId(req);

    return this.coursesService.findMyEnrolledCourses(
      userId,
      offset,
      limitNum,
      search,
    );
  }

  @Get('/:id/content')
  async getCourseContent(@Param('id') id: string, @Req() req: Request) {
    const courseId = parseId(id, 'Course ID');
    const userId = parseAuthenticatedUserId(req);
    const data = await this.coursesService.getCourseContentForUser(
      courseId,
      userId,
    );

    return { success: true, data };
  }

  @Get('/:id/students')
  async getCourseStudents(
    @Param('id') id: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    const courseId = parseId(id, 'Course ID');
    const { offset, limitNum } = parsePagination(limit, page);

    const data = await this.coursesService.getCourseEnrollments(
      courseId,
      offset,
      limitNum,
    );

    return { success: true, data };
  }

  @Get('/:id/announcements')
  async getCourseAnnouncements(
    @Param('id') id: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    const courseId = parseId(id, 'Course ID');
    const { offset, limitNum } = parsePagination(limit, page);

    const data = await this.coursesService.getCoursesAnnouncements(
      courseId,
      offset,
      limitNum,
    );

    return { success: true, data };
  }

  @Get('/:id/assignments')
  async getCourseAssignments(
    @Param('id') id: string,
    @Query('limit') limit = 10,
    @Query('page') page = 1,
  ) {
    const courseId = parseId(id, 'Course ID');
    const { offset, limitNum } = parsePagination(limit, page);

    const data = await this.coursesService.getCourseAssignments(
      courseId,
      offset,
      limitNum,
    );

    return { success: true, data };
  }

  @Get('/:id/stats')
  async getCourseStats(@Param('id') id: string) {
    const courseId = parseId(id, 'Course ID');

    return {
      courseId: courseId.toString(),
      message: 'Course stats retrieved successfully',
    };
  }

  @Post('/')
  async createCourse() {}

  @Post('/:id/upload')
  async uploadCourseContent(
    @Param('id') id: string,
    @Body() body: CreateContentDto,
  ) {
    const courseId = parseId(id, 'Course ID');

    return this.coursesService.createContent(courseId, body);
  }

  @Put('/:id/reorder')
  async reorderContent(
    @Param('id') courseId: string,
    @Body() body: ReorderContentDto,
  ) {
    return this.coursesService.reorderContent(
      parseId(courseId, 'Course ID'),
      BigInt(body.contentId),
      body.prevId != null ? BigInt(body.prevId) : null,
      body.nextId != null ? BigInt(body.nextId) : null,
    );
  }

  @Post('/:id/announcements')
  async createAnnouncement(@Param('id') id: string) {
    parseId(id, 'Course ID');
  }

  @Delete('/:id/items/:itemId')
  async deleteCourseItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    const courseId = parseId(id, 'Course ID');
    const contentId = parseId(itemId, 'Item ID');

    return {
      courseId: courseId.toString(),
      contentId: contentId.toString(),
      message: 'Course item deleted successfully',
    };
  }

  @Delete('/:id')
  async deleteCourse(@Param('id') id: string) {
    parseId(id, 'Course ID');
  }

  @Post('/:id/items/:itemId/open')
  async openResource(@Param('id') id: string, @Param('itemId') itemId: string) {
    parseId(id, 'Course ID');
    parseId(itemId, 'Item ID');
  }
}
