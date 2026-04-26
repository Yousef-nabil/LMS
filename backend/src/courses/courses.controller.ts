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
  UseGuards,
} from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/:id/content')
  async getCourseContent(@Param('id') id: string) {
    const courseId = Number(id);
    if (!courseId) {
      throw new BadRequestException('Invalid course Id');
    }
    const data = await this.coursesService.getCourseContent(courseId);
    return { sucess: true, data };
  }

  @Get('/:id/students')
  async getCourseStudents(
    @Param('id') id: string,
    @Query('limit') limit = 10,
    @Query('page') offset = 0,
  ) {
    const courseId = Number(id);
    if (!courseId) {
      throw new BadRequestException('Invalid course Id');
    }
    const data = await this.coursesService.getCourseEnrollments(
      courseId,
      offset,
      limit,
    );
    return { sucess: true, data };
  }

  @Get('/:id/announcements')
  async getCourseAnnouncements(
    @Param('id') id: string,
    @Query('limit') limit = 10,
    @Query('page') offset = 0,
  ) {
    const courseId = Number(id);
    if (!courseId) {
      throw new BadRequestException('Invalid course Id');
    }
    const data = await this.coursesService.getCoursesAnnouncements(
      courseId,
      offset,
      limit,
    );
    return { sucess: true, data };
  }

  @Get('/:id/assignments')
  async getCourseAssignments(
    @Param('id') id: string,
    @Query('limit') limit = 10,
    @Query('page') offset = 0,
  ) {
    const courseId = Number(id);
    if (!courseId) {
      throw new BadRequestException('Invalid course Id');
    }
    const data = await this.coursesService.getCourseAssignments(
      courseId,
      offset,
      limit,
    );
    return { sucess: true, data };
  }

  @Get('/:id/stats')
  async getCourseStats(@Param('id') id: string) {
    return { id, message: 'Course stats retrieved successfully' };
  }

  @Post('/')
  async createCourse() {}

  @Put('/:id/order')
  async updateCourseItemOrder(@Param('id') id: string) {
    const courseId = Number(id);
    if (!courseId) {
      throw new BadRequestException('Invalid course Id');
    }
    const data = await this.coursesService.updateCourseItemOrder(courseId);
    return { success: true, data };
  }

  @Post('/:id/upload')
  async uploadCourseContent(@Param('id') id: string) {}

  @Post('/:id/announcements')
  async createAnnouncement(@Param('id') id: string) {}

  @Delete('/:id/items/:itemId')
  async deleteCourseItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return { id, itemId, message: 'Course item deleted successfully' };
  }

  @Delete('/:id')
  async deleteCourse(@Param('id') id: string) {}

  @Post('/:id/items/:itemId/open')
  async openResource(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {}
}
