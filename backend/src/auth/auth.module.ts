import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import type { StringValue } from 'ms';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthRepo } from './auth.repo';
import { PassportModule } from '@nestjs/passport';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: "u01QGzwTcrEGpw7MVWT67Y9E0QvidXKNAVFMhrLMFsr",
      signOptions: {
        expiresIn: (process.env.JWT_EXPIRES_IN ?? '30m') as StringValue,
      },
    }),
  ],
  providers: [AuthService,AuthRepo,GoogleStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
