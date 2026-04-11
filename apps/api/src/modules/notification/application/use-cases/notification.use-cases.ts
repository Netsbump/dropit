import { INotificationUseCases, OtpParams, VerificationUserEmailParams } from '../ports/inbound/notification-use-cases.port';
import {
  INotificationPort,
  KIND,
  type NotificationRequest,
  RECIPIENT_TYPE,
} from '../ports/outbound/notification.port';
import { IUserRepository } from '../../../auth/application/ports/user.repository.port';
import { RequestAccess } from '@dropit/schemas';

/**
 * Notification Use Cases Implementation
 *
 * Framework-agnostic implementation of notification business logic.
 * Contains all the business rules for sending notifications through various channels.
 * Dependencies are plain interfaces (ports) — wired by the module via useFactory.
 */
export class NotificationUseCase implements INotificationUseCases {
  constructor(
    private readonly notificationPort: INotificationPort,
    private readonly userRepository: IUserRepository,
  ) { }

  async sendOrganizationInvitation(params: {
    organizationId: string;
    organizationName: string;
    email: string;
    invitedBy: string;
    invitationToken: string;
  }): Promise<void> {
    try {
      const existingUser = await this.userRepository.getByEmail(params.email);

      if (existingUser) {
        const notificationRequest: NotificationRequest = {
          kind: KIND.ORGANIZATION_INVITATION,
          recipientType: RECIPIENT_TYPE.EXISTING_USER,
          userId: existingUser.id,
          ...params
        }
        await this.notificationPort.send(notificationRequest)

      } else {
        const notificationRequest: NotificationRequest = {
          kind: KIND.ORGANIZATION_INVITATION,
          recipientType: RECIPIENT_TYPE.NEW_USER,
          ...params
        }
        await this.notificationPort.send(notificationRequest)
      }
    } catch (error) {
      console.error("Failed to send organization invitation", error);
    }
  }

  async sendOtp(params: OtpParams): Promise<void> {
    const notificationRequest: NotificationRequest = {
      kind: KIND.OTP,
      otpParams: params,
    }
    try {
      await this.notificationPort.send(notificationRequest);
    } catch (error) {
      console.error("Failed to send OTP notification", error);
    }
  }

  async sendVerificationUserEmail(params: VerificationUserEmailParams): Promise<void> {
    const notificationRequest: NotificationRequest = {
      kind: KIND.VERIFICATION_USER_EMAIL,
      email: params.email,
      token: params.token,
      url: params.url,
    }

    try {
      await this.notificationPort.send(notificationRequest);
    } catch (error) {
      console.error("Failed to send email verification notification", error);
    }
  }

  async sendRequestAccess(params: RequestAccess): Promise<void> {
    const notificationRequest: NotificationRequest = {
      kind: KIND.REQUEST_ACCESS,
      email: params.email,
      name: params.name,
    }

    try {
      await this.notificationPort.send(notificationRequest);
    } catch (error) {
      console.error('Failed to send notification request access', error);
    }
  }
}
