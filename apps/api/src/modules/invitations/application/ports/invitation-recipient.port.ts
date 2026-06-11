import type {
  InvitationNotificationContext,
  InvitationRecipientProfile,
} from './invitation-use-cases.port';

export interface IInvitationRecipientService {
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

export const INVITATION_RECIPIENT_SERVICE = Symbol(
  'INVITATION_RECIPIENT_SERVICE'
);
