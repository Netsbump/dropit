import { WorkoutDto } from '@dropit/schemas';
import { WorkoutException } from '../../application/exceptions/workout.exceptions';

export const WorkoutPresenter = {
  presentList(workouts: WorkoutDto[]) {
    return {
      status: 200 as const,
      body: workouts,
    };
  },

  presentOne(workout: WorkoutDto) {
    return {
      status: 200 as const,
      body: workout,
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

  presentError(error: Error) {
    // Handle custom workout exceptions
    if (error instanceof WorkoutException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    // Fallback for unexpected errors
    console.error('Workout unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
} 