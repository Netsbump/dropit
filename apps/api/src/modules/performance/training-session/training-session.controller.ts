import { apiContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { TrainingSessionService } from './training-session.service';
import { TrainingSessionUseCase } from './training-session.use-case';

const c = apiContract.trainingSession;

@Controller()
export class TrainingSessionController {
  constructor(
    private readonly trainingSessionService: TrainingSessionService,
    private readonly trainingSessionUseCase: TrainingSessionUseCase
  ) {}

  @TsRestHandler(c.getTrainingSessions)
  getTrainingSessions(): ReturnType<typeof tsRestHandler<typeof c.getTrainingSessions>> {
    return tsRestHandler(c.getTrainingSessions, async () => {
      return this.trainingSessionUseCase.getAll();
    });
  }

  @TsRestHandler(c.getTrainingSession)
  getTrainingSession(): ReturnType<typeof tsRestHandler<typeof c.getTrainingSession>> {
    return tsRestHandler(c.getTrainingSession, async ({ params }) => {
      return this.trainingSessionUseCase.getOne(params.id);
    });
  }

  @TsRestHandler(c.getTrainingSessionsByAthlete)
  getTrainingSessionsByAthlete(): ReturnType<typeof tsRestHandler<typeof c.getTrainingSessionsByAthlete>> {
    return tsRestHandler(c.getTrainingSessionsByAthlete, async ({ params }) => {
      try {
        const trainingSessions = await this.trainingSessionService.getTrainingSessionsByAthlete(
          params.athleteId
        );
        return { status: 200, body: trainingSessions };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.createTrainingSession)
  createTrainingSession(): ReturnType<typeof tsRestHandler<typeof c.createTrainingSession>> {
    return tsRestHandler(c.createTrainingSession, async ({ body }) => {
      try {
        const newTrainingSession = await this.trainingSessionService.createTrainingSession(body);
        return { status: 201, body: newTrainingSession };
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

  @TsRestHandler(c.updateTrainingSession)
  updateTrainingSession(): ReturnType<typeof tsRestHandler<typeof c.updateTrainingSession>> {
    return tsRestHandler(c.updateTrainingSession, async ({ params, body }) => {
      try {
        const updatedTrainingSession = await this.trainingSessionService.updateTrainingSession(
          params.id,
          body
        );
        return { status: 200, body: updatedTrainingSession };
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

  @TsRestHandler(c.completeTrainingSession)
  completeTrainingSession(): ReturnType<typeof tsRestHandler<typeof c.completeTrainingSession>> {
    return tsRestHandler(c.completeTrainingSession, async ({ params, body }) => {
      try {
        const completedTrainingSession = await this.trainingSessionService.completeTrainingSession(
          params.id,
          body.completedDate
        );
        return { status: 200, body: completedTrainingSession };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }   

  @TsRestHandler(c.deleteTrainingSession) 
  deleteTrainingSession(): ReturnType<typeof tsRestHandler<typeof c.deleteTrainingSession>> {
    return tsRestHandler(c.deleteTrainingSession, async ({ params }) => {
      try {
        await this.trainingSessionService.deleteTrainingSession(params.id);
        return {
          status: 200,
          body: { message: 'TrainingSession deleted successfully' },
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
