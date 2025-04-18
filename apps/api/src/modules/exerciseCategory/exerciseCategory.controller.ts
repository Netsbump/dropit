import { exerciseCategoryContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ExerciseCategoryService } from './exerciseCategory.service';

const c = exerciseCategoryContract;

@Controller()
export class ExerciseCategoryController {
  constructor(
    private readonly exerciseCategoryService: ExerciseCategoryService
  ) {}

  @TsRestHandler(c.getExerciseCategories)
  async getExerciseCategories() {
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
  async getExerciseCategory() {
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
  async createExerciseCategory() {
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
  async updateExerciseCategory() {
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
  async deleteExerciseCategory() {
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
