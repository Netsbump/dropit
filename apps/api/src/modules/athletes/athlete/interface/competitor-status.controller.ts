import { competitorStatusContract } from '@dropit/contract';
import {
  BadRequestException,
  Controller,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { TsRestHandler, tsRestHandler } from '@ts-rest/nest';
import { CompetitorStatusUseCases } from '../application/use-cases/competitor-status.use-cases';
import { PermissionsGuard } from '../../../identity/permissions/permissions.guard';
import { RequirePermissions } from '../../../identity/permissions/permissions.decorator';
import { CurrentOrganization } from '../../../identity/organization/organization.decorator';
import { AuthenticatedUser, CurrentUser } from '../../../identity/auth/auth.decorator';

const c = competitorStatusContract;

@UseGuards(PermissionsGuard)
@Controller()
export class CompetitorStatusController {
  constructor(
    private readonly competitorStatusUseCases: CompetitorStatusUseCases
  ) {}

  @TsRestHandler(c.getCompetitorStatuses)
  @RequirePermissions('read')
  getCompetitorStatuses(@CurrentOrganization() organizationId: string): ReturnType<typeof tsRestHandler<typeof c.getCompetitorStatuses>> {
    return tsRestHandler(c.getCompetitorStatuses, async () => {
      return await this.competitorStatusUseCases.getAll(organizationId);
    });
  }

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

  @TsRestHandler(c.createCompetitorStatus)
  @RequirePermissions('create')
  createCompetitorStatus(): ReturnType<typeof tsRestHandler<typeof c.createCompetitorStatus>> {
    return tsRestHandler(c.createCompetitorStatus, async ({ body }) => {
      try {
        const newCompetitorStatus =
          await this.competitorStatusUseCases.createCompetitorStatus(body);
        return {
          status: 201,
          body: newCompetitorStatus,
        };
      } catch (error) {
        if (error instanceof BadRequestException) {
          return {
            status: 400,
            body: { message: error.message },
          };
        }
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: { message: error.message },
          };
        }

        throw error;
      }
    });
  }

  @TsRestHandler(c.updateCompetitorStatus)
  @RequirePermissions('update')
  updateCompetitorStatus(): ReturnType<typeof tsRestHandler<typeof c.updateCompetitorStatus>> {
    return tsRestHandler(c.updateCompetitorStatus, async ({ params, body }) => {
      try {
        const updatedCompetitorStatus =
          await this.competitorStatusUseCases.updateCompetitorStatus(
            params.id,
            body
          );

        return {
          status: 200,
          body: updatedCompetitorStatus,
        };
      } catch (error) {
        if (error instanceof NotFoundException) {
          return {
            status: 404,
            body: { message: error.message },
          };
        }

        throw error;
      }
    });
  }
}
