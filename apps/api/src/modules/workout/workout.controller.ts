import { NestRequestShapes, TsRest, TsRestRequest } from '@ts-rest/nest';

import { nestControllerContract } from '@ts-rest/nest';

import { workoutContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
} from '@nestjs/common';
import { NestControllerInterface } from '@ts-rest/nest';
import { WorkoutService } from './workout.service';

const c = nestControllerContract(workoutContract);
type RequestShapes = NestRequestShapes<typeof c>;

@Controller()
export class WorkoutController implements NestControllerInterface<typeof c> {
  constructor(private readonly workoutService: WorkoutService) {}

  @TsRest(c.getWorkouts)
  async getWorkouts(@TsRestRequest() request: RequestShapes['getWorkouts']) {
    try {
      const workouts = await this.workoutService.getWorkouts();

      return {
        status: 200 as const,
        body: workouts,
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

  @TsRest(c.getWorkout)
  async getWorkout(@TsRestRequest() { params }: RequestShapes['getWorkout']) {
    try {
      const workout = await this.workoutService.getWorkout(params.id);

      return {
        status: 200 as const,
        body: workout,
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

  @TsRest(c.createWorkout)
  async createWorkout(
    @TsRestRequest() { body }: RequestShapes['createWorkout']
  ) {
    try {
      const workout = await this.workoutService.createWorkout(body);
      return {
        status: 201 as const,
        body: workout,
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

  @TsRest(c.updateWorkout)
  async updateWorkout(
    @TsRestRequest() { params, body }: RequestShapes['updateWorkout']
  ) {
    try {
      const workout = await this.workoutService.updateWorkout(params.id, body);

      return {
        status: 200 as const,
        body: workout,
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

  @TsRest(c.deleteWorkout)
  async deleteWorkout(
    @TsRestRequest() { params }: RequestShapes['deleteWorkout']
  ) {
    try {
      await this.workoutService.deleteWorkout(params.id);

      return {
        status: 200 as const,
        body: {
          message: 'Workout deleted successfully',
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
