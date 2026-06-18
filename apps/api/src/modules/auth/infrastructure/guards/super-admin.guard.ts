import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request?.session?.user;

    if (user?.role === 'admin') {
      return true;
    }

    throw new ForbiddenException('Super admin access required');
  }
}
