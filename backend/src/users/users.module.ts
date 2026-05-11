import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { UsersRepo } from './users.repo';
import { SupabaseStorageService } from 'src/common/storage/supabase-storage.service';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepo, SupabaseStorageService],
  imports: [PrismaModule],
})
export class UsersModule {}
