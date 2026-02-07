import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { member, admin, owner } from '@dropit/permissions';
import { EntityManager } from '@mikro-orm/core';
import { Member } from '../../domain/organization/member.entity';
import { NO_ORGANIZATION } from '../decorators/permissions.decorator';

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

      // 3. Check if this is a no-organization action
      const noOrganization = this.reflector.get<boolean>(NO_ORGANIZATION, context.getHandler());
  
      if (noOrganization) {
        // No-organization action: only verify authentication
        console.log('✅ [PermissionsGuard] No-org action granted');
        return true;
      }

      // 4. Determine resource from controller name
      const controllerName = context.getClass().name;
      const resource = controllerName
      .replace('Controller', '')
      .replace(/^([A-Z])/, (match) => match.toLowerCase()) // First letter to lowercase
      .replace(/([A-Z])/g, (match) => match); // Keep other capitals
       
      // 5. Verify that the user belongs to an organization
      const organizationId = session?.session?.activeOrganizationId;
      if (!organizationId) {
        throw new ForbiddenException('User does not belong to an organization');
      }

      // 6. Get the user's role in the organization
      const memberRecord = await this.em.findOne(Member, {
        user: { id: user.id },
        organization: { id: organizationId },
      });

      if (!memberRecord) {
        throw new ForbiddenException('User is not a member of this organization');
      }

      const organizationRole = memberRecord.role;

      // 7. Check permissions based on organization role using defined permissions
      const hasPermission = this.checkUserRolePermissions(organizationRole, resource, requiredPermissions);

      if (hasPermission) {
        console.log('✅ [PermissionsGuard] Access granted for organization role:', organizationRole);
        return true;
      }

      // 7. If no permission is granted
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

  /**
   * Check permissions based on organization role using the permissions defined
   * in the @dropit/permissions package
   */
  private checkUserRolePermissions(organizationRole: string, resource: string, requiredActions: string[]): boolean {
    // Map roles to the defined permission objects
    const rolePermissionsMap = {
      member: member.statements,
      admin: admin.statements,
      owner: owner.statements,
    };

    // Get permissions for the user's role
    const userRolePermissions = rolePermissionsMap[organizationRole as keyof typeof rolePermissionsMap];
    
    if (!userRolePermissions) {
      console.warn(`⚠️ [PermissionsGuard] Unknown organization role: ${organizationRole}`);
      return false;
    }

    // Get permissions for the specific resource
    const userResourcePermissions = userRolePermissions[resource as keyof typeof userRolePermissions] as string[] || [];
    
    console.log('🔍 [PermissionsGuard] Permission check details:', {
      organizationRole,
      resource,
      userResourcePermissions,
      requiredActions,
    });
    
    // Check if the user has at least one of the required permissions (OR mode)
    return requiredActions.some(action => userResourcePermissions.includes(action));
  }
}   