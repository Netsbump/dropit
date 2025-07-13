import { athleteContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { PermissionsGuard } from '../../../identity/infrastructure/guards/permissions.guard';
import { NoOrganization, RequirePermissions } from '../../../identity/infrastructure/decorators/permissions.decorator';
import { CurrentOrganization } from '../../../identity/infrastructure/decorators/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/infrastructure/decorators/auth.decorator';
import { AthleteUseCases } from '../../application/use-cases/athlete-use-cases';

const c = athleteContract;

/**
 * Athlete Controller
 * 
 * @description
 * Handles all athlete related operations including CRUD operations
 * for managing athletes, their profiles, and associated data.
 * 
 * @remarks
 * This controller uses Ts REST for type-safe API contracts and integrates
 * with the permissions system via @UseGuards(PermissionsGuard).
 * All endpoints require appropriate permissions (read, create, update, delete)
 * and are scoped to the current organization, except for create and update
 * operations which use @NoOrganization() decorator.
 * 
 * @see {@link AthleteUseCases} for business logic implementation
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class AthleteController {
  constructor(
    private readonly athleteUseCases: AthleteUseCases
  ) {}

  /**
   * Retrieves all athletes in the current organization.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns A list of all athletes in the organization with their details.
   */
  @TsRestHandler(c.getAthletes)
  @RequirePermissions('read')
  getAthletes(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getAthletes>> {
    return tsRestHandler(c.getAthletes, async () => {
      return await this.athleteUseCases.findAllWithDetails(user.id, organizationId);
    });
  }

  /**
   * Retrieves a specific athlete by ID.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns The athlete details for the specified ID.
   * @remarks
   * The athlete must belong to the current organization.
   */
  @TsRestHandler(c.getAthlete)
  @RequirePermissions('read')
  getAthlete(
    @CurrentOrganization() organizationId: string,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getAthlete>> {
    return tsRestHandler(c.getAthlete, async ({ params }) => {
      return await this.athleteUseCases.findOneWithDetails(params.id, user.id, organizationId);
    });
  }

  /**
   * Creates a new athlete.
   *
   * @param user - The current authenticated user (injected via the `@CurrentUser` decorator)
   * @returns The newly created athlete.
   * @remarks
   * This endpoint uses @NoOrganization() decorator as athletes can be created
   * outside of organization context. The user ID is used to associate the athlete
   * with the creating user.
   */
  @TsRestHandler(c.createAthlete)
  @RequirePermissions('create')
  @NoOrganization()
  createAthlete(    
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.createAthlete>> {
    return tsRestHandler(c.createAthlete, async ({ body }) => {
      return await this.athleteUseCases.create(body, user.id);
    });
  }

  /**
   * Updates an existing athlete.
   *
   * @param user - The current authenticated user (injected via the `@CurrentUser` decorator)
   * @returns The updated athlete.
   * @remarks
   * This endpoint uses @NoOrganization() decorator as athletes can be updated
   * outside of organization context. Only the athlete owner or authorized users
   * can update athlete information.
   */
  @TsRestHandler(c.updateAthlete)
  @RequirePermissions('update')
  @NoOrganization()
  updateAthlete(@CurrentUser() user: AuthenticatedUser): ReturnType<typeof tsRestHandler<typeof c.updateAthlete>> {
    return tsRestHandler(c.updateAthlete, async ({ params, body }) => {
      return await this.athleteUseCases.update(params.id, body, user.id);
    });
  }

  /**
   * Deletes an athlete.
   *
   * @param user - The current authenticated user (injected via the `@CurrentUser` decorator)
   * @returns Success status of the deletion operation.
   * @remarks
   * Only the athlete owner or authorized users with delete permissions
   * can delete athlete records.
   */
  @TsRestHandler(c.deleteAthlete)
  @RequirePermissions('delete')
  deleteAthlete(@CurrentUser() user: AuthenticatedUser): ReturnType<typeof tsRestHandler<typeof c.deleteAthlete>> {
    return tsRestHandler(c.deleteAthlete, async ({ params }) => {
      return await this.athleteUseCases.delete(params.id, user.id);
    });
  }
}
