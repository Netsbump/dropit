/**
 * Thrown when email delivery fails (Brevo API error, SMTP error, etc.)
 */
export class EmailSendFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EmailSendFailedException';
  }
}

/**
 * Thrown when SMS delivery fails (Twilio error, etc.)
 */
export class SmsSendFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SmsSendFailedException';
  }
}

/**
 * Thrown when push notification delivery fails (Firebase error, etc.)
 */
export class PushSendFailedException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PushSendFailedException';
  }
}

/**
 * Thrown when a notification channel is not yet configured
 */
export class NotificationServiceNotConfiguredException extends Error {
  constructor(service: string) {
    super(`${service} service is not configured`);
    this.name = 'NotificationServiceNotConfiguredException';
  }
}
