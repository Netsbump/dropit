import { WorkoutCategoryDto } from '@dropit/schemas';
import { WorkoutCategoryException } from '../../application/exceptions/workout-category.exceptions';

export const WorkoutCategoryPresenter = {
  present(categories: WorkoutCategoryDto[]) {
    return {
      status: 200 as const,
      body: categories,
    };
  },

  presentOne(category: WorkoutCategoryDto) {
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
    if (error instanceof WorkoutCategoryException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    console.error('WorkoutCategory unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
} 