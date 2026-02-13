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

      await this.notificationPort.send(notificationRequest)
    } else {

      const notificationRequest: NotificationRequest = {
        kind: KIND.ORGANIZATION_INVITATION,
        recipientType: RECIPIENT_TYPE.NEW_USER,
        ...params
      }

      await this.notificationPort.send(notificationRequest)
    }
  }

  async sendOtp(params: OtpParams
  ): Promise<void> {
    if (params.transport === TRANSPORT.EMAIL) {

      // Get user
      const user = await this.userRepository.getByEmail(params.emailOTPOptions.email)
      if (!user) {
        throw new UserNotFoundException(`User with ID ${params.emailOTPOptions.email} not found`);
      }

      // TODO implement function deternmineTransport
      // then call the notification adapters with the good kind
      // We need to check if user have mobile number or email
      // then both are present we need to check if user have sending preferences
      // otherwise we sending by mobile in first choice
      // otherwise we sending by email if no mobile number are provided
      // for exemple :
      const determinedPlatform = 'mobile'

      const notificationRequest: NotificationRequest = {
        kind: KIND.OTP,
        email: params.emailOTPOptions.email,
        otp: params.emailOTPOptions.otp,
        platform: determinedPlatform,
      }

      await this.notificationPort.send(notificationRequest);
    } else {
      // When implemented:
      // if (!user.phone) {
      //   throw new UserPhoneNotFoundException(`User ${user.id} has no phone number`);
      // }
      // For now, throw an error
      throw new UserPhoneNotFoundException(
        'SMS notifications are not yet implemented. User phone field is required.'
      );
    }
  }
}
