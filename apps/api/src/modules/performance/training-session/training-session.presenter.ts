import { TrainingSessionDto } from '@dropit/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class TrainingSessionPresenter {
  present(sessions: TrainingSessionDto[]) {
    return {
      status: 200 as const,
      body: sessions,
    };
  }

  presentOne(session: TrainingSessionDto) {
    return {
      status: 200 as const,
      body: session,
    };
  }

  presentError(error: Error) {
    if (error instanceof NotFoundException) {
      return {
        status: 404 as const,
        body: { message: error.message },
      };
    }

    console.error('TrainingSession error:', error);

    return {
      status: 500 as const,
      body: {
        message:
          'An error occurred while retrieving training sessions',
      },  
    };
  }
}
