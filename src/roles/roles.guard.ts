import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from './role.decorator';
import { Role } from './roles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    if (!user) {
      throw new ForbiddenException('User information is missing from request');
    }

    const roles = Array.isArray(user.role) ? user.role : [user.role];

    const isAuthorized = requiredRoles.some((role) => roles.includes(role));
    if (!isAuthorized) {
      throw new ForbiddenException(
        'This user is not authorized to access this route',
      );
    }

    return true;
  }
}
