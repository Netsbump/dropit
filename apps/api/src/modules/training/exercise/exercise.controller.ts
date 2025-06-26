import { exerciseContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ExerciseService } from './exercise.service';
import { PermissionsGuard } from '../../permissions/permissions.guard';
import { RequirePermissions } from '../../permissions/permissions.decorator';

const c = exerciseContract;

@Controller()
@UseGuards(PermissionsGuard)
export class ExerciseController {
  constructor(private readonly exerciseService: ExerciseService) {}

  @TsRestHandler(c.getExercises)
  @RequirePermissions('read')
  getExercises(): ReturnType<typeof tsRestHandler<typeof c.getExercises>> {
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
  @RequirePermissions('read')
  getExercise(): ReturnType<typeof tsRestHandler<typeof c.getExercise>> {
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
  @RequirePermissions('create')
  createExercise(): ReturnType<typeof tsRestHandler<typeof c.createExercise>> {
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
  @RequirePermissions('update')
  updateExercise(): ReturnType<typeof tsRestHandler<typeof c.updateExercise>> {
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
  @RequirePermissions('delete')
  deleteExercise(): ReturnType<typeof tsRestHandler<typeof c.deleteExercise>> {
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
  @RequirePermissions('read')
  searchExercises(): ReturnType<typeof tsRestHandler<typeof c.searchExercises>> {
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
