import { apiContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { AthleteSessionService } from './athlete-session.service';

const c = apiContract.athleteSession;

@Controller()
export class AthleteSessionController {
  constructor(private readonly athleteSessionService: AthleteSessionService) {}

  @TsRestHandler(c.getAthleteSessions)
  getAthleteSessions(): ReturnType<typeof tsRestHandler<typeof c.getAthleteSessions>> {
    return tsRestHandler(c.getAthleteSessions, async () => {
      try {
        const athleteSessions =
          await this.athleteSessionService.getAthleteSessions();
        return { status: 200, body: athleteSessions };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.getAthleteSession)
  getAthleteSession(): ReturnType<typeof tsRestHandler<typeof c.getAthleteSession>> {
    return tsRestHandler(c.getAthleteSession, async ({ params }) => {
      try {
        const athleteSession =
          await this.athleteSessionService.getAthleteSession(
            params.athleteId,
            params.sessionId
          );
        return { status: 200, body: athleteSession };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.getAthleteSessionsByAthlete)
  getAthleteSessionsByAthlete(): ReturnType<typeof tsRestHandler<typeof c.getAthleteSessionsByAthlete>> {
    return tsRestHandler(c.getAthleteSessionsByAthlete, async ({ params }) => {
      try {
        const athleteSessions =
          await this.athleteSessionService.getAthleteSessionsByAthlete(
            params.athleteId
          );
        return { status: 200, body: athleteSessions };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.getAthleteSessionsBySession)
  getAthleteSessionsBySession(): ReturnType<typeof tsRestHandler<typeof c.getAthleteSessionsBySession>> {
    return tsRestHandler(c.getAthleteSessionsBySession, async ({ params }) => {
      try {
        const athleteSessions =
          await this.athleteSessionService.getAthleteSessionsBySession(
            params.sessionId
          );
        return { status: 200, body: athleteSessions };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.createAthleteSession)
  createAthleteSession(): ReturnType<typeof tsRestHandler<typeof c.createAthleteSession>> {
    return tsRestHandler(c.createAthleteSession, async ({ body }) => {
      try {
        const newAthleteSession =
          await this.athleteSessionService.createAthleteSession(body);
        return { status: 201, body: newAthleteSession };
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

  @TsRestHandler(c.updateAthleteSession)
  updateAthleteSession(): ReturnType<typeof tsRestHandler<typeof c.updateAthleteSession>> {
    return tsRestHandler(c.updateAthleteSession, async ({ params, body }) => {
      try {
        const updatedAthleteSession =
          await this.athleteSessionService.updateAthleteSession(
            params.athleteId,
            params.sessionId,
            body
          );
        return { status: 200, body: updatedAthleteSession };
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

  @TsRestHandler(c.deleteAthleteSession)
  deleteAthleteSession(): ReturnType<typeof tsRestHandler<typeof c.deleteAthleteSession>> {
    return tsRestHandler(c.deleteAthleteSession, async ({ params }) => {
      try {
        await this.athleteSessionService.deleteAthleteSession(
          params.athleteId,
          params.sessionId
        );
        return {
          status: 200,
          body: { message: 'AthleteSession deleted successfully' },
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
