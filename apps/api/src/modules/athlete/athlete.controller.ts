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
import { CreateAthleteUseCase } from './use-cases/create-athlete.use-case';
import { DeleteAthleteUseCase } from './use-cases/delete-athlete.use-case';
import { GetAthleteUseCase } from './use-cases/get-athlete.use-case';
import { GetAthletesUseCase } from './use-cases/get-athletes.use-case';
import { UpdateAthleteUseCase } from './use-cases/update-athlete.use-case';
const c = nestControllerContract(apiContract.athlete);
type RequestShapes = NestRequestShapes<typeof c>;

@Controller()
export class AthleteController
  implements NestControllerInterface<typeof apiContract.athlete>
{
  constructor(
    private readonly getAthletesUseCase: GetAthletesUseCase,
    private readonly getAthleteUseCase: GetAthleteUseCase,
    private readonly createAthleteUseCase: CreateAthleteUseCase,
    private readonly updateAthleteUseCase: UpdateAthleteUseCase,
    private readonly deleteAthleteUseCase: DeleteAthleteUseCase
  ) {}

  @TsRest(c.getAthletes)
  async getAthletes(@TsRestRequest() request: RequestShapes['getAthletes']) {
    try {
      const athletes = await this.getAthletesUseCase.execute();

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
      const athlete = await this.getAthleteUseCase.execute(params.id);

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
      const newAthlete = await this.createAthleteUseCase.execute(body);
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
      const updatedAthlete = await this.updateAthleteUseCase.execute(
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
      await this.deleteAthleteUseCase.execute(params.id);

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
