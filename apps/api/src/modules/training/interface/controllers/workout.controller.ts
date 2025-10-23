import { workoutContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { IWorkoutUseCases, WORKOUT_USE_CASES } from '../../application/ports/workout-use-cases.port';
import { PermissionsGuard } from '../../../identity/infrastructure/guards/permissions.guard';
import { RequirePermissions } from '../../../identity/infrastructure/decorators/permissions.decorator';
import { CurrentOrganization } from '../../../identity/infrastructure/decorators/organization.decorator';
import { CurrentUser } from '../../../identity/infrastructure/decorators/auth.decorator';
import { AuthenticatedUser } from '../../../identity/infrastructure/decorators/auth.decorator';
import { WorkoutMapper } from '../mappers/workout.mapper';
import { WorkoutPresenter } from '../presenters/workout.presenter';

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
    @Inject(WORKOUT_USE_CASES)
    private readonly workoutUseCases: IWorkoutUseCases
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
      try {
        const workouts = await this.workoutUseCases.getWorkouts(organizationId, user.id);
        const workoutsDto = WorkoutMapper.toDtoList(workouts);
        return WorkoutPresenter.presentList(workoutsDto);
      } catch (error) {
        return WorkoutPresenter.presentError(error as Error);
      }
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
      try {
        const workout = await this.workoutUseCases.getWorkoutWithDetails(params.id, organizationId, user.id);
        const workoutDto = WorkoutMapper.toDto(workout);
        return WorkoutPresenter.presentOne(workoutDto);
      } catch (error) {
        return WorkoutPresenter.presentError(error as Error);
      }
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
      try {
        const workout = await this.workoutUseCases.createWorkout(body, organizationId, user.id);
        const workoutDto = WorkoutMapper.toDto(workout);
        return WorkoutPresenter.presentOne(workoutDto);
      } catch (error) {
        return WorkoutPresenter.presentError(error as Error);
      }
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
      try {
        const workout = await this.workoutUseCases.updateWorkout(params.id, body, organizationId, user.id);
        const workoutDto = WorkoutMapper.toDto(workout);
        return WorkoutPresenter.presentOne(workoutDto);
      } catch (error) {
        return WorkoutPresenter.presentError(error as Error);
      }
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
      try {
        await this.workoutUseCases.deleteWorkout(params.id, organizationId, user.id);
        return WorkoutPresenter.presentSuccess('Workout deleted successfully');
      } catch (error) {
        return WorkoutPresenter.presentError(error as Error);
      }
    });
  }
}
