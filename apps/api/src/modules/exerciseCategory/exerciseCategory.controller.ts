import { exerciseCategoryContract } from '@dropit/contract';
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
import { ExerciseCategoryService } from './exerciseCategory.service';

const c = nestControllerContract(exerciseCategoryContract);
type RequestShapes = NestRequestShapes<typeof c>;

@Controller()
export class ExerciseCategoryController
  implements NestControllerInterface<typeof c>
{
  constructor(
    private readonly exerciseCategoryService: ExerciseCategoryService
  ) {}

  @TsRest(c.getExerciseCategories)
  async getExerciseCategories(
    @TsRestRequest() request: RequestShapes['getExerciseCategories']
  ) {
    try {
      const exerciseCategories =
        await this.exerciseCategoryService.getExerciseCategories();
      return {
        status: 200 as const,
        body: exerciseCategories,
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

  @TsRest(c.getExerciseCategory)
  async getExerciseCategory(
    @TsRestRequest()
    { params }: RequestShapes['getExerciseCategory']
  ) {
    try {
      const exerciseCategory =
        await this.exerciseCategoryService.getExerciseCategory(params.id);
      return {
        status: 200 as const,
        body: exerciseCategory,
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

  @TsRest(c.createExerciseCategory)
  async createExerciseCategory(
    @TsRestRequest() { body }: RequestShapes['createExerciseCategory']
  ) {
    try {
      const newExerciseCategory =
        await this.exerciseCategoryService.createExerciseCategory(body);
      return {
        status: 201 as const,
        body: newExerciseCategory,
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

  @TsRest(c.updateExerciseCategory)
  async updateExerciseCategory(
    @TsRestRequest() { params, body }: RequestShapes['updateExerciseCategory']
  ) {
    try {
      const updatedExerciseCategory =
        await this.exerciseCategoryService.updateExerciseCategory(
          params.id,
          body
        );
      return {
        status: 200 as const,
        body: updatedExerciseCategory,
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

  @TsRest(c.deleteExerciseCategory)
  async deleteExerciseCategory(
    @TsRestRequest() { params }: RequestShapes['deleteExerciseCategory']
  ) {
    try {
      await this.exerciseCategoryService.deleteExerciseCategory(params.id);

      return {
        status: 200 as const,
        body: {
          message: 'Exercise category deleted successfully',
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
