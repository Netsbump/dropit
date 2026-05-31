import type { InvitableOrganizationRole } from '@dropit/schemas';
import type { IncomingHttpHeaders } from 'node:http';
import type {
  AdminInvitationListItem,
  AdminUserListItem,
} from './admin.repository.port';

export interface InviteAdminUserInput {
  firstName: string;
  lastName: string;
  email: string;
  organizationId: string;
  organizationRole: InvitableOrganizationRole;
  headers: IncomingHttpHeaders;
}

export interface IAdminUseCases {
  getUsers(): Promise<AdminUserListItem[]>;
  getInvitations(): Promise<AdminInvitationListItem[]>;
  inviteUser(input: InviteAdminUserInput): Promise<void>;
}

export const ADMIN_USE_CASES = Symbol('ADMIN_USE_CASES');
