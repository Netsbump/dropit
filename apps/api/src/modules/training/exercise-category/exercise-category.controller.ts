import { exerciseCategoryContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ExerciseCategoryService } from './exercise-category.service';

const c = exerciseCategoryContract;

@Controller()
export class ExerciseCategoryController {
  constructor(
    private readonly exerciseCategoryService: ExerciseCategoryService
  ) {}

  @TsRestHandler(c.getExerciseCategories)
  getExerciseCategories(): ReturnType<typeof tsRestHandler<typeof c.getExerciseCategories>> {
    return tsRestHandler(c.getExerciseCategories, async () => {
      try {
        const exerciseCategories =
          await this.exerciseCategoryService.getExerciseCategories();
        return {
          status: 200,
          body: exerciseCategories,
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

  @TsRestHandler(c.getExerciseCategory)
  getExerciseCategory(): ReturnType<typeof tsRestHandler<typeof c.getExerciseCategory>> {
    return tsRestHandler(c.getExerciseCategory, async ({ params }) => {
      try {
        const exerciseCategory =
          await this.exerciseCategoryService.getExerciseCategory(params.id);
        return {
          status: 200,
          body: exerciseCategory,
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

  @TsRestHandler(c.createExerciseCategory)
  createExerciseCategory(): ReturnType<typeof tsRestHandler<typeof c.createExerciseCategory>> {
    return tsRestHandler(c.createExerciseCategory, async ({ body }) => {
      try {
        const newExerciseCategory =
          await this.exerciseCategoryService.createExerciseCategory(body);
        return {
          status: 201,
          body: newExerciseCategory,
        };
      } catch (error) {
        if (error instanceof BadRequestException) {
          return {
            status: 400,
            body: {
              message: error.message,
            },
          };
        }
        throw error;
      }
    });
  }

  @TsRestHandler(c.updateExerciseCategory)
  updateExerciseCategory(): ReturnType<typeof tsRestHandler<typeof c.updateExerciseCategory>> {
    return tsRestHandler(c.updateExerciseCategory, async ({ params, body }) => {
      try {
        const updatedExerciseCategory =
          await this.exerciseCategoryService.updateExerciseCategory(
            params.id,
            body
          );
        return {
          status: 200,
          body: updatedExerciseCategory,
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

  @TsRestHandler(c.deleteExerciseCategory)
  deleteExerciseCategory(): ReturnType<typeof tsRestHandler<typeof c.deleteExerciseCategory>> {
    return tsRestHandler(c.deleteExerciseCategory, async ({ params }) => {
      try {
        await this.exerciseCategoryService.deleteExerciseCategory(params.id);

        return {
          status: 200,
          body: {
            message: 'Exercise category deleted successfully',
          },
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
}
