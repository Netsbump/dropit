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
