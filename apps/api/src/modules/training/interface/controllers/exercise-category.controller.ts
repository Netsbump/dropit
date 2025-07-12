import { exerciseCategoryContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ExerciseCategoryUseCase } from '../../application/use-cases/exercise-category.use-cases';
import { PermissionsGuard } from '../../../identity/permissions/permissions.guard';
import { RequirePermissions } from '../../../identity/permissions/permissions.decorator';
import { CurrentOrganization } from '../../../identity/organization/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/auth/auth.decorator';

const c = exerciseCategoryContract;

/**
 * Exercise Category Controller
 * 
 * @description
 * Handles all exercise category related operations including CRUD operations.
 * 
 * @remarks
 * This controller uses Ts REST for type-safe API contracts and integrates
 * with the permissions system via @UseGuards(PermissionsGuard).
 * All endpoints require appropriate permissions (read, create, update, delete)
 * and are scoped to the current organization.
 * 
 * @see {@link ExerciseCategoryUseCase} for business logic implementation
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class ExerciseCategoryController {
  constructor(
    private readonly exerciseCategoryUseCase: ExerciseCategoryUseCase
  ) {}

  /**
   * Retrieves all exercise categories.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns A list of all exercise categories.
   */
  @TsRestHandler(c.getExerciseCategories)
  @RequirePermissions('read')
  getExerciseCategories(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getExerciseCategories>> {
    return tsRestHandler(c.getExerciseCategories, async () => {
      return await this.exerciseCategoryUseCase.getAll(organizationId, user.id);
    });
  }

  /**
   * Retrieves a specific exercise category by ID.
   *
   * @param params - Contains the exercise category ID
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The exercise category with the specified ID.
   */
  @TsRestHandler(c.getExerciseCategory)
  @RequirePermissions('read')
  getExerciseCategory(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getExerciseCategory>> {
    return tsRestHandler(c.getExerciseCategory, async ({ params }) => {
      return await this.exerciseCategoryUseCase.getOne(params.id, organizationId, user.id);
    });
  }

  /**
   * Creates a new exercise category.
   *
   * @param body - The exercise category data to create
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The newly created exercise category.
   */
  @TsRestHandler(c.createExerciseCategory)
  @RequirePermissions('create')
  createExerciseCategory(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.createExerciseCategory>> {
    return tsRestHandler(c.createExerciseCategory, async ({ body }) => {
      return await this.exerciseCategoryUseCase.create(body, organizationId, user.id);
    });
  }

  /**
   * Updates an existing exercise category.
   *
   * @param params - Contains the exercise category ID
   * @param body - The exercise category data to update
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The updated exercise category.
   */
  @TsRestHandler(c.updateExerciseCategory)
  @RequirePermissions('update')
  updateExerciseCategory(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.updateExerciseCategory>> {
    return tsRestHandler(c.updateExerciseCategory, async ({ params, body }) => {
      return await this.exerciseCategoryUseCase.update(params.id, body, organizationId, user.id);
    });
  }

  /**
   * Deletes an exercise category.
   *
   * @param params - Contains the exercise category ID
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns A success message indicating the exercise category was deleted.
   */
  @TsRestHandler(c.deleteExerciseCategory)
  @RequirePermissions('delete')
  deleteExerciseCategory(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.deleteExerciseCategory>> {
    return tsRestHandler(c.deleteExerciseCategory, async ({ params }) => {
      return await this.exerciseCategoryUseCase.delete(params.id, organizationId, user.id);
    });
  }
}