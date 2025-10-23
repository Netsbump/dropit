import { ExerciseDto } from '@dropit/schemas';
import { ExerciseException } from '../../application/exceptions/exercise.exceptions';

export const ExercisePresenter = {
  presentList(exercises: ExerciseDto[]) {
    return {
      status: 200 as const,
      body: exercises,
    };
  },

  presentOne(exercise: ExerciseDto) {
    return {
      status: 200 as const,
      body: exercise,
    };
  },

  presentSuccess(message: string) {
    return {
      status: 200 as const,
      body: { message },
    };
  },

  presentCreationSuccess(exerciseDto: ExerciseDto) {
    return {
      status: 201 as const,
      body: exerciseDto,
    };
  },

  presentError(error: Error) {
    if (error instanceof ExerciseException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    console.error('Exercise unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
} 