import { athleteContract } from '@dropit/contract';
import { Controller, Inject, UseFilters, UseGuards } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { PermissionsGuard } from '../../auth/infrastructure/guards/permissions.guard';
import {
  NoOrganization,
  RequirePermissions,
} from '../../auth/infrastructure/decorators/permissions.decorator';
import { CurrentOrganization } from '../../auth/infrastructure/decorators/organization.decorator';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../auth/infrastructure/decorators/auth.decorator';
import {
  IAthleteProfiles,
  ATHLETE_PROFILES,
} from '../application/ports/in/athlete-profiles.port';
import {
  IInvitationUseCases,
  INVITATION_USE_CASES,
} from '../../invitations/application/ports/invitation-use-cases.port';
import { AthleteExceptionFilter } from './athlete-exception.filter';
import {
  toAthleteCreation,
  toAthleteDetailsDto,
  toAthleteDetailsDtoList,
  toAthleteDto,
  toAthleteUpdate,
} from './mappers/athlete.mapper';
import { parseAthleteId } from '../domain/athlete-id';
import {
  parseOrganizationId,
  type OrganizationId,
} from '../../../shared/kernel/identity';

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
 * @see {@link IAthleteProfiles} for business logic contract
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseFilters(AthleteExceptionFilter)
@UseGuards(PermissionsGuard)
@Controller()
export class AthleteController {
  constructor(
    @Inject(ATHLETE_PROFILES)
    private readonly athleteProfiles: IAthleteProfiles,
    @Inject(INVITATION_USE_CASES)
    private readonly invitationUseCases: IInvitationUseCases
  ) {}

  @TsRestHandler(c.inviteAthlete)
  @RequirePermissions('create')
  inviteAthlete(
    @CurrentOrganization() organizationId: OrganizationId,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.inviteAthlete>> {
    return tsRestHandler(c.inviteAthlete, async ({ body, headers }) => {
      await this.invitationUseCases.inviteAthlete(
        {
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          organizationId,
          headers,
        },
        {
          userId: user.id,
          isSuperAdmin: user.role === 'admin',
          organizationId,
        }
      );

      return { status: 201 as const, body: { message: 'Invitation sent' } };
    });
  }

  /**
   * Retrieves all athletes in the current organization.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns A list of all athletes in the organization with their details.
   */
  @TsRestHandler(c.getAthletes)
  @RequirePermissions('read')
  getAthletes(
    @CurrentOrganization() organizationId: OrganizationId,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getAthletes>> {
    return tsRestHandler(c.getAthletes, async () => {
      const athletes = await this.athleteProfiles.listAccessibleDetails(
        user.id,
        organizationId
      );

      const athletesDto = toAthleteDetailsDtoList(athletes);

      return {
        status: 200 as const,
        body: athletesDto,
      };
    });
  }

  @TsRestHandler(c.getAthletesByOrganization)
  @RequirePermissions('read')
  @NoOrganization()
  getAthletesByOrganization(
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getAthletesByOrganization>> {
    return tsRestHandler(c.getAthletesByOrganization, async ({ params }) => {
      if (user.role !== 'admin') {
        return { status: 403, body: { message: 'Forbidden' } };
      }

      const organizationId = parseOrganizationId(params.organizationId);

      const athletes = await this.athleteProfiles.listDetailsByOrganization(
        organizationId
      );

      const athletesDto = toAthleteDetailsDtoList(athletes).map((athlete) => ({
        id: athlete.id,
        firstName: athlete.firstName,
        lastName: athlete.lastName,
        email: athlete.email,
        birthday: athlete.birthday,
      }));

      return {
        status: 200 as const,
        body: athletesDto,
      };
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
    @CurrentOrganization() organizationId: OrganizationId,
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.getAthlete>> {
    return tsRestHandler(c.getAthlete, async ({ params }) => {
      const athleteId = parseAthleteId(params.id);

      const athlete = await this.athleteProfiles.findDetailsById(
        athleteId,
        user.id,
        organizationId
      );

      const athleteDto = toAthleteDetailsDto(athlete);

      return {
        status: 200 as const,
        body: athleteDto,
      };
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
      const athleteCreation = toAthleteCreation(body, user.id);

      const athlete = await this.athleteProfiles.create(athleteCreation);

      const athleteDto = toAthleteDto(athlete);

      return {
        status: 201 as const,
        body: athleteDto,
      };
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
  updateAthlete(
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.updateAthlete>> {
    return tsRestHandler(c.updateAthlete, async ({ params, body }) => {
      const athleteId = parseAthleteId(params.id);
      const athleteUpdate = toAthleteUpdate(body);

      const athlete = await this.athleteProfiles.updateOwn(
        athleteId,
        athleteUpdate,
        user.id
      );

      const athleteDto = toAthleteDto(athlete);

      return {
        status: 200 as const,
        body: athleteDto,
      };
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
  deleteAthlete(
    @CurrentUser() user: AuthenticatedUser
  ): ReturnType<typeof tsRestHandler<typeof c.deleteAthlete>> {
    return tsRestHandler(c.deleteAthlete, async ({ params }) => {
      const athleteId = parseAthleteId(params.id);

      await this.athleteProfiles.deleteOwn(athleteId, user.id);

      return {
        status: 200 as const,
        body: { message: 'Athlete deleted successfully' },
      };
    });
  }
}
