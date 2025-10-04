import { exerciseCategoryContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { IExerciseCategoryUseCases, EXERCISE_CATEGORY_USE_CASES } from '../../application/ports/exercise-category-use-cases.port';
import { PermissionsGuard } from '../../../identity/infrastructure/guards/permissions.guard';
import { RequirePermissions } from '../../../identity/infrastructure/decorators/permissions.decorator';
import { CurrentOrganization } from '../../../identity/infrastructure/decorators/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/infrastructure/decorators/auth.decorator';
import { ExerciseCategoryMapper } from '../mappers/exercise-category.mapper';
import { ExerciseCategoryPresenter } from '../presenters/exercise-category.presenter';

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
    @Inject(EXERCISE_CATEGORY_USE_CASES)
    private readonly exerciseCategoryUseCase: IExerciseCategoryUseCases
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
      try {
        const exerciseCategories = await this.exerciseCategoryUseCase.getAll(organizationId, user.id);
        const exerciseCategoriesDto = ExerciseCategoryMapper.toDtoList(exerciseCategories);
        return ExerciseCategoryPresenter.present(exerciseCategoriesDto);
      } catch (error) {
        return ExerciseCategoryPresenter.presentError(error as Error);
      }
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
      try {
        const exerciseCategory = await this.exerciseCategoryUseCase.getOne(params.id, organizationId, user.id);
        const exerciseCategoryDto = ExerciseCategoryMapper.toDto(exerciseCategory);
        return ExerciseCategoryPresenter.presentOne(exerciseCategoryDto);
      } catch (error) {
        return ExerciseCategoryPresenter.presentError(error as Error);
      }
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
      try {
        const exerciseCategory = await this.exerciseCategoryUseCase.create(body, organizationId, user.id);
        const exerciseCategoryDto = ExerciseCategoryMapper.toDto(exerciseCategory);
        return ExerciseCategoryPresenter.presentOne(exerciseCategoryDto);
      } catch (error) {
        return ExerciseCategoryPresenter.presentCreationError(error as Error);
      }
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
      try {
        const exerciseCategory = await this.exerciseCategoryUseCase.update(params.id, body, organizationId, user.id);
        const exerciseCategoryDto = ExerciseCategoryMapper.toDto(exerciseCategory);
        return ExerciseCategoryPresenter.presentOne(exerciseCategoryDto);
      } catch (error) {
        return ExerciseCategoryPresenter.presentError(error as Error);
      }
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
      try {
        await this.exerciseCategoryUseCase.delete(params.id, organizationId, user.id);
        return ExerciseCategoryPresenter.presentSuccess('Exercise category deleted successfully');
      } catch (error) {
        return ExerciseCategoryPresenter.presentError(error as Error);
      }
    });
  }
}