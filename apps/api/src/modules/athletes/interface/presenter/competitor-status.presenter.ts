import { CompetitorStatusDto } from '@dropit/schemas';
import { CompetitorStatusException } from '../../application/exceptions/competitor-status.exceptions';

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
    // Handle custom competitor status exceptions
    if (error instanceof CompetitorStatusException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    // Fallback for unexpected errors
    console.error('CompetitorStatus unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  },

  presentError(error: Error) {
    // Handle custom competitor status exceptions
    if (error instanceof CompetitorStatusException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    // Fallback for unexpected errors
    console.error('CompetitorStatus unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }


}