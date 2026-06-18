import { OtpParams } from '../inbound/notification-use-cases.port';
import type { InvitableOrganizationRole } from '@dropit/schemas';

export const KIND = {
  OTP: 'otp',
  ORGANIZATION_INVITATION: 'organization-invitation',
  PASSWORD_RESET: 'password-reset',
  PR_ACHIEVED: 'pr-achieved',
  WORKOUT_REMINDER: 'workout-reminder',
  REQUEST_ACCESS: 'request-access',
} as const;

export const RECIPIENT_TYPE = {
  NEW_USER: 'new-user',
  EXISTING_USER: 'existing-user',
} as const;

export type RecipientType =
  (typeof RECIPIENT_TYPE)[keyof typeof RECIPIENT_TYPE];

export type NotificationRequest =
  | {
      kind: typeof KIND.ORGANIZATION_INVITATION;
      organizationId: string;
      organizationName: string;
      email: string;
      invitedBy: string;
      invitationToken: string;
      organizationRole: InvitableOrganizationRole;
      recipientType: RecipientType;
      hasOtherOrganization: boolean;
    }
  | {
      kind: typeof KIND.OTP;
      otpParams: OtpParams;
    }
  | {
      kind: typeof KIND.REQUEST_ACCESS;
      email: string;
      name: string;
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
