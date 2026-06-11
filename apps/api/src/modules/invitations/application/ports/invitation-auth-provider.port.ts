import type { InvitableOrganizationRole } from '@dropit/schemas';
import type { IncomingHttpHeaders } from 'node:http';

export interface CreateInvitationParams {
  email: string;
  organizationId: string;
  organizationRole: InvitableOrganizationRole;
  headers: IncomingHttpHeaders;
}

export interface IInvitationAuthProvider {
  createInvitation(params: CreateInvitationParams): Promise<void>;
}

export const INVITATION_AUTH_PROVIDER = Symbol('INVITATION_AUTH_PROVIDER');
