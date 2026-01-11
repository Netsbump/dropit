/**
 * Notification Transport Types
 *
 * @description
 * Defines the available transport channels for notifications.
 * Use union types instead of enums for better TypeScript experience.
 */
export type NotificationTransport = 'email' | 'sms' | 'push';

/**
 * Email Template Types
 *
 * @description
 * Defines all available email templates used in the application.
 */
export type EmailTemplate =
  | 'organization-invitation'
  | 'organization-invitation-new-user'
  | 'otp-code'
  | 'workout-reminder'
  | 'pr-achieved'
  | 'password-reset';
