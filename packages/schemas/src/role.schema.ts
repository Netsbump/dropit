import { z } from 'zod';

export const GLOBAL_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const globalRoleSchema = z.enum([GLOBAL_ROLE.USER, GLOBAL_ROLE.ADMIN]);

export type GlobalRole = z.infer<typeof globalRoleSchema>;

export const ORGANIZATION_ROLE = {
  MEMBER: 'member',
  ADMIN: 'admin',
  OWNER: 'owner',
} as const;

export const organizationRoleSchema = z.enum([
  ORGANIZATION_ROLE.MEMBER,
  ORGANIZATION_ROLE.ADMIN,
  ORGANIZATION_ROLE.OWNER,
]);

export type OrganizationRole = z.infer<typeof organizationRoleSchema>;

export const APP_ROLE = {
  USER: 'user',
  COACH: 'coach',
  SUPER_ADMIN: 'super_admin',
} as const;

export const appRoleSchema = z.enum([
  APP_ROLE.USER,
  APP_ROLE.COACH,
  APP_ROLE.SUPER_ADMIN,
]);

export type AppRole = z.infer<typeof appRoleSchema>;
