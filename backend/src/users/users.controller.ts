import {
  Controller,
  Get,
  UseGuards,
  Req,
  Patch,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { SupabaseStorageService } from 'src/common/storage/supabase-storage.service';

const profilePictureUploadOptions = {
  storage: memoryStorage(),
  fileFilter: (_req: Request, file: any, callback: any) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(
        new BadRequestException('Profile picture must be an image'),
        false,
      );
      return;
    }

    callback(null, true);
  },
};

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  @Get('/info')
  async userInfo(@Req() req: Request) {
    const userId = Number((req as any).user?.sub);
    return { data: await this.usersService.findOne(userId), success: true };
  }
  @Patch('/update')
  @UseInterceptors(
    FileInterceptor('profilePicture', profilePictureUploadOptions as any),
  )
  async userUpdate(
    @Req() req: Request,
    @Body() body: UpdateUserDto,
    @UploadedFile() profilePicture?: any,
  ) {
    const userId = Number((req as any).user?.sub);

    const profilePictureUrl = profilePicture
      ? await this.supabaseStorageService.uploadProfilePicture(profilePicture)
      : undefined;

    return {
      data: await this.usersService.updateUser({
        id: userId,
        ...body,
        ...(profilePictureUrl ? { profilePictureUrl } : {}),
      }),
      success: true,
    };
  }
}
