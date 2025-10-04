import { workoutCategoryContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { WorkoutCategoryUseCase } from '../../application/use-cases/workout-category.use-cases';
import { PermissionsGuard } from '../../../identity/infrastructure/guards/permissions.guard';
import { RequirePermissions } from '../../../identity/infrastructure/decorators/permissions.decorator';
import { CurrentOrganization } from '../../../identity/infrastructure/decorators/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/infrastructure/decorators/auth.decorator';
import { WorkoutCategoryMapper } from '../mappers/workout-category.mapper';
import { WorkoutCategoryPresenter } from '../presenters/workout-category.presenter';

const c = workoutCategoryContract;

/**
 * Workout Category Controller
 * 
 * @description
 * Handles all workout category related operations including CRUD operations.
 * 
 * @remarks
 * This controller uses Ts REST for type-safe API contracts and integrates
 * with the permissions system via @UseGuards(PermissionsGuard).
 * All endpoints require appropriate permissions (read, create, update, delete)
 * and are scoped to the current organization.
 * 
 * @see {@link WorkoutCategoryUseCase} for business logic implementation
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class WorkoutCategoryController {
  constructor(
    private readonly workoutCategoryUseCase: WorkoutCategoryUseCase
  ) {}

  /**
   * Retrieves all workout categories.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns A list of all workout categories accessible to the user.
   */
  @TsRestHandler(c.getWorkoutCategories)
  @RequirePermissions('read')
  getWorkoutCategories(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getWorkoutCategories>> {
    return tsRestHandler(c.getWorkoutCategories, async () => {
      try {
        const workoutCategories = await this.workoutCategoryUseCase.getAll(user.id, organizationId);
        const workoutCategoriesDto = WorkoutCategoryMapper.toDtoList(workoutCategories);
        return WorkoutCategoryPresenter.present(workoutCategoriesDto);
      } catch (error) {
        return WorkoutCategoryPresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Retrieves a specific workout category by ID.
   *
   * @param params - Contains the workout category ID
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The workout category with the specified ID.
   */
  @TsRestHandler(c.getWorkoutCategory)
  @RequirePermissions('read')
  getWorkoutCategory(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getWorkoutCategory>> {
    return tsRestHandler(c.getWorkoutCategory, async ({ params }) => {
      try {
        const workoutCategory = await this.workoutCategoryUseCase.getOne(params.id, user.id, organizationId);
        const workoutCategoryDto = WorkoutCategoryMapper.toDto(workoutCategory);
        return WorkoutCategoryPresenter.presentOne(workoutCategoryDto);
      } catch (error) {
        return WorkoutCategoryPresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Creates a new workout category.
   *
   * @param body - The workout category data to create
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The newly created workout category.
   */
  @TsRestHandler(c.createWorkoutCategory)
  @RequirePermissions('create')
  createWorkoutCategory(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.createWorkoutCategory>> {
    return tsRestHandler(c.createWorkoutCategory, async ({ body }) => {
      try {
        const workoutCategory = await this.workoutCategoryUseCase.create(body, organizationId, user.id);
        const workoutCategoryDto = WorkoutCategoryMapper.toDto(workoutCategory);
        return WorkoutCategoryPresenter.presentOne(workoutCategoryDto);
      } catch (error) {
        return WorkoutCategoryPresenter.presentCreationError(error as Error);
      }
    });
  }

  /**
   * Updates an existing workout category.
   *
   * @param params - Contains the workout category ID
   * @param body - The workout category data to update
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The updated workout category.
   */
  @TsRestHandler(c.updateWorkoutCategory)
  @RequirePermissions('update')
  updateWorkoutCategory(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.updateWorkoutCategory>> {
    return tsRestHandler(c.updateWorkoutCategory, async ({ params, body }) => {
      try {
        const workoutCategory = await this.workoutCategoryUseCase.update(params.id, body, organizationId, user.id);
        const workoutCategoryDto = WorkoutCategoryMapper.toDto(workoutCategory);
        return WorkoutCategoryPresenter.presentOne(workoutCategoryDto);
      } catch (error) {
        return WorkoutCategoryPresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Deletes a workout category.
   *
   * @param params - Contains the workout category ID
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns A success message indicating the workout category was deleted.
   */
  @TsRestHandler(c.deleteWorkoutCategory)
  @RequirePermissions('delete')
  deleteWorkoutCategory(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.deleteWorkoutCategory>> {
    return tsRestHandler(c.deleteWorkoutCategory, async ({ params }) => {
      try {
        await this.workoutCategoryUseCase.delete(params.id, organizationId, user.id);
        return WorkoutCategoryPresenter.presentSuccess('Workout category deleted successfully');
      } catch (error) {
        return WorkoutCategoryPresenter.presentError(error as Error);
      }
    });
  }
}
