import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { member, admin, owner } from '@dropit/permissions';
import { EntityManager } from '@mikro-orm/core';
import { Member } from '../members/organization/organization.entity';

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

      // 1. Vérifier que l'utilisateur existe
      if (!user) {
        throw new ForbiddenException('User not found in session');
      }

      // 2. Vérifier que l'utilisateur appartient bien à une organisation
      const organizationId = session?.session?.activeOrganizationId;
      if (!organizationId) {
        throw new ForbiddenException('User does not belong to an organization');
      }


      // 3. Récupérer le rôle de l'utilisateur dans l'organisation
      const memberRecord = await this.em.findOne(Member, {
        user: { id: user.id },
        organization: { id: organizationId },
      });

     
      if (!memberRecord) {
        throw new ForbiddenException('User is not a member of this organization');
      }

      const organizationRole = memberRecord.role;

      // 4. Récupérer les permissions requises depuis le décorateur
      const requiredPermissions = this.reflector.get<string[]>('REQUIRED_PERMISSIONS', context.getHandler());
      
      // Si pas de permissions requises, accès autorisé
      if (!requiredPermissions || requiredPermissions.length === 0) {
        return true;
      }

      // 5. Déterminer la ressource depuis le nom du controller
      const controllerName = context.getClass().name;
      const resource = controllerName.replace('Controller', '').toLowerCase();
      
      console.log('🔐 [PermissionsGuard] Checking permissions:', {
        user: user.id,
        organizationId,
        resource,
        requiredPermissions,
        organizationRole,
        endpoint: `${request.method} ${request.url}`
      });

      // 6. Vérification basée sur le rôle d'organisation en utilisant les permissions définies
      const hasPermission = this.checkUserRolePermissions(organizationRole, resource, requiredPermissions);

      if (hasPermission) {
        console.log('✅ [PermissionsGuard] Access granted for organization role:', organizationRole);
        return true;
      }

      // 7. Si aucune permission n'est accordée
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
      
      // Sinon, lancer une ForbiddenException générique
      throw new ForbiddenException('Permission check failed');
    }
  }

  /**
   * Vérification des permissions basée sur le rôle d'organisation en utilisant les permissions définies
   * dans le package @dropit/permissions
   */
  private checkUserRolePermissions(organizationRole: string, resource: string, requiredActions: string[]): boolean {
    // Mapping des rôles vers les objets de permissions définis
    const rolePermissionsMap = {
      'member': member.statements,
      'admin': admin.statements,
      'owner': owner.statements,
    };

    // Récupérer les permissions du rôle de l'utilisateur
    const userRolePermissions = rolePermissionsMap[organizationRole as keyof typeof rolePermissionsMap];
    
    if (!userRolePermissions) {
      console.warn(`⚠️ [PermissionsGuard] Unknown organization role: ${organizationRole}`);
      return false;
    }

    // Récupérer les permissions pour la ressource spécifique
    const userResourcePermissions = userRolePermissions[resource as keyof typeof userRolePermissions] as string[] || [];
    
    console.log('🔍 [PermissionsGuard] Permission check details:', {
      organizationRole,
      resource,
      userResourcePermissions,
      requiredActions,
    });
    
    // Vérifier si l'utilisateur a au moins une des permissions requises (mode OR)
    return requiredActions.some(action => userResourcePermissions.includes(action));
  }
}   