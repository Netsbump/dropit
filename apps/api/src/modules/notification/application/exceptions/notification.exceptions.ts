/**
 * Base class for all notification exceptions
 */
export class NotificationException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotificationException';
  }
}

/**
 * Thrown when a user is not found for notification
 */
export class UserNotFoundException extends NotificationException {
  constructor(message: string) {
    super(message);
    this.name = 'UserNotFoundException';
  }
}

/**
 * Thrown when user has no email address
 */
export class UserEmailNotFoundException extends NotificationException {
  constructor(message: string) {
    super(message);
    this.name = 'UserEmailNotFoundException';
  }
}

/**
 * Thrown when user has no phone number for SMS
 */
export class UserPhoneNotFoundException extends NotificationException {
  constructor(message: string) {
    super(message);
    this.name = 'UserPhoneNotFoundException';
  }
}

/**
 * Thrown when email sending fails
 */
export class EmailSendFailedException extends NotificationException {
  constructor(message: string) {
    super(message);
    this.name = 'EmailSendFailedException';
  }
}

/**
 * Thrown when SMS sending fails
 */
export class SmsSendFailedException extends NotificationException {
  constructor(message: string) {
    super(message);
    this.name = 'SmsSendFailedException';
  }
}

/**
 * Thrown when push notification sending fails
 */
export class PushSendFailedException extends NotificationException {
  constructor(message: string) {
    super(message);
    this.name = 'PushSendFailedException';
  }
}

/**
 * Thrown when a notification service is not configured
 */
export class NotificationServiceNotConfiguredException extends NotificationException {
  constructor(service: string) {
    super(`${service} service is not configured`);
    this.name = 'NotificationServiceNotConfiguredException';
  }
}
