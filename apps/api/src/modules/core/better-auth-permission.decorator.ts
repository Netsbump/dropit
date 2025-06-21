import { SetMetadata } from '@nestjs/common';
import { PERMISSION_KEY } from './better-auth-permission.guard';

interface PermissionRequirement {
  resource: string;
  action: string;
}

/**
 * Décorateur pour définir les permissions requises
 */
export const RequirePermission = (...permissions: PermissionRequirement[]) =>
  SetMetadata(PERMISSION_KEY, permissions);

/**
 * Décorateurs utilitaires pour les ressources communes
 */
export const RequireWorkoutPermission = (action: string) =>
  RequirePermission({ resource: 'workout', action });

export const RequireExercisePermission = (action: string) =>
  RequirePermission({ resource: 'exercise', action });

export const RequireAthletePermission = (action: string) =>
  RequirePermission({ resource: 'athlete', action });

export const RequireSessionPermission = (action: string) =>
  RequirePermission({ resource: 'session', action });

/**
 * Décorateurs pour les opérations CRUD
 */
export const RequireRead = (resource: string) =>
  RequirePermission({ resource, action: 'read' });

export const RequireCreate = (resource: string) =>
  RequirePermission({ resource, action: 'create' });

export const RequireUpdate = (resource: string) =>
  RequirePermission({ resource, action: 'update' });

export const RequireDelete = (resource: string) =>
  RequirePermission({ resource, action: 'delete' }); 