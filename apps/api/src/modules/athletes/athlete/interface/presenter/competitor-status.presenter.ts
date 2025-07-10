import { CompetitorStatusDto } from '@dropit/schemas';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

export const CompetitorStatusPresenter = {

  present(competitorStatuses: CompetitorStatusDto[]) {
    return {
      status: 200 as const,
      body: competitorStatuses,
    };
  },

  presentOne(competitorStatus: CompetitorStatusDto) {
    return {
      status: 200 as const,
      body: competitorStatus,
    };
  },

  presentSuccess(message: string) {
    return {
      status: 200 as const,
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
    
    console.error('TrainingSession error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  },

  presentError(error: Error) {

    if (error instanceof NotFoundException) {
      return { status: 404 as const, body: { message: error.message } };
    }
    
    console.error('TrainingSession error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
  
  
}