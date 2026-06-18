import {
  INotificationUseCases,
  OtpParams,
  OrganizationInvitationParams,
} from '../ports/inbound/notification-use-cases.port';
import {
  INotificationPort,
  KIND,
  type NotificationRequest,
  RECIPIENT_TYPE,
} from '../ports/outbound/notification.port';
import { RequestAccessInput } from '@dropit/schemas';

/**
 * Notification Use Cases Implementation
 *
 * Framework-agnostic implementation of notification business logic.
 * Contains all the business rules for sending notifications through various channels.
 * Dependencies are plain interfaces (ports) — wired by the module via useFactory.
 */
export class NotificationUseCase implements INotificationUseCases {
  constructor(private readonly notificationPort: INotificationPort) {}

  async sendOrganizationInvitation(
    params: OrganizationInvitationParams
  ): Promise<void> {
    try {
      const notificationRequest: NotificationRequest = {
        kind: KIND.ORGANIZATION_INVITATION,
        recipientType: params.isNewUser
          ? RECIPIENT_TYPE.NEW_USER
          : RECIPIENT_TYPE.EXISTING_USER,
        hasOtherOrganization: params.hasOtherOrganization,
        organizationId: params.organizationId,
        organizationName: params.organizationName,
        email: params.email,
        invitedBy: params.invitedBy,
        invitationToken: params.invitationToken,
        organizationRole: params.organizationRole,
      };
      await this.notificationPort.send(notificationRequest);
    } catch (error) {
      console.error('Failed to send organization invitation', error);
    }
  }

  async sendOtp(params: OtpParams): Promise<void> {
    const notificationRequest: NotificationRequest = {
      kind: KIND.OTP,
      otpParams: params,
    };
    try {
      await this.notificationPort.send(notificationRequest);
    } catch (error) {
      console.error('Failed to send OTP notification', error);
    }
  }

  async sendRequestAccess(params: RequestAccessInput): Promise<void> {
    const notificationRequest: NotificationRequest = {
      kind: KIND.REQUEST_ACCESS,
      email: params.email,
      name: params.name,
    };

    try {
      await this.notificationPort.send(notificationRequest);
    } catch (error) {
      console.error('Failed to send notification request access', error);
    }
  }
}
