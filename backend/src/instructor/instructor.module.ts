import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { InstructorController } from './instructor.controller';
import { InstructorService } from './instructor.service';
import { InstructorRepo } from './instructor.repo';

@Module({
  imports: [PrismaModule],
  controllers: [InstructorController],
  providers: [InstructorService, InstructorRepo],
  exports: [InstructorService],
})
export class InstructorModule {}
