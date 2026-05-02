import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersRepo } from './users.repo';

@Module({
  controllers: [UsersController],
  providers: [UsersService,UsersRepo],
  imports:[PrismaModule]
})
export class UsersModule {}
