import { ComplexCategoryDto } from '@dropit/schemas';
import { ComplexCategoryException } from '../../application/exceptions/complex-category.exceptions';

export const ComplexCategoryPresenter = {
  present(categories: ComplexCategoryDto[]) {
    return {
      status: 200 as const,
      body: categories,
    };
  },

  presentOne(category: ComplexCategoryDto) {
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
    if (error instanceof ComplexCategoryException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    console.error('ComplexCategory unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
} 