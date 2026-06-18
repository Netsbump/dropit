import type { InvitableOrganizationRole } from '@dropit/schemas';
import type { IncomingHttpHeaders } from 'node:http';

export interface InvitationRecipientProfile {
  firstName: string;
  lastName: string;
}

export interface InvitationNotificationContext {
  isNewUser: boolean;
  hasOtherOrganization: boolean;
}

export interface InvitationActor {
  userId: string;
  isSuperAdmin: boolean;
  organizationId?: string;
}

export interface InviteAthleteInput {
  firstName: string;
  lastName: string;
  email: string;
  organizationId: string;
  headers: IncomingHttpHeaders;
}

export interface InviteUserInput {
  firstName: string;
  lastName: string;
  email: string;
  organizationId: string;
  organizationRole: InvitableOrganizationRole;
  headers: IncomingHttpHeaders;
}

export interface IInvitationUseCases {
  inviteAthlete(
    input: InviteAthleteInput,
    actor: InvitationActor
  ): Promise<void>;

  inviteUser(input: InviteUserInput, actor: InvitationActor): Promise<void>;

  prepareRecipient(
    email: string,
    organizationId: string,
    profile: InvitationRecipientProfile
  ): Promise<InvitationNotificationContext>;

  getNotificationContext(
    email: string,
    organizationId: string
  ): Promise<InvitationNotificationContext>;
}

export const INVITATION_USE_CASES = Symbol('INVITATION_USE_CASES');
