import type { InvitableOrganizationRole } from '@dropit/schemas';
import type { IncomingHttpHeaders } from 'node:http';

export interface InviteAdminUserParams {
  email: string;
  role: InvitableOrganizationRole;
  organizationId: string;
  headers: IncomingHttpHeaders;
}

export abstract class IAdminInvitationService {
  abstract inviteUser(params: InviteAdminUserParams): Promise<void>;
}

export const ADMIN_INVITATION_SERVICE = Symbol('ADMIN_INVITATION_SERVICE');
