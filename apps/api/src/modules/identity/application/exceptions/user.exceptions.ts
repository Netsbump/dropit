/**
 * Custom exception class for user-related errors
 */
export class UserException extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500
  ) {
    super(message);
    this.name = 'UserException';
  }

  static notFound(userId: string): UserException {
    return new UserException(`User with ID ${userId} not found`, 404);
  }

  static unauthorized(message = 'Unauthorized'): UserException {
    return new UserException(message, 401);
  }

  static forbidden(message = 'Forbidden'): UserException {
    return new UserException(message, 403);
  }

  static badRequest(message: string): UserException {
    return new UserException(message, 400);
  }

  static invalidCredentials(): UserException {
    return new UserException('Invalid email or password', 401);
  }

  static emailAlreadyExists(email: string): UserException {
    return new UserException(`User with email ${email} already exists`, 400);
  }
}
