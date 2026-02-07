import { Inject, Injectable } from '@nestjs/common';
import { INotificationUseCases, SendOtpParams } from '../ports/inbound/notification-use-cases.port';
import {
  INotificationPort,
  KIND,
  NOTIFICATION_PORT,
  PLATFORM,
  type NotificationRequest,
  RECIPIENT_TYPE,
} from '../ports/outbound/notification.port';
import { IUserRepository, USER_REPO } from '../../../auth/application/ports/user.repository.port';
import {
  UserNotFoundException,
  UserEmailNotFoundException,
  UserPhoneNotFoundException,
} from '../exceptions/notification.exceptions';

/**
 * Notification Use Cases Implementation
 *
 * @description
 * Framework-agnostic implementation of notification business logic.
 * Contains all the business rules for sending notifications through various channels.
 *
 * @remarks
 * Dependencies are injected via constructor following dependency inversion principle.
 * All dependencies are interfaces (ports), not concrete implementations.
 */
@Injectable()
export class NotificationUseCase implements INotificationUseCases {
  constructor(
    @Inject(NOTIFICATION_PORT)
    private readonly notificationPort: INotificationPort,
    @Inject(USER_REPO)
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

  async sendOtp(params: SendOtpParams
  ): Promise<void> {
    if (params.origin === PLATFORM.WEB) {

      // Get user
      const user = await this.userRepository.getByEmail(params.email)
      if (!user) {
        throw new UserNotFoundException(`User with ID ${params.email} not found`);
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
        email: params.email,
        otp: params.otp,
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
