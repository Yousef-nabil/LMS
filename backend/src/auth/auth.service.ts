import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SignupDto } from './dto/signup.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { LoginDto } from './dto/login.dto';
import { AuthRepo } from './auth.repo';
import { createHash } from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';
@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private authRepo: AuthRepo
  ) { }

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
  async generateAccessToken(userId: bigint, email: string) {
    const payload = { sub: userId.toString(), email };
    const access_token = await this.jwtService.signAsync(payload, {
      expiresIn: '30m',
    });
    return {
      access_token
    };
  }

  // Save refresh token
  async saveRefreshToken(userId: bigint, token: string) {
    const hashed = createHash('sha256').update(token).digest('hex'); //better for fast compare
    return await this.authRepo.createRefreshToken({
      userId: Number(userId),
      token: hashed
    });
  }

  async login(payload: LoginDto) {
    const user = await this.prisma.users.findUnique({
      where: { email: payload.email },
    });
    if (!user) {
      throw new NotFoundException('invalid credentials');
    }

    const isMatch = await bcrypt.compare(payload.password, user.password_hash);
    if (!isMatch) {
      throw new ForbiddenException('invalid credentials');
    }
    const tokens = await this.generateTokens(user.id, user.email);

    await this.saveRefreshToken(user.id, tokens.refresh_token);
    return tokens
  }
  async RefreshToken(token: string) {
    const hashed = createHash('sha256').update(token).digest('hex');
    const isValidToken = await this.authRepo.validateRefreshToken({
      token: hashed
    })
    if (isValidToken) {
      const user = await this.prisma.users.findUnique({
        where: { id: isValidToken.user_id },
      });
      if (!user) {
        throw new BadRequestException("User not found")
      }
      return await this.generateAccessToken(user.id, user.email)
    }
    else {
      throw new ForbiddenException("Invalid session")
    }
  }
  async logout(token: string) {
    const hashed = createHash('sha256').update(token).digest('hex');
    try {
      await this.authRepo.revokeRefreshToken({
        token:hashed
      })
    }
    catch (e) {
      throw new BadRequestException('invalid credentials')
    }

  }
  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async deleteOldTokens() {
    return await this.authRepo.deleteOldTokens();
  }
}