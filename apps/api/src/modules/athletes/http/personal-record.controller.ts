import { personalRecordContract } from '@dropit/contract';
import { Controller, Inject, UseFilters, UseGuards } from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import type { OrganizationId } from '../../../shared/kernel/identity';
import {
  AuthenticatedUser,
  CurrentUser,
} from '../../auth/infrastructure/decorators/auth.decorator';
import { CurrentOrganization } from '../../auth/infrastructure/decorators/organization.decorator';
import { RequirePermissions } from '../../auth/infrastructure/decorators/permissions.decorator';
import { PermissionsGuard } from '../../auth/infrastructure/guards/permissions.guard';
import {
  ATHLETE_PERSONAL_RECORDS,
  IAthletePersonalRecords,
} from '../application/ports/in/athlete-personal-records.port';
import { parseAthleteId } from '../domain/athlete-id';
import { parsePersonalRecordId } from '../domain/personal-record-id';
import { AthleteExceptionFilter } from './athlete-exception.filter';
import {
  toPersonalRecordDto,
  toPersonalRecordDtoList,
} from './mappers/personal-record.mapper';

const c = personalRecordContract;

/**
 * Personal Record Controller
 *
 * @description
 * Handles all personal record related operations including CRUD operations
 * for managing athlete personal records, achievements, and performance tracking.
 *
 * @remarks
 * This controller uses Ts REST for type-safe API contracts and integrates
 * with the permissions system via @UseGuards(PermissionsGuard).
 * All endpoints require appropriate permissions (read, create, update, delete)
 * and are scoped to the current organization.
 *
 * @see {@link IAthletePersonalRecords} for business logic contract
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseFilters(AthleteExceptionFilter)
@UseGuards(PermissionsGuard)
@Controller()
export class PersonalRecordController {
  constructor(
    @Inject(ATHLETE_PERSONAL_RECORDS)
    private readonly athletePersonalRecords: IAthletePersonalRecords
  ) {}

  /**
   * Retrieves all personal records in the current organization.
   *
   * @param currentUser - The current authenticated user (injected via the `@CurrentUser` decorator)
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns A list of all personal records in the organization.
   * @remarks
   * Coaches can see all personal records in the organization.
   * Athletes can only see their own personal records.
   */
  @TsRestHandler(c.getPersonalRecords)
  @RequirePermissions('read')
  getPersonalRecords(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: OrganizationId
  ): ReturnType<typeof tsRestHandler<typeof c.getPersonalRecords>> {
    return tsRestHandler(c.getPersonalRecords, async () => {
      const personalRecords = await this.athletePersonalRecords.listAccessible(
        currentUser.id,
        organizationId
      );
      const personalRecordsDto = toPersonalRecordDtoList(personalRecords);

      return {
        status: 200 as const,
        body: personalRecordsDto,
      };
    });
  }

  /**
   * Retrieves a specific personal record by ID.
   *
   * @param currentUser - The current authenticated user (injected via the `@CurrentUser` decorator)
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns The personal record for the specified ID.
   * @remarks
   * Access is restricted to coaches or the athlete themselves.
   */
  @TsRestHandler(c.getPersonalRecord)
  @RequirePermissions('read')
  getPersonalRecord(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: OrganizationId
  ): ReturnType<typeof tsRestHandler<typeof c.getPersonalRecord>> {
    return tsRestHandler(c.getPersonalRecord, async ({ params }) => {
      const personalRecordId = parsePersonalRecordId(params.id);
      const personalRecord = await this.athletePersonalRecords.findById(
        personalRecordId,
        currentUser.id,
        organizationId
      );
      const personalRecordDto = toPersonalRecordDto(personalRecord);

      return {
        status: 200 as const,
        body: personalRecordDto,
      };
    });
  }

  /**
   * Retrieves all personal records for a specific athlete.
   *
   * @param currentUser - The current authenticated user (injected via the `@CurrentUser` decorator)
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns A list of personal records for the specified athlete.
   * @remarks
   * Access is restricted to coaches or the athlete themselves.
   */
  @TsRestHandler(c.getAthletePersonalRecords)
  @RequirePermissions('read')
  getAthletePersonalRecords(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: OrganizationId
  ): ReturnType<typeof tsRestHandler<typeof c.getAthletePersonalRecords>> {
    return tsRestHandler(c.getAthletePersonalRecords, async ({ params }) => {
      const athleteId = parseAthleteId(params.id);
      const personalRecords = await this.athletePersonalRecords.listByAthleteId(
        athleteId,
        currentUser.id,
        organizationId
      );
      const personalRecordsDto = toPersonalRecordDtoList(personalRecords);

      return {
        status: 200 as const,
        body: personalRecordsDto,
      };
    });
  }

  /**
   * Retrieves a summary of personal records for a specific athlete.
   *
   * @param currentUser - The current authenticated user (injected via the `@CurrentUser` decorator)
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns A summary of personal records for the specified athlete.
   * @remarks
   * Access is restricted to coaches or the athlete themselves.
   */
  @TsRestHandler(c.getAthletePersonalRecordsSummary)
  @RequirePermissions('read')
  getAthletePersonalRecordsSummary(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: OrganizationId
  ): ReturnType<
    typeof tsRestHandler<typeof c.getAthletePersonalRecordsSummary>
  > {
    return tsRestHandler(
      c.getAthletePersonalRecordsSummary,
      async ({ params }) => {
        const athleteId = parseAthleteId(params.id);
        const summary =
          await this.athletePersonalRecords.findBestOlympicLiftsByAthleteId(
            athleteId,
            currentUser.id,
            organizationId
          );

        return {
          status: 200 as const,
          body: summary,
        };
      }
    );
  }

  /**
   * Creates a new personal record for an athlete.
   *
   * @param currentUser - The current authenticated user (injected via the `@CurrentUser` decorator)
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns The newly created personal record.
   * @remarks
   * Only coaches can create personal records. The athlete must belong to the organization.
   */
  @TsRestHandler(c.createPersonalRecord)
  @RequirePermissions('create')
  createPersonalRecord(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: OrganizationId
  ): ReturnType<typeof tsRestHandler<typeof c.createPersonalRecord>> {
    return tsRestHandler(c.createPersonalRecord, async ({ params, body }) => {
      const athleteId = parseAthleteId(params.id);
      const personalRecord = await this.athletePersonalRecords.record(
        athleteId,
        body,
        currentUser.id,
        organizationId
      );
      const personalRecordDto = toPersonalRecordDto(personalRecord);

      return {
        status: 201 as const,
        body: personalRecordDto,
      };
    });
  }

  /**
   * Updates an existing personal record.
   *
   * @param currentUser - The current authenticated user (injected via the `@CurrentUser` decorator)
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns The updated personal record.
   * @remarks
   * Only coaches can update personal records. The athlete must belong to the organization.
   */
  @TsRestHandler(c.updatePersonalRecord)
  @RequirePermissions('update')
  updatePersonalRecord(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: OrganizationId
  ): ReturnType<typeof tsRestHandler<typeof c.updatePersonalRecord>> {
    return tsRestHandler(c.updatePersonalRecord, async ({ params, body }) => {
      const personalRecordId = parsePersonalRecordId(params.id);
      const personalRecord = await this.athletePersonalRecords.amend(
        personalRecordId,
        body,
        currentUser.id,
        organizationId
      );
      const personalRecordDto = toPersonalRecordDto(personalRecord);

      return {
        status: 200 as const,
        body: personalRecordDto,
      };
    });
  }

  /**
   * Deletes a personal record.
   *
   * @param currentUser - The current authenticated user (injected via the `@CurrentUser` decorator)
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns Success response with no content.
   * @remarks
   * Only coaches can delete personal records. The athlete must belong to the organization.
   */
  @TsRestHandler(c.deletePersonalRecord)
  @RequirePermissions('delete')
  deletePersonalRecord(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: OrganizationId
  ): ReturnType<typeof tsRestHandler<typeof c.deletePersonalRecord>> {
    return tsRestHandler(c.deletePersonalRecord, async ({ params }) => {
      const personalRecordId = parsePersonalRecordId(params.id);

      await this.athletePersonalRecords.remove(
        personalRecordId,
        currentUser.id,
        organizationId
      );

      return {
        status: 204 as const,
        body: null,
      };
    });
  }
}
