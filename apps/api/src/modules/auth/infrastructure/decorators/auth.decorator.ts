import type { ExecutionContext } from '@nestjs/common';
import { SetMetadata, createParamDecorator } from '@nestjs/common';
import { User } from 'better-auth';

export interface AuthenticatedUser extends User {
  /** App-level role from admin plugin: 'admin' = super admin, 'user' = default */
  role?: string;
}

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
    return request.user;
  }
);
