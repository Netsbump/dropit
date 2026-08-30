import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import {
  parseOrganizationId,
  type OrganizationId,
} from '../../../../shared/kernel/identity';

export const CurrentOrganization = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): OrganizationId => {
    const request = ctx.switchToHttp().getRequest();
    const organizationId = request.session?.session?.activeOrganizationId;

    if (typeof organizationId !== 'string') {
      throw new UnauthorizedException('Missing active organization');
    }

    try {
      return parseOrganizationId(organizationId);
    } catch {
      throw new UnauthorizedException('Invalid active organization');
    }
  }
);
