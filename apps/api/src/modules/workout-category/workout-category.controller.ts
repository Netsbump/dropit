import { workoutCategoryContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { NestRequestShapes, TsRest, TsRestRequest } from '@ts-rest/nest';
import { NestControllerInterface } from '@ts-rest/nest';
import { nestControllerContract } from '@ts-rest/nest';
import { WorkoutCategoryService } from './workout-category.service';

const c = nestControllerContract(workoutCategoryContract);
type RequestShapes = NestRequestShapes<typeof c>;

@Controller()
export class WorkoutCategoryController
  implements NestControllerInterface<typeof c>
{
  constructor(
    private readonly workoutCategoryService: WorkoutCategoryService
  ) {}

  @TsRest(c.getWorkoutCategories)
  async getWorkoutCategories(
    @TsRestRequest() request: RequestShapes['getWorkoutCategories']
  ) {
    try {
      const workoutCategories =
        await this.workoutCategoryService.getWorkoutCategories();
      return {
        status: 200 as const,
        body: workoutCategories,
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

  @TsRest(c.getWorkoutCategory)
  async getWorkoutCategory(
    @TsRestRequest()
    { params }: RequestShapes['getWorkoutCategory']
  ) {
    try {
      const workoutCategory =
        await this.workoutCategoryService.getWorkoutCategory(params.id);
      return {
        status: 200 as const,
        body: workoutCategory,
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

  @TsRest(c.createWorkoutCategory)
  async createWorkoutCategory(
    @TsRestRequest() { body }: RequestShapes['createWorkoutCategory']
  ) {
    try {
      const workoutCategory =
        await this.workoutCategoryService.createWorkoutCategory(body);
      return {
        status: 201 as const,
        body: workoutCategory,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          status: 400 as const,
          body: {
            message: error.message,
          },
        };
      }
      throw error;
    }
  }

  @TsRest(c.updateWorkoutCategory)
  async updateWorkoutCategory(
    @TsRestRequest() { params, body }: RequestShapes['updateWorkoutCategory']
  ) {
    try {
      const workoutCategory =
        await this.workoutCategoryService.updateWorkoutCategory(
          params.id,
          body
        );
      return {
        status: 200 as const,
        body: workoutCategory,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        return {
          status: 400 as const,
          body: {
            message: error.message,
          },
        };
      }
      throw error;
    }
  }

  @TsRest(c.deleteWorkoutCategory)
  async deleteWorkoutCategory(
    @TsRestRequest() { params }: RequestShapes['deleteWorkoutCategory']
  ) {
    try {
      await this.workoutCategoryService.deleteWorkoutCategory(params.id);

      return {
        status: 200 as const,
        body: {
          message: 'Workout category deleted successfully',
        },
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
}
