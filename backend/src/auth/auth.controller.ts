import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const res = await this.authService.signup(dto);

    response.cookie('access_token', res.access_token, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000, 
    });

    response.cookie('refresh_token', res.refresh_token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return { user: res.user };
  }
}