import type {
  adminInvitationListItemSchema,
  adminUserListItemSchema,
} from '@dropit/schemas';
import type { z } from 'zod';

export type AdminUserListItem = z.infer<typeof adminUserListItemSchema>;
export type AdminInvitationListItem = z.infer<
  typeof adminInvitationListItemSchema
>;

export interface IAdminRepository {
  getUsers(): Promise<AdminUserListItem[]>;
  getPendingInvitations(): Promise<AdminInvitationListItem[]>;
}

export const ADMIN_REPOSITORY = Symbol('ADMIN_REPOSITORY');
