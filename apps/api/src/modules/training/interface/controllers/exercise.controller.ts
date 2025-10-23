import { exerciseContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { IExerciseUseCases, EXERCISE_USE_CASES } from '../../application/ports/exercise-use-cases.port';
import { PermissionsGuard } from '../../../identity/infrastructure/guards/permissions.guard';
import { RequirePermissions } from '../../../identity/infrastructure/decorators/permissions.decorator';
import { CurrentOrganization } from '../../../identity/infrastructure/decorators/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/infrastructure/decorators/auth.decorator';
import { ExerciseMapper } from '../mappers/exercise.mapper';
import { ExercisePresenter } from '../presenters/exercise.presenter';

const c = exerciseContract;

/**
 * Exercise Controller
 * 
 * @description
 * Handles all exercise related operations including CRUD operations and search.
 * 
 * @remarks
 * This controller uses Ts REST for type-safe API contracts and integrates
 * with the permissions system via @UseGuards(PermissionsGuard).
 * All endpoints require appropriate permissions (read, create, update, delete)
 * and are scoped to the current organization.
 * 
 * @see {@link IExerciseUseCases} for business logic contract
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class ExerciseController {
  constructor(
    @Inject(EXERCISE_USE_CASES)
    private readonly exerciseUseCase: IExerciseUseCases
  ) {}

  /**
   * Retrieves all exercises for the current organization.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns A list of all exercises for the organization.
   */
  @TsRestHandler(c.getExercises)
  @RequirePermissions('read')
  getExercises(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getExercises>> {
    return tsRestHandler(c.getExercises, async () => {
      try {
        const exercises = await this.exerciseUseCase.getAll(organizationId, user.id);
        const exercisesDto = ExerciseMapper.toDtoList(exercises);
        return ExercisePresenter.presentList(exercisesDto);
      } catch (error) {
        return ExercisePresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Retrieves a specific exercise by ID.
   *
   * @param params - Contains the exercise ID
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns The exercise with the specified ID.
   */
  @TsRestHandler(c.getExercise)
  @RequirePermissions('read')
  getExercise(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getExercise>> {
    return tsRestHandler(c.getExercise, async ({ params }) => {
      try {
        const exercise = await this.exerciseUseCase.getOne(params.id, organizationId, user.id);
        const exerciseDto = ExerciseMapper.toDto(exercise);
        return ExercisePresenter.presentOne(exerciseDto);
      } catch (error) {
        return ExercisePresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Creates a new exercise.
   *
   * @param body - The exercise data to create
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The newly created exercise.
   */
  @TsRestHandler(c.createExercise)
  @RequirePermissions('create')
  createExercise(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.createExercise>> {
    return tsRestHandler(c.createExercise, async ({ body }) => {
      try {
        const exercise = await this.exerciseUseCase.create(body, organizationId, user.id);
        const exerciseDto = ExerciseMapper.toDto(exercise);
        return ExercisePresenter.presentCreationSuccess(exerciseDto);
      } catch (error) {
        return ExercisePresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Updates an existing exercise.
   *
   * @param params - Contains the exercise ID
   * @param body - The exercise data to update
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns The updated exercise.
   */
  @TsRestHandler(c.updateExercise)
  @RequirePermissions('update')
  updateExercise(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.updateExercise>> {
    return tsRestHandler(c.updateExercise, async ({ params, body }) => {
      try {
        const exercise = await this.exerciseUseCase.update(params.id, body, organizationId, user.id);
        const exerciseDto = ExerciseMapper.toDto(exercise);
        return ExercisePresenter.presentOne(exerciseDto);
      } catch (error) {
        return ExercisePresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Deletes an exercise.
   *
   * @param params - Contains the exercise ID
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns A success message indicating the exercise was deleted.
   */
  @TsRestHandler(c.deleteExercise)
  @RequirePermissions('delete')
  deleteExercise(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.deleteExercise>> {
    return tsRestHandler(c.deleteExercise, async ({ params }) => {
      try {
        await this.exerciseUseCase.delete(params.id, organizationId, user.id);
        return ExercisePresenter.presentSuccess('Exercise deleted successfully');
      } catch (error) {
        return ExercisePresenter.presentError(error as Error);
      }
    });
  }

  /**
   * Searches for exercises by name.
   *
   * @param query - Contains the search query
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @param userId - The ID of the current user (injected via the `@CurrentUser` decorator)
   * @returns A list of exercises matching the search query.
   */
  @TsRestHandler(c.searchExercises)
  @RequirePermissions('read')
  searchExercises(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.searchExercises>> {
    return tsRestHandler(c.searchExercises, async ({ query }) => {
      try {
        // Contrat : query = { like: z.string() }
        const exercises = await this.exerciseUseCase.search(query.like, organizationId, user.id);
        const exercisesDto = ExerciseMapper.toDtoList(exercises);
        return ExercisePresenter.presentList(exercisesDto);
      } catch (error) {
        return ExercisePresenter.presentError(error as Error);
      }
    });
  }
}
