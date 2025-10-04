import { AthleteDto, AthleteDetailsDto } from '@dropit/schemas';
import { AthleteException } from '../../application/exceptions/athlete.exceptions';

export const AthletePresenter = {

  presentList(athletes: AthleteDto[]) {
    return {
      status: 200 as const,
      body: athletes,
    };
  },

  presentListDetails(athletes: AthleteDetailsDto[]) {
    return {
      status: 200 as const,
      body: athletes,
    };
  },

  presentOne(athlete: AthleteDto) {
    return {
      status: 200 as const,
      body: athlete,
    };
  },

  presentOneDetails(athlete: AthleteDetailsDto) {
    return {
      status: 200 as const,
      body: athlete,
    };
  },

  presentSuccess(message: string) {
    return {
      status: 200 as const,
      body: { message },
    };
  },

  presentCreationError(error: Error) {
    // Handle custom athlete exceptions
    if (error instanceof AthleteException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    // Fallback for unexpected errors
    console.error('Athlete unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  },

  presentError(error: Error) {
    // Handle custom athlete exceptions
    if (error instanceof AthleteException) {
      return {
        status: error.statusCode as 400 | 403 | 404 | 500,
        body: { message: error.message }
      };
    }

    // Fallback for unexpected errors
    console.error('Athlete unexpected error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }

}