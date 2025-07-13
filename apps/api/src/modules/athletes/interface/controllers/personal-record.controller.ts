import { personalRecordContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { PersonalRecordUseCases } from '../../application/use-cases/personal-record.use-cases';
import { PermissionsGuard } from '../../../identity/infrastructure/guards/permissions.guard';
import { RequirePermissions } from '../../../identity/infrastructure/decorators/permissions.decorator';
import { CurrentOrganization } from '../../../identity/infrastructure/decorators/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/infrastructure/decorators/auth.decorator';

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
 * @see {@link PersonalRecordUseCases} for business logic implementation
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class PersonalRecordController {
  constructor(private readonly personalRecordUseCases: PersonalRecordUseCases) {}

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
    @CurrentOrganization() organizationId: string
  ): ReturnType<typeof tsRestHandler<typeof c.getPersonalRecords>> {
    return tsRestHandler(c.getPersonalRecords, async () => {
      return await this.personalRecordUseCases.getAll(currentUser.id, organizationId);
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
    @CurrentOrganization() organizationId: string
  ): ReturnType<typeof tsRestHandler<typeof c.getPersonalRecord>> {
    return tsRestHandler(c.getPersonalRecord, async ({ params }) => {
      return await this.personalRecordUseCases.getOne(params.id, currentUser.id, organizationId);
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
    @CurrentOrganization() organizationId: string
  ): ReturnType<typeof tsRestHandler<typeof c.getAthletePersonalRecords>> {
    return tsRestHandler(c.getAthletePersonalRecords, async ({ params }) => {
      return await this.personalRecordUseCases.getAllByAthleteId(params.id, currentUser.id, organizationId);
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
    @CurrentOrganization() organizationId: string
  ): ReturnType<typeof tsRestHandler<typeof c.getAthletePersonalRecordsSummary>> {
    return tsRestHandler(c.getAthletePersonalRecordsSummary, async ({ params }) => {
      return await this.personalRecordUseCases.getAllPersonalRecordsSummaryByAthleteId(params.id, currentUser.id, organizationId);
    });
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
    @CurrentOrganization() organizationId: string
  ): ReturnType<typeof tsRestHandler<typeof c.createPersonalRecord>> {
    return tsRestHandler(c.createPersonalRecord, async ({ body }) => {
      return await this.personalRecordUseCases.create(body, currentUser.id, organizationId);
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
    @CurrentOrganization() organizationId: string
  ): ReturnType<typeof tsRestHandler<typeof c.updatePersonalRecord>> {
    return tsRestHandler(c.updatePersonalRecord, async ({ params, body }) => {
      return await this.personalRecordUseCases.update(params.id, body, currentUser.id, organizationId);
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
    @CurrentOrganization() organizationId: string
  ): ReturnType<typeof tsRestHandler<typeof c.deletePersonalRecord>> {
    return tsRestHandler(c.deletePersonalRecord, async ({ params }) => {
      return await this.personalRecordUseCases.delete(params.id, currentUser.id, organizationId);
    });
  }
}
