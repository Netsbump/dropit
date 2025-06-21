import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository } from '@mikro-orm/postgresql';
import { Member } from '../members/organization/organization.entity';

export const PERMISSION_KEY = 'permissions';

interface PermissionRequirement {
  resource: string;
  action: string;
}

@Injectable()
export class BetterAuthPermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(Member)
    private readonly memberRepository: EntityRepository<Member>
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Vérifier que l'utilisateur est authentifié
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Vérifier que l'utilisateur a une organisation active
    if (!user.activeOrganizationId) {
      throw new ForbiddenException('No active organization');
    }

    // Récupérer le membre de l'organisation
    const member = await this.memberRepository.findOne({
      user: { id: user.id },
      organization: { id: user.activeOrganizationId },
    });

    if (!member) {
      throw new ForbiddenException('User is not a member of this organization');
    }

    // 🔍 LOG: Afficher l'utilisateur et son rôle
    console.log('🔐 [PermissionGuard] User Info:', {
      userId: user.id,
      userEmail: user.email,
      activeOrganizationId: user.activeOrganizationId,
      memberRole: member.role,
      memberId: member.id,
      endpoint: `${request.method} ${request.url}`,
    });

    // Récupérer les permissions requises depuis les métadonnées
    const requiredPermissions = this.reflector.getAllAndOverride<PermissionRequirement[]>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    );

    // Si aucune permission n'est requise, autoriser l'accès
    if (!requiredPermissions || requiredPermissions.length === 0) {
      console.log('✅ [PermissionGuard] No permissions required, access granted');
      return true;
    }

    // Vérifier les permissions basées sur le rôle
    const hasPermission = this.checkRolePermissions(member.role, requiredPermissions);

    if (!hasPermission) {
      console.log('❌ [PermissionGuard] Permission denied:', {
        requiredPermissions,
        userRole: member.role,
      });
      throw new ForbiddenException(
        `Insufficient permissions. Required: ${requiredPermissions.map(p => `${p.resource}:${p.action}`).join(', ')}`
      );
    }

    console.log('✅ [PermissionGuard] Permission granted for role:', member.role);
    return true;
  }

  /**
   * Vérifie les permissions basées sur le rôle Better Auth
   */
  private checkRolePermissions(
    role: string,
    requiredPermissions: PermissionRequirement[]
  ): boolean {
    // Définition des permissions par rôle (basée sur la config Better Auth)
    const rolePermissions: Record<string, Record<string, string[]>> = {
      owner: {
        // Permissions par défaut Better Auth
        organization: ['update', 'delete'],
        member: ['create', 'update', 'delete'],
        invitation: ['create', 'cancel'],
        // Permissions métier
        workout: ['read', 'create', 'update', 'delete'],
        exercise: ['read', 'create', 'update', 'delete'],
        complex: ['read', 'create', 'update', 'delete'],
        athlete: ['read', 'create', 'update', 'delete'],
        session: ['read', 'create', 'update', 'delete'],
        'personal-record': ['read', 'create', 'update', 'delete'],
      },
      admin: {
        // Permissions par défaut Better Auth
        organization: ['update'],
        member: ['create', 'update', 'delete'],
        invitation: ['create', 'cancel'],
        // Permissions métier
        workout: ['read', 'create', 'update', 'delete'],
        exercise: ['read', 'create', 'update', 'delete'],
        complex: ['read', 'create', 'update', 'delete'],
        athlete: ['read', 'create', 'update', 'delete'],
        session: ['read', 'create', 'update', 'delete'],
        'personal-record': ['read', 'create', 'update', 'delete'],
      },
      member: {
        // Permissions par défaut Better Auth
        organization: [],
        member: [],
        invitation: [],
        // Permissions métier (lecture seule + création de ses propres records)
        workout: ['read'],
        exercise: ['read'],
        complex: ['read'],
        athlete: ['read'],
        session: ['read'],
        'personal-record': ['read', 'create'],
      },
    };

    const permissions = rolePermissions[role];
    if (!permissions) {
      return false;
    }

    // Vérifier chaque permission requise
    for (const { resource, action } of requiredPermissions) {
      const resourcePermissions = permissions[resource];
      if (!resourcePermissions || !resourcePermissions.includes(action)) {
        return false;
      }
    }

    return true;
  }
} 