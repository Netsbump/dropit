import { ExerciseCategoryDto } from '@dropit/schemas';
import { ExerciseCategoryException } from '../../application/exceptions/exercise-category.exceptions';

export const ExerciseCategoryPresenter = {
  present(categories: ExerciseCategoryDto[]) {
    return {
      status: 200 as const,
      body: categories,
    };
  },

  presentOne(category: ExerciseCategoryDto) {
    return {
      status: 200 as const,
      body: category,
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
    if (error instanceof ExerciseCategoryException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    console.error('ExerciseCategory unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
}