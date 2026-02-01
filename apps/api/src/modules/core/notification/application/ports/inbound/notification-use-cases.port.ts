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
  sendInvitation(params: {
    organizationId: string;
    organizationName: string;
    email: string;
    invitedBy: string;
    invitationToken: string;
  }): Promise<void>;

  /**
   * Send a one-time password (OTP) code
   *
   * @description
   * Business logic:
   * - Mobile platform: sends SMS
   * - Web platform: sends email
   */
  sendOtp(params: {
    userId: string;
    platform: 'mobile' | 'web';
  }): Promise<void>;

  /**
   * Send a workout reminder notification
   *
   * @description
   * Sends both email and push notification for reminders
   */
  sendWorkoutReminder(params: {
    userId: string;
    workoutName: string;
    scheduledAt: Date;
  }): Promise<void>;

  /**
   * Send a notification when a personal record is achieved
   *
   * @description
   * Sends push notification only (immediate feedback)
   */
  sendPrAchieved(params: {
    userId: string;
    exerciseName: string;
    weight: number;
  }): Promise<void>;

  /**
   * Send a password reset email
   *
   * @description
   * Sends an email with a password reset link
   */
  sendPasswordReset(params: {
    email: string;
    resetToken: string;
  }): Promise<void>;
}

/**
 * Injection token for INotificationUseCases
 * Use this token in @Inject() decorators
 */
export const NOTIFICATION_USE_CASES = Symbol('NOTIFICATION_USE_CASES');
