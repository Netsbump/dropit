import {
  CreatePhysicalMetricInput,
  UpdatePhysicalMetricInput,
} from '@dropit/schemas';
import type {
  OrganizationId,
  UserId,
} from '../../../../../shared/kernel/identity';
import type { AthleteId } from '../../../domain/athlete-id';
import type { PhysicalMetric } from '../../../domain/physical-metric';
import type { PhysicalMetricId } from '../../../domain/physical-metric-id';

export const ATHLETE_PHYSICAL_METRICS = Symbol('ATHLETE_PHYSICAL_METRICS');

export interface IAthletePhysicalMetrics {
  findById(
    id: PhysicalMetricId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PhysicalMetric>;

  findMetricHistoryByAthleteId(
    athleteId: AthleteId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PhysicalMetric[]>;

  recordBodyMetric(
    athleteId: AthleteId,
    data: CreatePhysicalMetricInput,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PhysicalMetric>;

  amend(
    id: PhysicalMetricId,
    data: UpdatePhysicalMetricInput,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PhysicalMetric>;

  remove(
    id: PhysicalMetricId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<void>;
}
