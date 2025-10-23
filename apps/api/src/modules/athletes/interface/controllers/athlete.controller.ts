import { athleteContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { PermissionsGuard } from '../../../identity/infrastructure/guards/permissions.guard';
import { NoOrganization, RequirePermissions } from '../../../identity/infrastructure/decorators/permissions.decorator';
import { CurrentOrganization } from '../../../identity/infrastructure/decorators/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/infrastructure/decorators/auth.decorator';
import { IAthleteUseCases, ATHLETE_USE_CASES } from '../../application/ports/athlete-use-cases.port';
import { AthleteMapper } from '../mappers/athlete.mapper';
import { AthletePresenter } from '../presenter/athlete.presenter';

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
 * @see {@link IAthleteUseCases} for business logic contract
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class AthleteController {
  constructor(
    @Inject(ATHLETE_USE_CASES)
    private readonly athleteUseCases: IAthleteUseCases
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
      try {
        const athletes = await this.athleteUseCases.findAllWithDetails(user.id, organizationId);
        const athletesDto = AthleteMapper.toDtoListDetails(athletes);
        return AthletePresenter.presentListDetails(athletesDto);
      } catch (error) {
        return AthletePresenter.presentError(error as Error);
      }
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
      try {
        const athlete = await this.athleteUseCases.findOneWithDetails(params.id, user.id, organizationId);
        const athleteDto = AthleteMapper.toDtoDetails(athlete);
        return AthletePresenter.presentOneDetails(athleteDto);
      } catch (error) {
        return AthletePresenter.presentError(error as Error);
      }
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
      try {
        const athlete = await this.athleteUseCases.create(body, user.id);
        const athleteDto = AthleteMapper.toDto(athlete);
        return AthletePresenter.presentOne(athleteDto);
      } catch (error) {
        return AthletePresenter.presentCreationError(error as Error);
      }
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
      try {
        const athlete = await this.athleteUseCases.update(params.id, body, user.id);
        const athleteDto = AthleteMapper.toDto(athlete);
        return AthletePresenter.presentOne(athleteDto);
      } catch (error) {
        return AthletePresenter.presentError(error as Error);
      }
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
      try {
        await this.athleteUseCases.delete(params.id, user.id);
        return AthletePresenter.presentSuccess('Athlete deleted successfully');
      } catch (error) {
        return AthletePresenter.presentError(error as Error);
      }
    });
  }
}
