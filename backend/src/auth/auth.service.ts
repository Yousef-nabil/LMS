import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import type { user_role } from '@prisma/client';

type GoogleUser = {
  provider?: 'google';
  providerId?: string;
  email?: string;
  name?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    // 1. check existing
    const existingUser = await this.prisma.users.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // 2. hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. create user
    const user = await this.prisma.users.create({
      data: {
        name: dto.name,
        email: dto.email,
        password_hash: hashedPassword,
        role: dto.role,
      },
    });

    // 4. generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    // 5. save refresh token in DB
    await this.saveRefreshToken(user.id, tokens.refresh_token);

    return {
      ...tokens,
      user: {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
      },
    };
  }

  async googleLogin(googleUser: GoogleUser) {
    const email = googleUser?.email;
    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }

    const existingUser = await this.prisma.users.findUnique({
      where: { email },
    });

    const user =
      existingUser ??
      (await this.prisma.users.create({
        data: {
          name: googleUser?.name ?? 'Google User',
          email,
          // Keep schema unchanged (password_hash required) by setting a random secret.
          password_hash: await bcrypt.hash(randomUUID(), 10),
          role: 'student' as user_role,
        },
      }));

    const tokens = await this.generateTokens(user.id, user.email);
    await this.saveRefreshToken(user.id, tokens.refresh_token);

    return {
      ...tokens,
      user: {
        id: user.id.toString(),
        email: user.email,
        role: user.role,
      },
    };
  }

  // Generate tokens
  async generateTokens(userId: bigint, email: string) {
    const payload = { sub: userId.toString(), email };

    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '30m',
    });

    const refresh_token = randomUUID(); 

    return {
      access_token,
      refresh_token,
    };
  }

  // Save refresh token
  async saveRefreshToken(userId: bigint, token: string) {
    const hashed = await bcrypt.hash(token, 10);

    await this.prisma.refresh_tokens.create({
      data: {
        user_id: userId,
        token: hashed,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }
}