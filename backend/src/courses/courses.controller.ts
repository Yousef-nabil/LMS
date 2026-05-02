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
import { ReorderContentDto } from './courses.dto';

// parse course ID from string and validate it's a positive integer, then convert to bigint
function parseCourseId(id: string, label = 'Course ID'): bigint {
    const n = Number(id);
    if (!Number.isInteger(n) || n <= 0) {
        throw new BadRequestException(`${label} must be a positive integer`);
    }
    return BigInt(id);
}

@Controller('courses')
export class CoursesController {
    constructor(private readonly coursesService: CoursesService) { }

    // @UseGuards(JwtAuthGuard)
    @Get('/:id/content')
    async getCourseContent(@Param('id') id: string) {
        const courseId = parseCourseId(id);
        const data = await this.coursesService.getCourseContent(courseId);
        return { success: true, data };
    }

    @Get('/:id/students')
    async getCourseStudents(
        @Param('id') id: string,
        @Query('limit') limit = 10,
        @Query('page') page = 1,
    ) {
        const courseId = parseCourseId(id);

        const limitNum = Number(limit);
        const pageNum = Number(page);
        if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
            throw new BadRequestException('limit must be an integer between 1 and 100');
        }
        if (!Number.isInteger(pageNum) || pageNum < 1) {
            throw new BadRequestException('page must be a positive integer');
        }

        const offset = (pageNum - 1) * limitNum;
        const data = await this.coursesService.getCourseEnrollments(courseId, offset, limitNum);
        return { success: true, data };
    }

    @Get('/:id/announcements')
    async getCourseAnnouncements(
        @Param('id') id: string,
        @Query('limit') limit = 10,
        @Query('page') page = 1,
    ) {
        const courseId = parseCourseId(id);

        const limitNum = Number(limit);
        const pageNum = Number(page);
        if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
            throw new BadRequestException('limit must be an integer between 1 and 100');
        }
        if (!Number.isInteger(pageNum) || pageNum < 1) {
            throw new BadRequestException('page must be a positive integer');
        }

        const offset = (pageNum - 1) * limitNum;
        const data = await this.coursesService.getCoursesAnnouncements(courseId, offset, limitNum);
        return { success: true, data };
    }

    @Get('/:id/assignments')
    async getCourseAssignments(
        @Param('id') id: string,
        @Query('limit') limit = 10,
        @Query('page') page = 1,
    ) {
        const courseId = parseCourseId(id);

        const limitNum = Number(limit);
        const pageNum = Number(page);
        if (!Number.isInteger(limitNum) || limitNum < 1 || limitNum > 100) {
            throw new BadRequestException('limit must be an integer between 1 and 100');
        }
        if (!Number.isInteger(pageNum) || pageNum < 1) {
            throw new BadRequestException('page must be a positive integer');
        }

        const offset = (pageNum - 1) * limitNum;
        const data = await this.coursesService.getCourseAssignments(courseId, offset, limitNum);
        return { success: true, data };
    }

    @Get('/:id/stats')
    async getCourseStats(@Param('id') id: string) {
        parseCourseId(id); // validate only
        return { id, message: 'Course stats retrieved successfully' };
    }

    @Post('/')
    async createCourse() { }

    @Put('/:id/reorder')
    async reorderContent(
        @Param('id') courseId: string,
        @Body() body: ReorderContentDto,
    ) {
        const parsedCourseId = parseCourseId(courseId);

        // prevId and nextId cannot both be null — that means "move nowhere"
        if (body.prevId == null && body.nextId == null) {
          throw new BadRequestException('At least one of prevId or nextId must be provided');
        }

        return this.coursesService.reorderContent(
            parsedCourseId,
            BigInt(body.contentId),
            body.prevId != null ? BigInt(body.prevId) : null,
            body.nextId != null ? BigInt(body.nextId) : null,
        );
    }

    @Post('/:id/upload')
    async uploadCourseContent(@Param('id') id: string) {
        parseCourseId(id);
    }

    @Post('/:id/announcements')
    async createAnnouncement(@Param('id') id: string) {
        parseCourseId(id);
    }

    @Delete('/:id/items/:itemId')
    async deleteCourseItem(
        @Param('id') id: string,
        @Param('itemId') itemId: string,
    ) {
        parseCourseId(id);
        parseCourseId(itemId, 'Item ID');
        return { id, itemId, message: 'Course item deleted successfully' };
    }

    @Delete('/:id')
    async deleteCourse(@Param('id') id: string) {
        parseCourseId(id);
    }

    @Post('/:id/items/:itemId/open')
    async openResource(
        @Param('id') id: string,
        @Param('itemId') itemId: string,
    ) {
        parseCourseId(id);
        parseCourseId(itemId, 'Item ID');
    }
}