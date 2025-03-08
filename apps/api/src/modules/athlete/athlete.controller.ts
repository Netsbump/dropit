import { apiContract } from '@dropit/contract';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  NestControllerInterface,
  NestRequestShapes,
  TsRest,
  TsRestRequest,
  nestControllerContract,
} from '@ts-rest/nest';
import { AthleteService } from './athlete.service';

const c = nestControllerContract(apiContract.athlete);
type RequestShapes = NestRequestShapes<typeof c>;

@Controller()
export class AthleteController
  implements NestControllerInterface<typeof apiContract.athlete>
{
  constructor(private readonly athleteService: AthleteService) {}

  @TsRest(c.getAthletes)
  async getAthletes(@TsRestRequest() request: RequestShapes['getAthletes']) {
    try {
      const athletes = await this.athleteService.getAthletes();

      return { status: 200 as const, body: athletes };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { status: 404 as const, body: { message: error.message } };
      }

      throw error;
    }
  }

  @TsRest(c.getAthlete)
  async getAthlete(@TsRestRequest() { params }: RequestShapes['getAthlete']) {
    try {
      const athlete = await this.athleteService.getAthlete(params.id);

      return {
        status: 200 as const,
        body: athlete,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: 404 as const,
          body: { message: error.message },
        };
      }

      throw error;
    }
  }

  @TsRest(c.createAthlete)
  async createAthlete(
    @TsRestRequest() { body }: RequestShapes['createAthlete']
  ) {
    try {
      const newAthlete = await this.athleteService.createAthlete(body);
      return {
        status: 201 as const,
        body: newAthlete,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          status: 400 as const,
          body: { message: error.message },
        };
      }
      if (error instanceof NotFoundException) {
        return {
          status: 404 as const,
          body: { message: error.message },
        };
      }

      throw error;
    }
  }

  @TsRest(c.updateAthlete)
  async updateAthlete(
    @TsRestRequest() { params, body }: RequestShapes['updateAthlete']
  ) {
    try {
      const updatedAthlete = await this.athleteService.updateAthlete(
        params.id,
        body
      );

      return {
        status: 200 as const,
        body: updatedAthlete,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: 404 as const,
          body: { message: error.message },
        };
      }
      throw error;
    }
  }

  @TsRest(c.deleteAthlete)
  async deleteAthlete(
    @TsRestRequest() { params }: RequestShapes['deleteAthlete']
  ) {
    try {
      await this.athleteService.deleteAthlete(params.id);

      return {
        status: 200 as const,
        body: { message: 'Athlete deleted successfully' },
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: 404 as const,
          body: { message: error.message },
        };
      }
      throw error;
    }
  }
}
