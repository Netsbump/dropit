import { SetMetadata } from '@nestjs/common';

/**
 * Decorator to specify the permissions required for a route
 * @param permissions - List of required permissions (OR mode)
 * @example
 * @RequirePermissions('read')
 * @RequirePermissions('read', 'create')
 * @RequirePermissions('*')
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata('REQUIRED_PERMISSIONS', permissions);

export const NO_ORGANIZATION = 'NO_ORGANIZATION';
export const NoOrganization = () => SetMetadata(NO_ORGANIZATION, true);
