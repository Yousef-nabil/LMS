import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CoursesRepo } from './courses.repo';
import { SupabaseService } from '../common/services/supabase.service';

@Module({
  imports: [PrismaModule, EnrollmentsModule],
  controllers: [CoursesController],
  providers: [CoursesService, CoursesRepo, SupabaseService],
})
export class CoursesModule {}
