import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EntityManager } from '@mikro-orm/core';
import { Member } from '../../domain/organization/member.entity';
import type { AuthenticatedUser } from '../decorators/auth.decorator';
import { NO_ORGANIZATION } from '../decorators/permissions.decorator';
import { hasPermission } from '../../permissions.config';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly em: EntityManager
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const session = request.session;
      const user = session?.user;

      // 1. Verify that the user exists
      if (!user) {
        throw new ForbiddenException('User not found in session');
      }
      
      // 2. Get required permissions from the decorator
      const requiredPermissions = this.reflector.get<string[]>('REQUIRED_PERMISSIONS', context.getHandler());

      // If no permissions required, access granted
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
      }

      // 3. App-level admin (super admin) bypasses all permission checks
      if ((user as AuthenticatedUser).role === 'admin') {
        return true;
      }

      // 4. Check if this is a no-organization action
      const noOrganization = this.reflector.get<boolean>(NO_ORGANIZATION, context.getHandler());
  
      if (noOrganization) {
        // No-organization action: only verify authentication
        console.log('✅ [PermissionsGuard] No-org action granted');
        return true;
      }

      // 5. Determine resource from controller name
      const controllerName = context.getClass().name;
      const resource = controllerName
      .replace('Controller', '')
      .replace(/^([A-Z])/, (match) => match.toLowerCase()) // First letter to lowercase
      .replace(/([A-Z])/g, (match) => match); // Keep other capitals
       
      // 6. Verify that the user belongs to an organization
      const organizationId = session?.session?.activeOrganizationId;
      if (!organizationId) {
        throw new ForbiddenException('User does not belong to an organization');
      }

      // 7. Get the user's role in the organization
      const memberRecord = await this.em.findOne(Member, {
        user: { id: user.id },
        organization: { id: organizationId },
      });

      if (!memberRecord) {
        throw new ForbiddenException('User is not a member of this organization');
      }

      const organizationRole = memberRecord.role;

      // 8. Check permissions (athlete vs coach) via permissions.config
      const granted = hasPermission(organizationRole, resource, requiredPermissions);

      if (granted) {
        console.log('✅ [PermissionsGuard] Access granted for organization role:', organizationRole);
        return true;
      }

      // 9. If no permission is granted
      console.log('❌ [PermissionsGuard] Access denied for organization role:', organizationRole);
      throw new ForbiddenException(
        `Access denied. Required permissions: ${requiredPermissions.join(', ')} for resource: ${resource}`
      );

    } catch (error) {
      console.error('❌ [PermissionsGuard] Error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : 'No stack trace',
        timestamp: new Date().toISOString(),
      });
      
      // Otherwise, throw a generic ForbiddenException
      throw new ForbiddenException('Permission check failed');
    }
  }
}   