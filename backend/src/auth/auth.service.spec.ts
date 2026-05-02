import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: {
    users: {
      findUnique: jest.Mock;
      create: jest.Mock;
    };
    refresh_tokens: {
      create: jest.Mock;
    };
  };
  let jwtService: {
    signAsync: jest.Mock;
  };

  beforeEach(async () => {
    prismaService = {
      users: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
      refresh_tokens: {
        create: jest.fn(),
      },
    };

    jwtService = {
      signAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('creates a new user, stores a refresh token, and returns tokens', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    prismaService.users.findUnique.mockResolvedValue(null);
    prismaService.users.create.mockResolvedValue({
      id: 1n,
      email: 'test@example.com',
      role: 'student',
    });
    jwtService.signAsync.mockResolvedValue('access-token');

    const result = await service.signup({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1!',
      role: 'student' as never,
    });

    expect(prismaService.users.findUnique).toHaveBeenCalledWith({
      where: { email: 'test@example.com' },
    });
    expect(bcrypt.hash).toHaveBeenCalledWith('Password1!', 10);
    expect(prismaService.users.create).toHaveBeenCalledWith({
      data: {
        name: 'Test User',
        email: 'test@example.com',
        password_hash: 'hashed-password',
        role: 'student',
      },
    });
    expect(jwtService.signAsync).toHaveBeenCalledWith(
      { sub: '1', email: 'test@example.com' },
      { expiresIn: '30m' },
    );
    expect(prismaService.refresh_tokens.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ user_id: 1n, token: 'hashed-password' }),
    });
    expect(result).toEqual({
      access_token: 'access-token',
      refresh_token: expect.any(String),
      user: {
        id: '1',
        email: 'test@example.com',
        role: 'student',
      },
    });
  });

  it('rejects signup when the email already exists', async () => {
    prismaService.users.findUnique.mockResolvedValue({
      id: 1n,
      email: 'test@example.com',
    });

    await expect(
      service.signup({
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password1!',
        role: 'student' as never,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects google login without an email', async () => {
    await expect(
      service.googleLogin({ name: 'Google User' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('logs in an existing google user and stores a refresh token', async () => {
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-refresh');
    prismaService.users.findUnique.mockResolvedValue({
      id: 2n,
      email: 'google@example.com',
      role: 'student',
    });
    jwtService.signAsync.mockResolvedValue('google-access-token');

    const result = await service.googleLogin({
      email: 'google@example.com',
      name: 'Google User',
    });

    expect(prismaService.users.findUnique).toHaveBeenCalledWith({
      where: { email: 'google@example.com' },
    });
    expect(prismaService.users.create).not.toHaveBeenCalled();
    expect(result).toEqual({
      access_token: 'google-access-token',
      refresh_token: expect.any(String),
      user: {
        id: '2',
        email: 'google@example.com',
        role: 'student',
      },
    });
  });
});
