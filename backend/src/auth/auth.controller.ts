import { BadRequestException, Body, Controller, ForbiddenException, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  @Post('signup')
  async signup(
    @Body() dto: SignupDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const res = await this.authService.signup(dto);

    response.cookie('access_token', res.access_token, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
      secure:true

    });

    response.cookie('refresh_token', res.refresh_token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure:true

    });

    return { sucess: true };
  }
  @Post('login')
  async login(
    @Body() payload: LoginDto,
    @Res({ passthrough: true }) response: Response,
  ) {
    const res = await this.authService.login(payload)
    response.cookie('access_token', res.access_token, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
      secure:true

    });

    response.cookie('refresh_token', res.refresh_token, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      secure:true

    });
    return { success: true }
  }
  @Post('/refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = req.cookies['refresh_token'];
    if (!token) {
      throw new ForbiddenException("Invalid session")
    }
    const res = await this.authService.RefreshToken(token)
    response.cookie('access_token', res.access_token, {
      httpOnly: true,
      maxAge: 30 * 60 * 1000,
      secure:true
    });
    return { success: true }
  }
  @Post('/logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const token = req.cookies['refresh_token'];
    if (token) {
      await this.authService.logout(token);
    }
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
    return { success: true }
  }
}