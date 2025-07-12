import { exerciseContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { ExerciseUseCase } from '../../application/use-cases/exercise.use-cases';
import { PermissionsGuard } from '../../../identity/permissions/permissions.guard';
import { RequirePermissions } from '../../../identity/permissions/permissions.decorator';
import { CurrentOrganization } from '../../../identity/organization/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/auth/auth.decorator';

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
 * @see {@link ExerciseUseCase} for business logic implementation
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class ExerciseController {
  constructor(
    private readonly exerciseUseCase: ExerciseUseCase
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
      return await this.exerciseUseCase.getAll(organizationId, user.id);
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
      return await this.exerciseUseCase.getOne(params.id, organizationId, user.id);
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
      return await this.exerciseUseCase.create(body, organizationId, user.id);
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
      return await this.exerciseUseCase.update(params.id, body, organizationId, user.id);
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
      return await this.exerciseUseCase.delete(params.id, organizationId, user.id);
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
      // Contrat : query = { like: z.string() }
      return await this.exerciseUseCase.search(query.like, organizationId, user.id);
    });
  }
}
