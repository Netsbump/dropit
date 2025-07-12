import { ComplexCategoryDto } from '@dropit/schemas';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

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
    
    console.error('ComplexCategory error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  },

  presentError(error: Error) {
    if (error instanceof NotFoundException) {
      return { status: 404 as const, body: { message: error.message } };
    }
    
    console.error('ComplexCategory error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
} 