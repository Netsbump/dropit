import { PLATFORM } from '../outbound/notification.port'

export type SendInvitationParams = {
  organizationId: string;
  organizationName: string;
  email: string;
  invitedBy: string;
  invitationToken: string;
}

export type SendOtpParams =
  | { origin: typeof PLATFORM.WEB, otp: string, email: string, type: 'sign-in' | 'email-verification' }
  | { origin: typeof PLATFORM.MOBILE, otp: string, phoneNumber: string };

/**
 * Notification Use Cases Port (Port IN)
 *
 * @description
 * Defines the contract for notification business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 *
 * @remarks
 * Following hexagonal architecture, this port is implemented by
 * NotificationUseCase and injected into controllers or other use cases
 * via dependency injection.
 */
export interface INotificationUseCases {
  /**
   * Send an invitation email to join an organization
   *
   * @description
   * Business logic:
   * - If user exists: sends email + push notification
   * - If user doesn't exist: sends email only with signup link
   */
  sendInvitation(params: SendInvitationParams
  ): Promise<void>;

  /** 
   * Send a one-time password (OTP) code
   *
   * @description
   */
  sendOtp(params: SendOtpParams
  ): Promise<void>;
}

/**
 * Injection token for INotificationUseCases
 * Use this token in @Inject() decorators
 */
export const NOTIFICATION_USE_CASES = Symbol('NOTIFICATION_USE_CASES');
