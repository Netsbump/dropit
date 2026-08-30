import type { ExecutionContext } from '@nestjs/common';
import {
  SetMetadata,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import type { User } from 'better-auth';
import { parseUserId, type UserId } from '../../../../shared/kernel/identity';

export type AuthenticatedUser = Omit<User, 'id'> & {
  id: UserId;
  /** App-level role from admin plugin: 'admin' = super admin, 'user' = default */
  role?: string;
};

export const Public = () => SetMetadata('PUBLIC', true);

export const Optional = () => SetMetadata('OPTIONAL', true);

export const Session = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();
    return request.session;
  }
);

export const CurrentUser = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedUser => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || typeof user.id !== 'string') {
      throw new UnauthorizedException('Missing authenticated user');
    }

    try {
      return {
        ...user,
        id: parseUserId(user.id),
      };
    } catch {
      throw new UnauthorizedException('Invalid authenticated user');
    }
  }
);
