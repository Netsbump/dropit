import { INotificationUseCases, OtpParams, TRANSPORT } from '../ports/inbound/notification-use-cases.port';
import {
  INotificationPort,
  KIND,
  type NotificationRequest,
  RECIPIENT_TYPE,
} from '../ports/outbound/notification.port';
import { IUserRepository } from '../../../auth/application/ports/user.repository.port';
import {
  UserNotFoundException,
  UserPhoneNotFoundException,
} from '../exceptions/notification.exceptions';

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


  async sendInvitation(params: {
    organizationId: string;
    organizationName: string;
    email: string;
    invitedBy: string;
    invitationToken: string;
  }): Promise<void> {
    const existingUser = await this.userRepository.getByEmail(params.email);

    if (existingUser) {
      const notificationRequest: NotificationRequest = {
        kind: KIND.ORGANIZATION_INVITATION,
        recipientType: RECIPIENT_TYPE.EXISTING_USER,
        userId: existingUser.id,
        ...params
      }

      this.notificationPort.send(notificationRequest)
    } else {

      const notificationRequest: NotificationRequest = {
        kind: KIND.ORGANIZATION_INVITATION,
        recipientType: RECIPIENT_TYPE.NEW_USER,
        ...params
      }

      this.notificationPort.send(notificationRequest)
    }
  }

  async sendOtp(params: OtpParams
  ): Promise<void> {
    const notificationRequest: NotificationRequest = {
      kind: KIND.OTP,
      otpParams: params,
    }

    this.notificationPort.send(notificationRequest);

  }
}
