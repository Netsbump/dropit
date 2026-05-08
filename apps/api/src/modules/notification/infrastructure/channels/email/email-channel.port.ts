import { NotificationRequest } from 'src/modules/notification/application/ports/outbound/notification.port';

/**
 * Rendered email ready to be sent by a transport (Brevo, Maildev).
 * Produced by EmailAdapter after template rendering.
 */
export interface EmailData {
  to: string;
  subject: string;
  htmlContent: string;
}

/**
 * Email Channel — receives a NotificationRequest, renders it into an EmailData,
 * and delegates to the appropriate transport.
 * Implemented by EmailAdapter.
 */
export interface IEmailChannel {
  send(notificationRequest: NotificationRequest): Promise<void>;
}

export const EMAIL_CHANNEL_PORT = Symbol('EMAIL_CHANNEL_PORT');

/**
 * Email Transport — sends a rendered EmailData through a specific provider.
 * Implemented by BrevoAdapter (production) and MaildevAdapter (development).
 */
export interface IEmailTransport {
  send(emailData: EmailData): Promise<void>;
}

export const EMAIL_TRANSPORT = Symbol('EMAIL_TRANSPORT');
