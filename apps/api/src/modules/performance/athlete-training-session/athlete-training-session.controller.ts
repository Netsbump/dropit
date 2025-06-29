import { apiContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { AthleteTrainingSessionService } from './athlete-training-session.service';

const c = apiContract.athleteTrainingSession;

@Controller()
export class AthleteTrainingSessionController {
  constructor(private readonly athleteTrainingSessionService: AthleteTrainingSessionService) {}

  @TsRestHandler(c.getAthleteTrainingSessions)
  getAthleteTrainingSessions(): ReturnType<typeof tsRestHandler<typeof c.getAthleteTrainingSessions>> {
    return tsRestHandler(c.getAthleteTrainingSessions, async () => {
      try {
        const athleteTrainingSessions =
          await this.athleteTrainingSessionService.getAthleteTrainingSessions();
        return { status: 200, body: athleteTrainingSessions };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.getAthleteTrainingSession)
  getAthleteTrainingSession(): ReturnType<typeof tsRestHandler<typeof c.getAthleteTrainingSession>> {
    return tsRestHandler(c.getAthleteTrainingSession, async ({ params }) => {
      try {
        const athleteTrainingSession =
          await this.athleteTrainingSessionService.getAthleteTrainingSession(
            params.athleteId,
            params.trainingSessionId
          );
        return { status: 200, body: athleteTrainingSession };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.getAthleteTrainingSessionsByAthlete)
  getAthleteTrainingSessionsByAthlete(): ReturnType<typeof tsRestHandler<typeof c.getAthleteTrainingSessionsByAthlete>> {
    return tsRestHandler(c.getAthleteTrainingSessionsByAthlete, async ({ params }) => {
      try {
        const athleteTrainingSessions =
          await this.athleteTrainingSessionService.getAthleteTrainingSessionsByAthlete(
            params.athleteId
          );
        return { status: 200, body: athleteTrainingSessions };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.getAthleteTrainingSessionsByTrainingSession)
  getAthleteTrainingSessionsByTrainingSession(): ReturnType<typeof tsRestHandler<typeof c.getAthleteTrainingSessionsByTrainingSession>> {
    return tsRestHandler(c.getAthleteTrainingSessionsByTrainingSession, async ({ params }) => {
      try {
        const athleteTrainingSessions =
          await this.athleteTrainingSessionService.getAthleteTrainingSessionsBySession(
            params.trainingSessionId
          );
        return { status: 200, body: athleteTrainingSessions };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.createAthleteTrainingSession)
  createAthleteTrainingSession(): ReturnType<typeof tsRestHandler<typeof c.createAthleteTrainingSession>> {
    return tsRestHandler(c.createAthleteTrainingSession, async ({ body }) => {
      try {
        const newAthleteTrainingSession =
          await this.athleteTrainingSessionService.createAthleteTrainingSession(body);
        return { status: 201, body: newAthleteTrainingSession };
      } catch (error) {
        if (error instanceof BadRequestException) {
          return { status: 400, body: { message: error.message } };
        }
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.updateAthleteTrainingSession)
  updateAthleteTrainingSession(): ReturnType<typeof tsRestHandler<typeof c.updateAthleteTrainingSession>> {
    return tsRestHandler(c.updateAthleteTrainingSession, async ({ params, body }) => {
      try {
        const updatedAthleteTrainingSession =
          await this.athleteTrainingSessionService.updateAthleteTrainingSession(
            params.athleteId,
            params.trainingSessionId,
            body
          );
        return { status: 200, body: updatedAthleteTrainingSession };
      } catch (error) {
        if (error instanceof BadRequestException) {
          return { status: 400, body: { message: error.message } };
        }
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.deleteAthleteTrainingSession)
  deleteAthleteTrainingSession(): ReturnType<typeof tsRestHandler<typeof c.deleteAthleteTrainingSession>> {
    return tsRestHandler(c.deleteAthleteTrainingSession, async ({ params }) => {
      try {
        await this.athleteTrainingSessionService.deleteAthleteTrainingSession(
          params.athleteId,
          params.trainingSessionId
        );
        return {
          status: 200,
          body: { message: 'AthleteTrainingSession deleted successfully' },
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }
}
