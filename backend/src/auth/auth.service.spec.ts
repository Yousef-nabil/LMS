import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { AuthRepo } from './auth.repo';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { createHash } from 'crypto';

// mock the entire bcrypt module — jest.spyOn can't redefine native module properties
jest.mock('bcrypt', () => ({
    compare: jest.fn(),
    hash: jest.fn().mockResolvedValue('hashed_password'),
}));
import * as bcrypt from 'bcrypt';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockUser = {
    id: BigInt(1),
    email: 'omar@test.com',
    password_hash: 'hashed_password',
    role: 'student',
};

const mockRefreshTokenRecord = {
    id: BigInt(1),
    user_id: BigInt(1),
    token: 'hashed_token',
    revoked: false,
    expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days from now
};

const prismaServiceMock = {
    users: {
        findUnique: jest.fn(),
    },
};

const jwtServiceMock = {
    signAsync: jest.fn().mockResolvedValue('mock_access_token'),
};

const authRepoMock = {
    createRefreshToken: jest.fn(),
    validateRefreshToken: jest.fn(),
    revokeRefreshToken: jest.fn(),
    deleteOldTokens: jest.fn(),
};

// ── Test Suite ────────────────────────────────────────────────────────────────

describe('AuthService', () => {
    let service: AuthService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: PrismaService, useValue: prismaServiceMock },
                { provide: JwtService, useValue: jwtServiceMock },
                { provide: AuthRepo, useValue: authRepoMock },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);

        // reset all mocks before each test so they don't bleed into each other
        jest.clearAllMocks();
    });

    // ── login ─────────────────────────────────────────────────────────────────

    describe('login', () => {

        it('should return tokens when credentials are valid', async () => {
            prismaServiceMock.users.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            authRepoMock.createRefreshToken.mockResolvedValue({});

            const result = await service.login({
                email: 'omar@test.com',
                password: 'correct_password',
            });

            expect(result).toHaveProperty('access_token');
            expect(result).toHaveProperty('refresh_token');
        });

        it('should throw NotFoundException when user does not exist', async () => {
            prismaServiceMock.users.findUnique.mockResolvedValue(null);

            await expect(
                service.login({ email: 'ghost@test.com', password: 'any' }),
            ).rejects.toThrow(NotFoundException);
        });

        it('should throw ForbiddenException when password is wrong', async () => {
            prismaServiceMock.users.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(
                service.login({ email: 'omar@test.com', password: 'wrong_password' }),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should save the refresh token after successful login', async () => {
            prismaServiceMock.users.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            authRepoMock.createRefreshToken.mockResolvedValue({});

            await service.login({ email: 'omar@test.com', password: 'correct_password' });

            expect(authRepoMock.createRefreshToken).toHaveBeenCalledTimes(1);
        });

        it('should hash the refresh token before saving it', async () => {
            prismaServiceMock.users.findUnique.mockResolvedValue(mockUser);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);
            authRepoMock.createRefreshToken.mockResolvedValue({});

            await service.login({ email: 'omar@test.com', password: 'correct_password' });

            // the token saved to DB must not be the raw UUID — it must be a sha256 hex string
            const savedToken = authRepoMock.createRefreshToken.mock.calls[0][0].token;
            expect(savedToken).toMatch(/^[a-f0-9]{64}$/); // sha256 hex is always 64 chars
        });

    });

    // ── RefreshToken ──────────────────────────────────────────────────────────

    describe('RefreshToken', () => {

        it('should return a new access token when refresh token is valid', async () => {
            authRepoMock.validateRefreshToken.mockResolvedValue(mockRefreshTokenRecord);
            prismaServiceMock.users.findUnique.mockResolvedValue(mockUser);

            const result = await service.RefreshToken('valid_refresh_token');

            expect(result).toHaveProperty('access_token');
            expect(jwtServiceMock.signAsync).toHaveBeenCalledTimes(1);
        });

        it('should throw ForbiddenException when refresh token is invalid or revoked', async () => {
            authRepoMock.validateRefreshToken.mockResolvedValue(null);

            await expect(
                service.RefreshToken('invalid_token'),
            ).rejects.toThrow(ForbiddenException);
        });

        it('should throw BadRequestException when user no longer exists', async () => {
            authRepoMock.validateRefreshToken.mockResolvedValue(mockRefreshTokenRecord);
            prismaServiceMock.users.findUnique.mockResolvedValue(null);

            await expect(
                service.RefreshToken('valid_token_but_deleted_user'),
            ).rejects.toThrow(BadRequestException);
        });

        it('should hash the incoming token before validating it', async () => {
            authRepoMock.validateRefreshToken.mockResolvedValue(mockRefreshTokenRecord);
            prismaServiceMock.users.findUnique.mockResolvedValue(mockUser);

            const rawToken = 'some_raw_token';
            const expectedHash = createHash('sha256').update(rawToken).digest('hex');

            await service.RefreshToken(rawToken);

            expect(authRepoMock.validateRefreshToken).toHaveBeenCalledWith({
                token: expectedHash,
            });
        });

        it('should look up the user by the id stored on the token record', async () => {
            authRepoMock.validateRefreshToken.mockResolvedValue(mockRefreshTokenRecord);
            prismaServiceMock.users.findUnique.mockResolvedValue(mockUser);

            await service.RefreshToken('valid_token');

            expect(prismaServiceMock.users.findUnique).toHaveBeenCalledWith({
                where: { id: mockRefreshTokenRecord.user_id },
            });
        });

    });

});