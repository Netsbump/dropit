import { workoutContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { Public, Session } from '../../members/auth/auth.decorator';
import { RequireWorkoutPermission } from '../../core/better-auth-permission.decorator';
import { WorkoutService } from './workout.service';

const c = workoutContract;

@Controller()
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @TsRestHandler(c.getWorkouts)
  @RequireWorkoutPermission('read')
  getWorkouts(): ReturnType<typeof tsRestHandler<typeof c.getWorkouts>> {
    return tsRestHandler(c.getWorkouts, async () => {
      try {
        const workouts = await this.workoutService.getWorkouts();

        return {
          status: 200,
          body: workouts,
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

  @TsRestHandler(c.getWorkout)
  @RequireWorkoutPermission('read')
  getWorkout(): ReturnType<typeof tsRestHandler<typeof c.getWorkout>> {
    return tsRestHandler(c.getWorkout, async ({ params }) => {
      try {
        const workout = await this.workoutService.getWorkout(params.id);

        return {
          status: 200,
          body: workout,
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

  @TsRestHandler(c.createWorkout)
  @RequireWorkoutPermission('create')
  createWorkout(): ReturnType<typeof tsRestHandler<typeof c.createWorkout>> {
    return tsRestHandler(c.createWorkout, async ({ body }) => {
      try {
        const workout = await this.workoutService.createWorkout(body);
        return {
          status: 201,
          body: workout,
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

  @TsRestHandler(c.updateWorkout)
  @RequireWorkoutPermission('update')
  updateWorkout(): ReturnType<typeof tsRestHandler<typeof c.updateWorkout>> {
    return tsRestHandler(c.updateWorkout, async ({ params, body }) => {
      try {
        const workout = await this.workoutService.updateWorkout(
          params.id,
          body
        );

        return {
          status: 200,
          body: workout,
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

  @TsRestHandler(c.deleteWorkout)
  @RequireWorkoutPermission('delete')
  deleteWorkout(): ReturnType<typeof tsRestHandler<typeof c.deleteWorkout>> {
    return tsRestHandler(c.deleteWorkout, async ({ params }) => {
      try {
        await this.workoutService.deleteWorkout(params.id);

        return {
          status: 200,
          body: {
            message: 'Workout deleted successfully',
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

  @Get('public')
  @Public()
  getPublicWorkouts() {
    return {
      message: 'Public workouts endpoint',
      workouts: []
    };
  }

  @Get('authenticated-only')
  getAuthenticatedWorkouts(@Session() session: any) {
    return {
      message: 'Authenticated workouts endpoint',
      userId: session.user.id,
      workouts: []
    };
  }

  @Get('admin-only')
  @RequireWorkoutPermission('create')
  @RequireWorkoutPermission('update')
  getAdminWorkouts(@Session() session: any) {
    return {
      message: 'Admin workouts endpoint',
      userId: session.user.id,
      workouts: []
    };
  }
}
