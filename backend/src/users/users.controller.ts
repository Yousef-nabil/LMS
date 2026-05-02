import { Controller, Get, UseGuards, Req, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import type { Request } from 'express';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) { }



  @Get('/info')
  async userInfo(
    @Req() req: Request,
  ) {
    const userId = (req as any).user?.sub;
    return { data: await this.usersService.findOne(userId), success: true };
  }
  @Patch('/update')
  async userUpdate(
    @Req() req: Request,
    @Body() body :UpdateUserDto
  ) {
    const userId = (req as any).user?.sub;
    return { data: await this.usersService.updateUser({
      id:userId,
      name:body.name
    }), success: true };
  }

}
