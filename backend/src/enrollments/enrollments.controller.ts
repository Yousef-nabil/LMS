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

import { EnrollmentsService } from './enrollments.service';
import {
  CreateEnrollmentDto,
  UpdateEnrollmentDto,
} from './enrollments.dto';
import { EnrollmentListItemDto } from './dto/enrollment-list-item.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

function parseId(raw: string, label = 'ID'): bigint {
  const n = Number(raw);

  if (!Number.isInteger(n) || n <= 0) {
    throw new BadRequestException(
      `${label} must be a positive integer`,
    );
  }

  return BigInt(raw);
}

function parseAuthenticatedUserId(req: Request): bigint {
  const userId = (req as any)?.user?.sub;

  if (!userId) {
    throw new BadRequestException(
      'Authenticated user is missing',
    );
  }

  return parseId(String(userId), 'User ID');
}

@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(
    private readonly enrollmentsService: EnrollmentsService,
  ) { }

  @Post('/')
  async enroll(
    @Req() req: Request,
    @Body() body: CreateEnrollmentDto,
  ): Promise<{ success: boolean; data: EnrollmentListItemDto }> {
    const studentId = parseAuthenticatedUserId(req);
    const courseId = parseId(body.courseId, 'Course ID');

    const data = await this.enrollmentsService.createEnrollment(
      studentId,
      courseId,
      body,
    );
    console.log(data);
    return {
      success: true,
      data,
    };
  }

  @Delete('/:id')
  async unenroll(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<{ success: boolean; message: string }> {
    const enrollmentId = parseId(id, 'Enrollment ID');
    const studentId = parseAuthenticatedUserId(req);

    await this.enrollmentsService.deleteEnrollment(enrollmentId, studentId);

    return {
      success: true,
      message: 'Successfully unenrolled from the course',
    };
  }

  @Put('/:id')
  async updateEnrollment(
    @Param('id') id: string,
    @Req() req: Request,
    @Body() body: UpdateEnrollmentDto,
  ): Promise<{ success: boolean; data: EnrollmentListItemDto }> {
    const enrollmentId = parseId(id, 'Enrollment ID');
    const studentId = parseAuthenticatedUserId(req);

    const data = await this.enrollmentsService.updateEnrollment(
      enrollmentId,
      studentId,
      body,
    );

    return {
      success: true,
      data,
    };
  }

  @Get('/:courseId/check')
  async checkEnrollment(
    @Param('courseId') courseId: string,
    @Req() req: Request,
  ): Promise<{
    success: boolean;
    data: { isEnrolled: boolean; enrollment: EnrollmentListItemDto | null };
  }> {
    const studentId = parseAuthenticatedUserId(req);
    const courseIdBig = parseId(courseId, 'Course ID');

    const enrollment = await this.enrollmentsService.findEnrollment(
      studentId,
      courseIdBig,
    );

    return {
      success: true,
      data: {
        isEnrolled: enrollment !== null,
        enrollment,
      },
    };
  }
}