import { EmailTemplate } from '../../../domain/notification-transport';

export const KIND = {
  OTP: 'otp',
  ORGANIZATION_INVITATION: 'organization-invitation',
  PASSWORD_RESET: 'password-reset',
  PR_ACHIEVED: 'pr-achieved',
  WORKOUT_REMINDER: 'workout-reminder'
} as const;

export type Kind = (typeof KIND)[keyof typeof KIND];

export const RECIPIENT_TYPE = {
  NEW_USER: 'new-user',
  EXISTING_USER: 'existing-user'
} as const;

export type RecipientType = (typeof RECIPIENT_TYPE)[keyof typeof RECIPIENT_TYPE];

export type NotificationRequest =
  | {
    kind: typeof KIND.ORGANIZATION_INVITATION;
    organizationId: string;
    organizationName: string;
    email: string;
    invitedBy: string;
    invitationToken: string;
    recipientType: RecipientType;
    userId?: string;
  }
  | {
    kind: typeof KIND.OTP;
    userId: string;
    platform: 'mobile' | 'web';
    // + otp, type si besoin (ou dans un sous-objet)
  }
  | {
    kind: typeof KIND.WORKOUT_REMINDER;
    userId: string;
    workoutName: string;
    scheduledAt: Date;
  }
  | {
    kind: typeof KIND.PR_ACHIEVED;
    userId: string;
    exerciseName: string;
    weight: number;
  }
  | {
    kind: typeof KIND.PASSWORD_RESET;
    email: string;
    resetToken: string;
  };

/**
 * Notification Port (Port OUT)
 *
 * @description
 * Defines the contract for sending notifications
 * This port is implemented by NotificationAdapter in the infrastructure layer.
 *  
 * @remarks
 */
export interface INotificationPort {
  send(request: NotificationRequest): Promise<void>;
}

/**
 * Injection token for INotificationPort
 * Use this token in @Inject() decorators
 */
export const NOTIFICATION_PORT = Symbol('NOTIFICATION_PORT');
