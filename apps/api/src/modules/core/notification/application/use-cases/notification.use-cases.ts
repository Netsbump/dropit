import { Inject, Injectable } from '@nestjs/common';
import { INotificationUseCases } from '../ports/in/notification-use-cases.port';
import { INotificationPort, NOTIFICATION_PORT } from '../ports/out/notification.port';
import { IUserRepository, USER_REPO } from '../../../../identity/application/ports/user.repository.port';
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
  ) {}

  async sendInvitation(params: {
    organizationId: string;
    organizationName: string;
    email: string;
    invitedBy: string;
    invitationToken: string;
  }): Promise<void> {
    // Business logic: Check if user already exists
    const existingUser = await this.userRepository.getByEmail(params.email);

    if (existingUser) {
      // User exists: Send email + push notification
      await Promise.all([
        this.notificationPort.sendEmail({
          to: params.email,
          subject: `Invitation à rejoindre ${params.organizationName}`,
          template: 'organization-invitation',
          data: {
            organizationId: params.organizationId,
            organizationName: params.organizationName,
            invitedBy: params.invitedBy,
            token: params.invitationToken,
          },
        }),
        // TODO: Implement push notification when push service is available
        // this.notificationPort.sendPush({
        //   userId: existingUser.id,
        //   title: 'Nouvelle invitation',
        //   body: `${params.invitedBy} vous invite à rejoindre ${params.organizationName}`,
        // }),
      ]);
    } else {
      // User doesn't exist: Send email only with signup link
      await this.notificationPort.sendEmail({
        to: params.email,
        subject: `Vous êtes invité à rejoindre DropIt`,
        template: 'organization-invitation-new-user',
        data: {
          organizationId: params.organizationId,
          organizationName: params.organizationName,
          invitedBy: params.invitedBy,
          token: params.invitationToken,
        },
      });
    }
  }

  async sendOtp(params: {
    userId: string;
    platform: 'mobile' | 'web';
  }): Promise<void> {
    // Get user
    const user = await this.userRepository.getOne(params.userId);
    if (!user) {
      throw new UserNotFoundException(`User with ID ${params.userId} not found`);
    }

    // TODO: Generate OTP code (should be done by an OTP service)
    const otpCode = '123456'; // Placeholder

    // Business logic: Choose transport based on platform
    if (params.platform === 'mobile') {
      // Mobile: SMS
      // TODO: Add phone field to User entity
      // For now, throw an error
      throw new UserPhoneNotFoundException(
        'SMS notifications are not yet implemented. User phone field is required.'
      );

      // When implemented:
      // if (!user.phone) {
      //   throw new UserPhoneNotFoundException(`User ${user.id} has no phone number`);
      // }
      // await this.notificationPort.sendSms({
      //   to: user.phone,
      //   message: `Your DropIt verification code is: ${otpCode}`,
      // });
    } else {
      // Web: Email
      if (!user.email) {
        throw new UserEmailNotFoundException(`User ${user.id} has no email address`);
      }

      await this.notificationPort.sendEmail({
        to: user.email,
        subject: 'Votre code de vérification',
        template: 'otp-code',
        data: {
          otp: otpCode,
          expiresIn: '10 minutes',
        },
      });
    }
  }

  async sendWorkoutReminder(params: {
    userId: string;
    workoutName: string;
    scheduledAt: Date;
  }): Promise<void> {
    // Get user
    const user = await this.userRepository.getOne(params.userId);
    if (!user) {
      throw new UserNotFoundException(`User with ID ${params.userId} not found`);
    }

    if (!user.email) {
      throw new UserEmailNotFoundException(`User ${user.id} has no email address`);
    }

    // Business logic: Send both email and push for reminders
    await Promise.all([
      this.notificationPort.sendEmail({
        to: user.email,
        subject: `Rappel: ${params.workoutName}`,
        template: 'workout-reminder',
        data: {
          workoutName: params.workoutName,
          scheduledAt: params.scheduledAt.toISOString(),
          userName: user.name,
        },
      }),
      // TODO: Implement push notification when push service is available
      // this.notificationPort.sendPush({
      //   userId: user.id,
      //   title: 'Rappel d\'entraînement',
      //   body: `${params.workoutName} prévu à ${params.scheduledAt.toLocaleTimeString()}`,
      // }),
    ]);
  }

  async sendPrAchieved(params: {
    userId: string;
    exerciseName: string;
    weight: number;
  }): Promise<void> {
    // Get user
    const user = await this.userRepository.getOne(params.userId);
    if (!user) {
      throw new UserNotFoundException(`User with ID ${params.userId} not found`);
    }

    // Business logic: Push notification only (immediate feedback)
    // TODO: Implement push notification when push service is available
    throw new Error('Push notifications are not yet implemented');

    // When implemented:
    // await this.notificationPort.sendPush({
    //   userId: user.id,
    //   title: '🎉 Nouveau Record Personnel!',
    //   body: `${params.exerciseName}: ${params.weight}kg`,
    // });
  }

  async sendPasswordReset(params: {
    email: string;
    resetToken: string;
  }): Promise<void> {
    // Business logic: Send password reset email (user may not exist yet)
    await this.notificationPort.sendEmail({
      to: params.email,
      subject: 'Réinitialisation de votre mot de passe',
      template: 'password-reset',
      data: {
        resetToken: params.resetToken,
      },
    });
  }
}
