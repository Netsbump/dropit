import { workoutContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { WorkoutUseCases } from '../../application/use-cases/workout.use-cases';
import { PermissionsGuard } from '../../../identity/permissions/permissions.guard';
import { RequirePermissions } from '../../../identity/permissions/permissions.decorator';
import { CurrentOrganization } from '../../../identity/organization/organization.decorator';
import { CurrentUser } from '../../../identity/auth/auth.decorator';
import { AuthenticatedUser } from '../../../identity/auth/auth.decorator';

const c = workoutContract;

/**
 * Workout Controller
 * 
 * @description
 * Handles all workout related operations including CRUD operations.
 * 
 * @remarks
 * This controller uses Ts REST for type-safe API contracts and integrates
 * with the permissions system via @UseGuards(PermissionsGuard).
 * All endpoints require appropriate permissions (read, create, update, delete)
 * and are scoped to the current organization.
 * 
 * @see {@link WorkoutUseCases} for business logic implementation
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class WorkoutController {
  constructor(
    private readonly workoutUseCases: WorkoutUseCases
  ) {}

  /**
   * Retrieves all workouts.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param user - The current user (injected via the `@CurrentUser` decorator)
   * @returns A list of all workouts.
   */
  @TsRestHandler(c.getWorkouts)
  @RequirePermissions('read')
  getWorkouts(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getWorkouts>> {
    return tsRestHandler(c.getWorkouts, async () => {
      return await this.workoutUseCases.getWorkouts(organizationId, user.id);
    });
  }

  /**
   * Retrieves a specific workout by ID.
   *
   * @param params - Contains the workout ID
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param user - The current user (injected via the `@CurrentUser` decorator)
   * @returns The workout with the specified ID.
   */
  @TsRestHandler(c.getWorkout)
  @RequirePermissions('read')
  getWorkout(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getWorkout>> {
    return tsRestHandler(c.getWorkout, async ({ params }) => {
      return await this.workoutUseCases.getWorkoutWithDetails(params.id, organizationId, user.id);
    });
  }

  /**
   * Creates a new workout.
   *
   * @param body - The workout data to create
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param user - The current user (injected via the `@CurrentUser` decorator)
   * @returns The newly created workout.
   */
  @TsRestHandler(c.createWorkout)
  @RequirePermissions('create')
  createWorkout(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.createWorkout>> {
    return tsRestHandler(c.createWorkout, async ({ body }) => {
      return await this.workoutUseCases.createWorkout(body, organizationId, user.id);
    });
  }

  /**
   * Updates an existing workout.
   *
   * @param params - Contains the workout ID
   * @param body - The workout data to update
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param user - The current user (injected via the `@CurrentUser` decorator)
   * @returns The updated workout.
   */
  @TsRestHandler(c.updateWorkout)
  @RequirePermissions('update')
  updateWorkout(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.updateWorkout>> {
    return tsRestHandler(c.updateWorkout, async ({ params, body }) => {
      return await this.workoutUseCases.updateWorkout(params.id, body, organizationId, user.id);
    });
  }

  /**
   * Deletes a workout.
   *
   * @param params - Contains the workout ID
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param user - The current user (injected via the `@CurrentUser` decorator)
   * @returns A success message indicating the workout was deleted. 
   */
  @TsRestHandler(c.deleteWorkout)
  @RequirePermissions('delete')
  deleteWorkout(
      @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.deleteWorkout>> {
    return tsRestHandler(c.deleteWorkout, async ({ params }) => {
      return await this.workoutUseCases.deleteWorkout(params.id, organizationId, user.id);
    });
  }
}
