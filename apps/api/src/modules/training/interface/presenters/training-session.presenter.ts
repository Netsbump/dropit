import { TrainingSessionDto } from '@dropit/schemas';
import { TrainingSessionException } from '../../application/exceptions/training-session.exceptions';

export const TrainingSessionPresenter ={
  present(sessions: TrainingSessionDto[]) {
    return {
      status: 200 as const,
      body: sessions,
    };
  },

  presentOne(session: TrainingSessionDto) {
    return {
      status: 200 as const,
      body: session,
    };
  },

  presentSuccess(message: string) {
    return {
      status: 200 as const,
      body: { message },
    };
  },

  presentCreationSuccess(message: string) {
    return {
      status: 201 as const,
      body: { message },
    };
  },

  presentCreationError(error: Error) {
    // Handle custom training session exceptions
    if (error instanceof TrainingSessionException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    // Fallback for unexpected errors
    console.error('TrainingSession unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  },

  presentError(error: Error) {
    // Handle custom training session exceptions
    if (error instanceof TrainingSessionException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    // Fallback for unexpected errors
    console.error('TrainingSession unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
}
