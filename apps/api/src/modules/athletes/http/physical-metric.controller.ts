import { physicalMetricContract } from '@dropit/contract';
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
  ATHLETE_PHYSICAL_METRICS,
  IAthletePhysicalMetrics,
} from '../application/ports/in/athlete-physical-metrics.port';
import { parseAthleteId } from '../domain/athlete-id';
import { parsePhysicalMetricId } from '../domain/physical-metric-id';
import { AthleteExceptionFilter } from './athlete-exception.filter';
import {
  toPhysicalMetricCreation,
  toPhysicalMetricDto,
  toPhysicalMetricDtoList,
} from './mappers/physical-metric.mapper';

const c = physicalMetricContract;

@UseFilters(AthleteExceptionFilter)
@UseGuards(PermissionsGuard)
@Controller()
export class PhysicalMetricController {
  constructor(
    @Inject(ATHLETE_PHYSICAL_METRICS)
    private readonly athletePhysicalMetrics: IAthletePhysicalMetrics
  ) {}

  @TsRestHandler(c.getPhysicalMetric)
  @RequirePermissions('read')
  getPhysicalMetric(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: OrganizationId
  ): ReturnType<typeof tsRestHandler<typeof c.getPhysicalMetric>> {
    return tsRestHandler(c.getPhysicalMetric, async ({ params }) => {
      const physicalMetricId = parsePhysicalMetricId(params.id);

      const physicalMetric = await this.athletePhysicalMetrics.findById(
        physicalMetricId,
        currentUser.id,
        organizationId
      );

      return {
        status: 200 as const,
        body: toPhysicalMetricDto(physicalMetric),
      };
    });
  }

  @TsRestHandler(c.getAthletePhysicalMetrics)
  @RequirePermissions('read')
  getAthletePhysicalMetrics(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: OrganizationId
  ): ReturnType<typeof tsRestHandler<typeof c.getAthletePhysicalMetrics>> {
    return tsRestHandler(c.getAthletePhysicalMetrics, async ({ params }) => {
      const athleteId = parseAthleteId(params.id);

      const physicalMetrics =
        await this.athletePhysicalMetrics.findMetricHistoryByAthleteId(
          athleteId,
          currentUser.id,
          organizationId
        );

      return {
        status: 200 as const,
        body: toPhysicalMetricDtoList(physicalMetrics),
      };
    });
  }

  @TsRestHandler(c.createAthletePhysicalMetric)
  @RequirePermissions('create')
  createAthletePhysicalMetric(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: OrganizationId
  ): ReturnType<typeof tsRestHandler<typeof c.createAthletePhysicalMetric>> {
    return tsRestHandler(
      c.createAthletePhysicalMetric,
      async ({ params, body }) => {
        const creation = toPhysicalMetricCreation(body, params.id);

        const physicalMetric =
          await this.athletePhysicalMetrics.recordBodyMetric(
            creation,
            currentUser.id,
            organizationId
          );

        return {
          status: 201 as const,
          body: toPhysicalMetricDto(physicalMetric),
        };
      }
    );
  }

  @TsRestHandler(c.updatePhysicalMetric)
  @RequirePermissions('update')
  updatePhysicalMetric(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: OrganizationId
  ): ReturnType<typeof tsRestHandler<typeof c.updatePhysicalMetric>> {
    return tsRestHandler(c.updatePhysicalMetric, async ({ params, body }) => {
      const physicalMetricId = parsePhysicalMetricId(params.id);

      const physicalMetric = await this.athletePhysicalMetrics.amend(
        physicalMetricId,
        body,
        currentUser.id,
        organizationId
      );

      return {
        status: 200 as const,
        body: toPhysicalMetricDto(physicalMetric),
      };
    });
  }

  @TsRestHandler(c.deletePhysicalMetric)
  @RequirePermissions('delete')
  deletePhysicalMetric(
    @CurrentUser() currentUser: AuthenticatedUser,
    @CurrentOrganization() organizationId: OrganizationId
  ): ReturnType<typeof tsRestHandler<typeof c.deletePhysicalMetric>> {
    return tsRestHandler(c.deletePhysicalMetric, async ({ params }) => {
      const physicalMetricId = parsePhysicalMetricId(params.id);

      await this.athletePhysicalMetrics.remove(
        physicalMetricId,
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
