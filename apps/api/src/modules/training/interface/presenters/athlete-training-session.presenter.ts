import { AthleteTrainingSessionDto } from '@dropit/schemas';

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
    console.error('AthleteTrainingSession error:', error);
    return {
      status: 500 as const,
      body: { message: 'An error occurred while processing the request' }
    };
  }
}
