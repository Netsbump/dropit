import { AthleteDto, AthleteDetailsDto } from '@dropit/schemas';
import { ForbiddenException, BadRequestException, NotFoundException } from '@nestjs/common';

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

    if (error instanceof BadRequestException) {
      return { status: 400 as const, body: { message: error.message } };
    }

    if (error instanceof ForbiddenException) {
      return { status: 403 as const, body: { message: error.message } };
    }

    if (error instanceof NotFoundException) {
      return { status: 404 as const, body: { message: error.message } };
    }
    
    console.error('Athlete error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  },

  presentError(error: Error) {

    if (error instanceof NotFoundException) {
      return { status: 404 as const, body: { message: error.message } };
    }
    
    console.error('Athlete error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
  
}