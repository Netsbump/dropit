import { exerciseContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ExerciseService } from './exercise.service';

const c = exerciseContract;

@Controller()
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @TsRestHandler(c.getExercises)
  async getExercises() {
    return tsRestHandler(c.getExercises, async () => {
      try {
        const exercises = await this.exerciseService.getExercises();

        return {
          status: 200,
          body: exercises,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: {
              message: error.message,
            },
          };
        }

        throw error;
      }
    });
  }

  @TsRestHandler(c.getExercise)
  async getExercise() {
    return tsRestHandler(c.getExercise, async ({ params }) => {
      try {
        const exercise = await this.exerciseService.getExercise(params.id);

        return {
          status: 200,
          body: exercise,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: { message: error.message },
          };
        }

        throw error;
      }
    });
  }

  @TsRestHandler(c.createExercise)
  async createExercise() {
    return tsRestHandler(c.createExercise, async ({ body }) => {
      try {
        const newExercise = await this.exerciseService.createExercise(body);
        return {
          status: 201,
          body: newExercise,
        };
      } catch (error) {
        if (error instanceof BadRequestException) {
          return {
            status: 400,
            body: { message: error.message },
          };
        }
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: { message: error.message },
          };
        }

        throw error;
      }
    });
  }

  @TsRestHandler(c.updateExercise)
  async updateExercise() {
    return tsRestHandler(c.updateExercise, async ({ params, body }) => {
      try {
        const updatedExercise = await this.exerciseService.updateExercise(
          params.id,
          body
        );

        return {
          status: 200,
          body: updatedExercise,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: { message: error.message },
          };
        }

        throw error;
      }
    });
  }

  @TsRestHandler(c.deleteExercise)
  async deleteExercise() {
    return tsRestHandler(c.deleteExercise, async ({ params }) => {
      try {
        await this.exerciseService.deleteExercise(params.id);

        return {
          status: 200,
          body: { message: 'Exercise deleted successfully' },
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: { message: error.message },
          };
        }

        throw error;
      }
    });
  }

  @TsRestHandler(c.searchExercises)
  async searchExercises() {
    return tsRestHandler(c.searchExercises, async ({ query }) => {
      try {
        // Contrat : query = { like: z.string() }
        const exerciseFound = await this.exerciseService.searchExercises(
          query.like
        );

        return {
          status: 200,
          body: exerciseFound,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: { message: error.message },
          };
        }

        throw error;
      }
    });
  }
}
