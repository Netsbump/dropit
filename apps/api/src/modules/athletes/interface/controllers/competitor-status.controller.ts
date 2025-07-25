import { competitorStatusContract } from '@dropit/contract';
import {
  Controller,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { CompetitorStatusUseCases } from '../../application/use-cases/competitor-status.use-cases';
import { PermissionsGuard } from '../../../identity/infrastructure/guards/permissions.guard';
import { RequirePermissions } from '../../../identity/infrastructure/decorators/permissions.decorator';
import { CurrentOrganization } from '../../../identity/infrastructure/decorators/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/infrastructure/decorators/auth.decorator';

const c = competitorStatusContract;

/**
 * Competitor Status Controller
 * 
 * @description
 * Handles all competitor status related operations including CRUD operations
 * for managing athlete competition levels, categories, and weight classes.
 * 
 * @remarks
 * This controller uses Ts REST for type-safe API contracts and integrates
 * with the permissions system via @UseGuards(PermissionsGuard).
 * All endpoints require appropriate permissions (read, create, update)
 * and are scoped to the current organization.
 * 
 * @see {@link CompetitorStatusUseCases} for business logic implementation
 * @see {@link PermissionsGuard} for authorization handling
 */
@UseGuards(PermissionsGuard)
@Controller()
export class CompetitorStatusController {
  constructor(
    private readonly competitorStatusUseCases: CompetitorStatusUseCases
  ) {}

  /**
   * Retrieves all competitor statuses for athletes in the current organization.
   *
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns A list of all competitor statuses for athletes in the organization.
   */
  @TsRestHandler(c.getCompetitorStatuses)
  @RequirePermissions('read')
  getCompetitorStatuses(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getCompetitorStatuses>> {
    return tsRestHandler(c.getCompetitorStatuses, async () => {
      return await this.competitorStatusUseCases.getAll(organizationId);
    });
  }

  /**
   * Retrieves a specific competitor status by athlete ID.
   *
   * @param currentUser - The current authenticated user (injected via the `@CurrentUser` decorator)
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns The competitor status for the specified athlete.
   * @remarks
   * Access is restricted to coaches or the athlete themselves.
   */
  @TsRestHandler(c.getCompetitorStatus)
  @RequirePermissions('read')
  getCompetitorStatus(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: string
  ): ReturnType<typeof tsRestHandler<typeof c.getCompetitorStatus>> {
    return tsRestHandler(c.getCompetitorStatus, async ({ params }) => {
      return await this.competitorStatusUseCases.getOne(params.id, currentUser.id, organizationId);
    });
  }

  /**
   * Creates a new competitor status for an athlete.
   *
   * @param currentUser - The current authenticated user (injected via the `@CurrentUser` decorator)
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns The newly created competitor status.
   * @remarks
   * Only coaches can create competitor statuses. If a previous active status exists,
   * it will be automatically closed before creating the new one.
   */
  @TsRestHandler(c.createCompetitorStatus)
  @RequirePermissions('create')
  createCompetitorStatus(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: string
  ): ReturnType<typeof tsRestHandler<typeof c.createCompetitorStatus>> {
    return tsRestHandler(c.createCompetitorStatus, async ({ body }) => {
      return await this.competitorStatusUseCases.create(body, currentUser.id, organizationId);
    });
  }

  /**
   * Updates an existing competitor status.
   *
   * @param currentUser - The current authenticated user (injected via the `@CurrentUser` decorator)
   * @param organizationId - The ID of the current organization (injected via the `@CurrentOrganization` decorator)
   * @returns The updated competitor status.
   * @remarks
   * Only coaches can update competitor statuses. The athlete must belong to the organization.
   */
  @TsRestHandler(c.updateCompetitorStatus)
  @RequirePermissions('update')
  updateCompetitorStatus(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: string
  ): ReturnType<typeof tsRestHandler<typeof c.updateCompetitorStatus>> {
    return tsRestHandler(c.updateCompetitorStatus, async ({ params, body }) => {
     return await this.competitorStatusUseCases.update(params.id, body, currentUser.id, organizationId);
    });
  }
}
