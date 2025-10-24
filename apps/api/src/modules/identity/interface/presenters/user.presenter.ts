import { UserDto } from '@dropit/schemas';
import { UserException } from '../../application/exceptions/user.exceptions';

export const UserPresenter = {
  presentOne(user: UserDto) {
    return {
      status: 200 as const,
      body: user,
    };
  },

  presentSuccess(message: string) {
    return {
      status: 200 as const,
      body: { message },
    };
  },

  presentError(error: Error) {
    // Handle custom user exceptions
    if (error instanceof UserException) {
      return {
        status: error.statusCode as 400 | 401 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    // Fallback for unexpected errors
    console.error('User unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
};
