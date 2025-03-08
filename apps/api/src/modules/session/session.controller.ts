import { apiContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import {
  NestControllerInterface,
  NestRequestShapes,
  TsRest,
  TsRestRequest,
  nestControllerContract,
} from '@ts-rest/nest';
import { SessionService } from './session.service';

const c = nestControllerContract(apiContract.session);
type RequestShapes = NestRequestShapes<typeof c>;

@Controller()
export class SessionController
  implements NestControllerInterface<typeof apiContract.session>
{
  constructor(private readonly sessionService: SessionService) {}

  @TsRest(c.getSessions)
  async getSessions(@TsRestRequest() request: RequestShapes['getSessions']) {
    try {
      const sessions = await this.sessionService.getSessions();
      return { status: 200 as const, body: sessions };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { status: 404 as const, body: { message: error.message } };
      }
      throw error;
    }
  }

  @TsRest(c.getSession)
  async getSession(@TsRestRequest() { params }: RequestShapes['getSession']) {
    try {
      const session = await this.sessionService.getSession(params.id);
      return { status: 200 as const, body: session };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { status: 404 as const, body: { message: error.message } };
      }
      throw error;
    }
  }

  @TsRest(c.getSessionsByAthlete)
  async getSessionsByAthlete(
    @TsRestRequest() { params }: RequestShapes['getSessionsByAthlete']
  ) {
    try {
      const sessions = await this.sessionService.getSessionsByAthlete(
        params.athleteId
      );
      return { status: 200 as const, body: sessions };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { status: 404 as const, body: { message: error.message } };
      }
      throw error;
    }
  }

  @TsRest(c.createSession)
  async createSession(
    @TsRestRequest() { body }: RequestShapes['createSession']
  ) {
    try {
      const newSession = await this.sessionService.createSession(body);
      return { status: 201 as const, body: newSession };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return { status: 400 as const, body: { message: error.message } };
      }
      if (error instanceof NotFoundException) {
        return { status: 404 as const, body: { message: error.message } };
      }
      throw error;
    }
  }

  @TsRest(c.updateSession)
  async updateSession(
    @TsRestRequest() { params, body }: RequestShapes['updateSession']
  ) {
    try {
      const updatedSession = await this.sessionService.updateSession(
        params.id,
        body
      );
      return { status: 200 as const, body: updatedSession };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return { status: 400 as const, body: { message: error.message } };
      }
      if (error instanceof NotFoundException) {
        return { status: 404 as const, body: { message: error.message } };
      }
      throw error;
    }
  }

  @TsRest(c.completeSession)
  async completeSession(
    @TsRestRequest() { params, body }: RequestShapes['completeSession']
  ) {
    try {
      const completedSession = await this.sessionService.completeSession(
        params.id,
        body.completedDate
      );
      return { status: 200 as const, body: completedSession };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { status: 404 as const, body: { message: error.message } };
      }
      throw error;
    }
  }

  @TsRest(c.deleteSession)
  async deleteSession(
    @TsRestRequest() { params }: RequestShapes['deleteSession']
  ) {
    try {
      await this.sessionService.deleteSession(params.id);
      return {
        status: 200 as const,
        body: { message: 'Session deleted successfully' },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { status: 404 as const, body: { message: error.message } };
      }
      throw error;
    }
  }
}
