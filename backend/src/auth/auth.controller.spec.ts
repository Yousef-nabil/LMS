import { Test, TestingModule } from '@nestjs/testing';
import type { Request, Response } from 'express';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { signup: jest.Mock; googleLogin: jest.Mock };

  beforeEach(async () => {
    authService = {
      signup: jest.fn(),
      googleLogin: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('signs up a user and sets auth cookies', async () => {
    const response = {
      cookie: jest.fn(),
    } as unknown as Response;

    authService.signup.mockResolvedValue({
      access_token: 'access-token',
      refresh_token: 'refresh-token',
      user: { id: '1', email: 'test@example.com', role: 'student' },
    });

    const result = await controller.signup(
      {
        name: 'Test User',
        email: 'test@example.com',
        password: 'Password1!',
        role: 'student',
      } as any,
      response,
    );

    expect(authService.signup).toHaveBeenCalledWith({
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password1!',
      role: 'student',
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'access_token',
      'access-token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'refresh-token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(result).toEqual({
      user: { id: '1', email: 'test@example.com', role: 'student' },
    });
  });

  it('handles the google callback the same way', async () => {
    const response = {
      cookie: jest.fn(),
    } as unknown as Response;

    authService.googleLogin.mockResolvedValue({
      access_token: 'google-access-token',
      refresh_token: 'google-refresh-token',
      user: { id: '2', email: 'google@example.com', role: 'student' },
    });

    const result = await controller.googleCallback(
      { user: { email: 'google@example.com' } } as Request,
      response,
    );

    expect(authService.googleLogin).toHaveBeenCalledWith({
      email: 'google@example.com',
    });
    expect(response.cookie).toHaveBeenCalledWith(
      'access_token',
      'google-access-token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(response.cookie).toHaveBeenCalledWith(
      'refresh_token',
      'google-refresh-token',
      expect.objectContaining({ httpOnly: true }),
    );
    expect(result).toEqual({
      user: { id: '2', email: 'google@example.com', role: 'student' },
    });
  });
});
