export interface InvitationRecipientProfile {
  firstName: string;
  lastName: string;
}

export interface InvitationNotificationContext {
  isNewUser: boolean;
  hasOtherOrganization: boolean;
}

export interface IInvitationUseCases {
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
