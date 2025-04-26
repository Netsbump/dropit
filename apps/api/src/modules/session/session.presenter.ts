import { SessionDto } from '@dropit/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class SessionPresenter {
  present(sessions: SessionDto[]) {
    return {
      status: 200 as const,
      body: sessions,
    };
  }

  presentError(error: Error) {
    if (error instanceof NotFoundException) {
      return {
        status: 404 as const,
        body: { message: error.message },
      };
    }

    console.error('Session error:', error);

    return {
      status: 500 as const,
      body: {
        message: 'Une erreur est survenue lors de la récupération des sessions',
      },
    };
  }
}
