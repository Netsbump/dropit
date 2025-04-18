import { workoutCategoryContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { WorkoutCategoryService } from './workout-category.service';

const c = workoutCategoryContract;

@Controller()
export class WorkoutCategoryController {
  constructor(
    private readonly workoutCategoryService: WorkoutCategoryService
  ) {}

  @TsRestHandler(c.getWorkoutCategories)
  async getWorkoutCategories() {
    return tsRestHandler(c.getWorkoutCategories, async () => {
      try {
        const workoutCategories =
          await this.workoutCategoryService.getWorkoutCategories();
        return {
          status: 200,
          body: workoutCategories,
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

  @TsRestHandler(c.getWorkoutCategory)
  async getWorkoutCategory() {
    return tsRestHandler(c.getWorkoutCategory, async ({ params }) => {
      try {
        const workoutCategory =
          await this.workoutCategoryService.getWorkoutCategory(params.id);
        return {
          status: 200,
          body: workoutCategory,
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

  @TsRestHandler(c.createWorkoutCategory)
  async createWorkoutCategory() {
    return tsRestHandler(c.createWorkoutCategory, async ({ body }) => {
      try {
        const workoutCategory =
          await this.workoutCategoryService.createWorkoutCategory(body);
        return {
          status: 201,
          body: workoutCategory,
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

  @TsRestHandler(c.updateWorkoutCategory)
  async updateWorkoutCategory() {
    return tsRestHandler(c.updateWorkoutCategory, async ({ params, body }) => {
      try {
        const workoutCategory =
          await this.workoutCategoryService.updateWorkoutCategory(
            params.id,
            body
          );
        return {
          status: 200,
          body: workoutCategory,
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

  @TsRestHandler(c.deleteWorkoutCategory)
  async deleteWorkoutCategory() {
    return tsRestHandler(c.deleteWorkoutCategory, async ({ params }) => {
      try {
        await this.workoutCategoryService.deleteWorkoutCategory(params.id);

        return {
          status: 200,
          body: {
            message: 'Workout category deleted successfully',
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
