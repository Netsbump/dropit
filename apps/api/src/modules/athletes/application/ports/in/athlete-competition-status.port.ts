import {
  CreateCompetitorStatusInput,
  UpdateCompetitorStatusInput,
} from '@dropit/schemas';
import type {
  OrganizationId,
  UserId,
} from '../../../../../shared/kernel/identity';
import type { AthleteId } from '../../../domain/athlete-id';
import type { CompetitorStatus } from '../../../domain/competitor-status';
import type { CompetitorStatusId } from '../../../domain/competitor-status-id';

export interface IAthleteCompetitionStatus {
  /**
   * Find all competitor statuses in organization
   */
  listByOrganization(
    organizationId: OrganizationId
  ): Promise<CompetitorStatus[]>;

  /**
   * Find one competitor status by athlete ID
   */
  findActiveByAthleteId(
    athleteId: AthleteId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<CompetitorStatus>;

  /**
   * Create a new competitor status
   */
  change(
    athleteId: AthleteId,
    data: CreateCompetitorStatusInput,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<CompetitorStatus>;

  /**
   * Update an existing competitor status
   */
  amend(
    id: CompetitorStatusId,
    data: UpdateCompetitorStatusInput,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<CompetitorStatus>;
}

/**
 * Injection token for IAthleteCompetitionStatus
 * Use this token in @Inject() decorators in controllers
 */
export const ATHLETE_COMPETITION_STATUS = Symbol('ATHLETE_COMPETITION_STATUS');
