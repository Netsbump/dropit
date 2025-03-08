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
import { AthleteSessionService } from './athlete-session.service';

const c = nestControllerContract(apiContract.athleteSession);
type RequestShapes = NestRequestShapes<typeof c>;

@Controller()
export class AthleteSessionController
  implements NestControllerInterface<typeof apiContract.athleteSession>
{
  constructor(private readonly athleteSessionService: AthleteSessionService) {}

  @TsRest(c.getAthleteSessions)
  async getAthleteSessions(
    @TsRestRequest() request: RequestShapes['getAthleteSessions']
  ) {
    try {
      const athleteSessions =
        await this.athleteSessionService.getAthleteSessions();
      return { status: 200 as const, body: athleteSessions };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { status: 404 as const, body: { message: error.message } };
      }
      throw error;
    }
  }

  @TsRest(c.getAthleteSession)
  async getAthleteSession(
    @TsRestRequest() { params }: RequestShapes['getAthleteSession']
  ) {
    try {
      const athleteSession = await this.athleteSessionService.getAthleteSession(
        params.athleteId,
        params.sessionId
      );
      return { status: 200 as const, body: athleteSession };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { status: 404 as const, body: { message: error.message } };
      }
      throw error;
    }
  }

  @TsRest(c.getAthleteSessionsByAthlete)
  async getAthleteSessionsByAthlete(
    @TsRestRequest() { params }: RequestShapes['getAthleteSessionsByAthlete']
  ) {
    try {
      const athleteSessions =
        await this.athleteSessionService.getAthleteSessionsByAthlete(
          params.athleteId
        );
      return { status: 200 as const, body: athleteSessions };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { status: 404 as const, body: { message: error.message } };
      }
      throw error;
    }
  }

  @TsRest(c.getAthleteSessionsBySession)
  async getAthleteSessionsBySession(
    @TsRestRequest() { params }: RequestShapes['getAthleteSessionsBySession']
  ) {
    try {
      const athleteSessions =
        await this.athleteSessionService.getAthleteSessionsBySession(
          params.sessionId
        );
      return { status: 200 as const, body: athleteSessions };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { status: 404 as const, body: { message: error.message } };
      }
      throw error;
    }
  }

  @TsRest(c.createAthleteSession)
  async createAthleteSession(
    @TsRestRequest() { body }: RequestShapes['createAthleteSession']
  ) {
    try {
      const newAthleteSession =
        await this.athleteSessionService.createAthleteSession(body);
      return { status: 201 as const, body: newAthleteSession };
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

  @TsRest(c.updateAthleteSession)
  async updateAthleteSession(
    @TsRestRequest() { params, body }: RequestShapes['updateAthleteSession']
  ) {
    try {
      const updatedAthleteSession =
        await this.athleteSessionService.updateAthleteSession(
          params.athleteId,
          params.sessionId,
          body
        );
      return { status: 200 as const, body: updatedAthleteSession };
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

  @TsRest(c.deleteAthleteSession)
  async deleteAthleteSession(
    @TsRestRequest() { params }: RequestShapes['deleteAthleteSession']
  ) {
    try {
      await this.athleteSessionService.deleteAthleteSession(
        params.athleteId,
        params.sessionId
      );
      return {
        status: 200 as const,
        body: { message: 'AthleteSession deleted successfully' },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { status: 404 as const, body: { message: error.message } };
      }
      throw error;
    }
  }
}
