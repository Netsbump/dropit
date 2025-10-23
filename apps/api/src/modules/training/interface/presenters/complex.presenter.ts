import { ComplexDto } from '@dropit/schemas';
import { ComplexException } from '../../application/exceptions/complex.exceptions';

export const ComplexPresenter = {
  present(complexes: ComplexDto[]) {
    return {
      status: 200 as const,
      body: complexes,
    };
  },

  presentOne(complex: ComplexDto) {
    return {
      status: 200 as const,
      body: complex,
    };
  },

  presentSuccess(message: string) {
    return {
      status: 200 as const,
      body: { message },
    };
  },

  presentCreationSuccess(complexDto: ComplexDto) {
    return {
      status: 201 as const,
      body: complexDto,
    };
  },

  presentCreationError(error: Error) {
    // Handle custom complex exceptions
    if (error instanceof ComplexException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    // Fallback for unexpected errors
    console.error('Complex unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  },

  presentError(error: Error) {
    // Handle custom complex exceptions
    if (error instanceof ComplexException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    // Fallback for unexpected errors
    console.error('Complex unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
} 