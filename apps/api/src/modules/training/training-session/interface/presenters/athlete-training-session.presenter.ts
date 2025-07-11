import { AthleteTrainingSessionDto } from '@dropit/schemas';
import { NotFoundException } from '@nestjs/common';

export const AthleteTrainingSessionPresenter = {
  present(sessions: AthleteTrainingSessionDto[]) {
    return {
      status: 200 as const,
      body: sessions,
    };
  },

  presentOne(session: AthleteTrainingSessionDto) {
    return {
      status: 200 as const,
      body: session,
    };
  },

  presentError(error: Error) {

    if (error instanceof NotFoundException) {
      return { status: 404 as const, body: { message: error.message } };
    }
    
    console.error('AthleteTrainingSession error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
}
