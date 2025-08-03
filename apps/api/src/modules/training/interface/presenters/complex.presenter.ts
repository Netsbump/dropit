import { ComplexDto } from '@dropit/schemas';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

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
    if (error instanceof BadRequestException) {
      return { status: 400 as const, body: { message: error.message } };
    }

    if (error instanceof ForbiddenException) {
      return { status: 403 as const, body: { message: error.message } };
    }

    if (error instanceof NotFoundException) {
      return { status: 404 as const, body: { message: error.message } };
    }
    
    console.error('Complex error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  },

  presentError(error: Error) {
    if (error instanceof NotFoundException) {
      return { status: 404 as const, body: { message: error.message } };
    }
    
    console.error('Complex error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
} 