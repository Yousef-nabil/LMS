import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtModule, JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
@Injectable()
export class JwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.cookies['access_token'];

    if (!token) return false;

    try {
      const payload = jwt.verify(
        token,
        'u01QGzwTcrEGpw7MVWT67Y9E0QvidXKNAVFMhrLMFsr',
      );
      request.user = payload;
      return true;
    } catch (err) {
      return false;
    }
  }
}
