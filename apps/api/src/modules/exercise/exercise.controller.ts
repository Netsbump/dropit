import { exerciseContract } from '@dropit/contract';
import { UpdateExercise } from '@dropit/schemas';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import {
  NestControllerInterface,
  NestRequestShapes,
  TsRest,
  TsRestHandler,
  TsRestRequest,
  nestControllerContract,
} from '@ts-rest/nest';
import { ExerciseService } from './exercise.service';

const c = nestControllerContract(exerciseContract);
type RequestShapes = NestRequestShapes<typeof c>;

@Controller()
export class ExerciseController implements NestControllerInterface<typeof c> {
  constructor(private readonly exerciseService: ExerciseService) {}

  @TsRest(c.getExercises)
  async getExercises(@TsRestRequest() request: RequestShapes['getExercises']) {
    try {
      const exercises = await this.exerciseService.getExercises();

      return {
        status: 200 as const,
        body: exercises,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return {
          status: 404 as const,
          body: {
            message: error.message,
          },
        };
      }

      throw error;
    }
  }

  @TsRest(c.getExercise)
  async getExercise(@TsRestRequest() { params }: RequestShapes['getExercise']) {
    // Dans le contrat, pathParams = { id: z.string() }
    // => on cast en number (ou on utilise z.coerce.number() dans le contrat)
    try {
      const exercise = await this.exerciseService.getExercise(params.id);

      return {
        status: 200 as const,
        body: exercise,
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

  @TsRest(c.createExercise)
  async createExercise(
    @TsRestRequest() { body }: RequestShapes['createExercise']
  ) {
    try {
      const newExercise = await this.exerciseService.createExercise(body);
      return {
        status: 201 as const,
        body: newExercise,
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

  @TsRest(c.updateExercise)
  async updateExercise(
    @TsRestRequest() { params, body }: RequestShapes['updateExercise']
  ) {
    try {
      const updatedExercise = await this.exerciseService.updateExercise(
        params.id,
        body
      );

      return {
        status: 200 as const,
        body: updatedExercise,
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

  @TsRest(c.deleteExercise)
  async deleteExercise(
    @TsRestRequest() { params }: RequestShapes['deleteExercise']
  ) {
    try {
      await this.exerciseService.deleteExercise(params.id);

      return {
        status: 200 as const,
        body: { message: 'Exercise deleted successfully' },
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

  @TsRestHandler(c.searchExercises)
  async searchExercises(
    @TsRestRequest() { query }: RequestShapes['searchExercises']
  ) {
    try {
      // Contrat : query = { like: z.string() }
      const exerciseFound = await this.exerciseService.searchExercises(
        query.like
      );

      return {
        status: 200 as const,
        body: exerciseFound,
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
