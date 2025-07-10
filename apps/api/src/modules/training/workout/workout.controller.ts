import { workoutContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  Get,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { AuthenticatedUser, Public } from '../../identity/auth/auth.decorator';
import { WorkoutService } from './workout.service';
import { PermissionsGuard } from '../../identity/permissions/permissions.guard';
import { RequirePermissions } from '../../identity/permissions/permissions.decorator';
import { CurrentOrganization } from '../../identity/organization/organization.decorator';
import { CurrentUser } from '../../identity/auth/auth.decorator';

const c = workoutContract;

@Controller()
@UseGuards(PermissionsGuard)
export class WorkoutController {
  constructor(private readonly workoutService: WorkoutService) {}

  @TsRestHandler(c.getWorkouts)
  @RequirePermissions('read')
  getWorkouts(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getWorkouts>> {
    return tsRestHandler(c.getWorkouts, async () => {
      try {
        const workouts = await this.workoutService.getWorkouts(organizationId);

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
  @RequirePermissions('read')
  getWorkout(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getWorkout>> {
    return tsRestHandler(c.getWorkout, async ({ params }) => {
      try {
        const workout = await this.workoutService.getWorkoutWithDetails(params.id, organizationId);

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
  @RequirePermissions('create')
  createWorkout(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.createWorkout>> {
    return tsRestHandler(c.createWorkout, async ({ body }) => {
      try {
        const workout = await this.workoutService.createWorkout(body, organizationId, user.id);
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
  @RequirePermissions('update')
  updateWorkout(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.updateWorkout>> {
    return tsRestHandler(c.updateWorkout, async ({ params, body }) => {
      try {
        const workout = await this.workoutService.updateWorkout(
          params.id,
          body,
          organizationId
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
  @RequirePermissions('delete')
  deleteWorkout(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.deleteWorkout>> {
    return tsRestHandler(c.deleteWorkout, async ({ params }) => {
      try {
        await this.workoutService.deleteWorkout(params.id, organizationId);

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
}
