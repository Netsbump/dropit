import type { InvitableOrganizationRole } from '@dropit/schemas';

export interface InviteAdminUserParams {
  email: string;
  role: InvitableOrganizationRole;
  organizationId: string;
}

export abstract class IAdminInvitationService {
  abstract inviteUser(params: InviteAdminUserParams): Promise<void>;
}

export const ADMIN_INVITATION_SERVICE = Symbol('ADMIN_INVITATION_SERVICE');
