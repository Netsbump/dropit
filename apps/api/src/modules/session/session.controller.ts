import { apiContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { SessionService } from './session.service';

const c = apiContract.session;

@Controller()
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @TsRestHandler(c.getSessions)
  async getSessions() {
    return tsRestHandler(c.getSessions, async () => {
      try {
        const sessions = await this.sessionService.getSessions();
        return { status: 200, body: sessions };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.getSession)
  async getSession() {
    return tsRestHandler(c.getSession, async ({ params }) => {
      try {
        const session = await this.sessionService.getSession(params.id);
        return { status: 200, body: session };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.getSessionsByAthlete)
  async getSessionsByAthlete() {
    return tsRestHandler(c.getSessionsByAthlete, async ({ params }) => {
      try {
        const sessions = await this.sessionService.getSessionsByAthlete(
          params.athleteId
        );
        return { status: 200, body: sessions };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.createSession)
  async createSession() {
    return tsRestHandler(c.createSession, async ({ body }) => {
      try {
        const newSession = await this.sessionService.createSession(body);
        return { status: 201, body: newSession };
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

  @TsRestHandler(c.updateSession)
  async updateSession() {
    return tsRestHandler(c.updateSession, async ({ params, body }) => {
      try {
        const updatedSession = await this.sessionService.updateSession(
          params.id,
          body
        );
        return { status: 200, body: updatedSession };
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

  @TsRestHandler(c.completeSession)
  async completeSession() {
    return tsRestHandler(c.completeSession, async ({ params, body }) => {
      try {
        const completedSession = await this.sessionService.completeSession(
          params.id,
          body.completedDate
        );
        return { status: 200, body: completedSession };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return { status: 404, body: { message: error.message } };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.deleteSession)
  async deleteSession() {
    return tsRestHandler(c.deleteSession, async ({ params }) => {
      try {
        await this.sessionService.deleteSession(params.id);
        return {
          status: 200,
          body: { message: 'Session deleted successfully' },
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
