import { ORGANIZATION_ROLE } from '@dropit/schemas';
import { IInvitationAuthProvider } from './ports/invitation-auth-provider.port';
import { IInvitationRecipientService } from './ports/invitation-recipient.port';
import {
  IInvitationUseCases,
  InvitationActor,
  InvitationNotificationContext,
  InvitationRecipientProfile,
  InviteAthleteInput,
  InviteUserInput,
} from './ports/invitation-use-cases.port';

export class InvitationUseCases implements IInvitationUseCases {
  constructor(
    private readonly recipientService: IInvitationRecipientService,
    private readonly invitationAuthProvider: IInvitationAuthProvider
  ) {}

  async inviteAthlete(
    input: InviteAthleteInput,
    actor: InvitationActor
  ): Promise<void> {
    this.assertCanInviteAthlete(input.organizationId, actor);

    await this.recipientService.prepareRecipient(
      input.email,
      input.organizationId,
      {
        firstName: input.firstName,
        lastName: input.lastName,
      }
    );

    await this.invitationAuthProvider.createInvitation({
      email: input.email,
      organizationId: input.organizationId,
      organizationRole: ORGANIZATION_ROLE.MEMBER,
      headers: input.headers,
    });
  }

  async inviteUser(
    input: InviteUserInput,
    actor: InvitationActor
  ): Promise<void> {
    if (!actor.isSuperAdmin) {
      throw new Error('Only super admins can invite users from the admin area');
    }

    await this.recipientService.prepareRecipient(
      input.email,
      input.organizationId,
      {
        firstName: input.firstName,
        lastName: input.lastName,
      }
    );

    await this.invitationAuthProvider.createInvitation({
      email: input.email,
      organizationId: input.organizationId,
      organizationRole: input.organizationRole,
      headers: input.headers,
    });
  }

  async prepareRecipient(
    email: string,
    organizationId: string,
    profile: InvitationRecipientProfile
  ): Promise<InvitationNotificationContext> {
    return this.recipientService.prepareRecipient(
      email,
      organizationId,
      profile
    );
  }

  async getNotificationContext(
    email: string,
    organizationId: string
  ): Promise<InvitationNotificationContext> {
    return this.recipientService.getNotificationContext(email, organizationId);
  }

  private assertCanInviteAthlete(
    organizationId: string,
    actor: InvitationActor
  ): void {
    if (actor.isSuperAdmin) {
      return;
    }

    if (!actor.organizationId || actor.organizationId !== organizationId) {
      throw new Error(
        'You can only invite athletes to your active organization'
      );
    }
  }
}
