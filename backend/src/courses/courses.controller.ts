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
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import express from 'express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { CoursesService } from './courses.service';
import { SupabaseService } from '../common/services/supabase.service';
import { ReorderContentDto, CreateContentDto, CreateCourseDto, UpdateCourseDto } from './courses.dto';
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
    throw new BadRequestException(
      'limit must be an integer between 1 and 100',
    );
  }

  if (!Number.isInteger(pageNum) || pageNum < 1) {
    throw new BadRequestException('page must be a positive integer');
  }

  return {
    offset: (pageNum - 1) * limitNum,
    limitNum,
  };
}

@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(
    private readonly coursesService: CoursesService,
    private readonly supabaseService: SupabaseService,
  ) {}

  // from development branch
  @Get()
  async findAll(): Promise<CourseListItemDto[]> {
    return this.coursesService.findAllForEnrollment();
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    const courseId = parseId(id, 'Course ID');
    const data = await this.coursesService.findById(courseId);

    return {
      success: true,
      data,
    };
  }

  @Get('/:id/content')
  async getCourseContent(@Param('id') id: string) {
    const courseId = parseId(id, 'Course ID');
    const data = await this.coursesService.getCourseContent(courseId);

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

  @Get('/instructor/my-courses')
  async getInstructorCourses(@Req() req: express.Request) {
    const instructorId = BigInt((req.user as any).sub);
    const data = await this.coursesService.findByInstructorId(instructorId);

    return {
      success: true,
      data,
    };
  }

  @Post('/')
  @UseInterceptors(FileInterceptor('thumbnail'))
  async createCourse(
    @Req() req: express.Request,
    @Body() body: CreateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const instructorId = BigInt((req.user as any).sub);
    const safeBody = body || {};
    let thumbnailUrl = safeBody.thumbnailUrl;

    if (file) {
      const result = await this.supabaseService.uploadFile(file);
      thumbnailUrl = result.url;
    }

    const data = await this.coursesService.createCourse(instructorId, {
      ...safeBody,
      thumbnailUrl,
    });

    return {
      success: true,
      data,
    };
  }

  @Put('/:id')
  @UseInterceptors(FileInterceptor('thumbnail'))
  async updateCourse(
    @Param('id') id: string,
    @Req() req: express.Request,
    @Body() body: UpdateCourseDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const courseId = parseId(id, 'Course ID');
    const instructorId = BigInt((req.user as any).sub);
    const safeBody = body || {};
    let thumbnailUrl = safeBody.thumbnailUrl;

    if (file) {
      const result = await this.supabaseService.uploadFile(file);
      thumbnailUrl = result.url;
    }

    const data = await this.coursesService.updateCourse(
      courseId,
      instructorId,
      {
        ...safeBody,
        thumbnailUrl,
      },
    );

    return {
      success: true,
      data,
    };
  }

  @Post('/:id/upload')
  @UseInterceptors(FileFieldsInterceptor([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ], {
    limits: {
      fileSize: 1024 * 1024 * 1024, // 1 GB
    }
  }))
  async uploadCourseContent(
    @Param('id') id: string,
    @Body() body: CreateContentDto,
    @UploadedFiles() files: { file?: Express.Multer.File[], thumbnail?: Express.Multer.File[] },
  ) {
    const courseId = parseId(id, 'Course ID');
    let fileUrl: string | undefined = undefined;
    let fileSize: number | undefined = undefined;
    let thumbnailUrl: string | undefined = undefined;

    const mainFile = files.file?.[0];
    const thumbFile = files.thumbnail?.[0];

    if (mainFile) {
      const result = await this.supabaseService.uploadFile(mainFile);
      fileUrl = result.url;
      fileSize = result.size;
    }

    if (thumbFile) {
      const result = await this.supabaseService.uploadFile(thumbFile);
      thumbnailUrl = result.url;
    }

    return this.coursesService.createContent(courseId, {
      ...body,
      fileUrl,
      fileSize,
      thumbnailUrl,
    });
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
    @Req() req: express.Request,
  ) {
    const courseId = parseId(id, 'Course ID');
    const contentId = parseId(itemId, 'Item ID');
    const instructorId = BigInt((req.user as any).sub);

    await this.coursesService.deleteContent(courseId, instructorId, contentId);

    return {
      success: true,
      message: 'Course item deleted successfully',
    };
  }

  @Delete('/:id')
  async deleteCourse(@Param('id') id: string, @Req() req: express.Request) {
    const courseId = parseId(id, 'Course ID');
    const instructorId = BigInt((req.user as any).sub);

    await this.coursesService.deleteCourse(courseId, instructorId);

    return {
      success: true,
      message: 'Course deleted successfully',
    };
  }

  @Post('/:id/items/:itemId/open')
  async openResource(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    parseId(id, 'Course ID');
    parseId(itemId, 'Item ID');
  }
}