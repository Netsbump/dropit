import type {
  AdminInvitationListItem,
  AdminUserListItem,
} from './admin.repository.port';

export interface IAdminUseCases {
  getUsers(): Promise<AdminUserListItem[]>;
  getInvitations(): Promise<AdminInvitationListItem[]>;
}

export const ADMIN_USE_CASES = Symbol('ADMIN_USE_CASES');
