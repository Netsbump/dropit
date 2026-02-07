import { SetMetadata } from "@nestjs/common";

/**
 * Décorateur pour spécifier les permissions requises pour une route
 * @param permissions - Liste des permissions requises (mode OR)
 * @example
 * @RequirePermissions('read')
 * @RequirePermissions('read', 'create')
 * @RequirePermissions('*')
 */
export const RequirePermissions = (...permissions: string[]) => 
  SetMetadata('REQUIRED_PERMISSIONS', permissions);

export const NO_ORGANIZATION = 'NO_ORGANIZATION';
export const NoOrganization = () => 
  SetMetadata(NO_ORGANIZATION, true);