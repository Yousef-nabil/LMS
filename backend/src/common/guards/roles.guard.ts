import 'reflect-metadata';

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { user_role } from '@prisma/client';

import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const roles =
      (Reflect.getMetadata(ROLES_KEY, context.getHandler()) as
        | user_role[]
        | undefined) ??
      (Reflect.getMetadata(ROLES_KEY, context.getClass()) as
        | user_role[]
        | undefined);

    if (!roles || roles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userRole = request.user?.role as user_role | undefined;

    return !!userRole && roles.includes(userRole);
  }
}
