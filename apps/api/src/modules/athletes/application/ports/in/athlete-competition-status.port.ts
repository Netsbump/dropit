import {
  CreateCompetitorStatusInput,
  UpdateCompetitorStatusInput,
} from '@dropit/schemas';
import type { CompetitorStatus } from '../../../domain/competitor-status';
import type { AthleteId } from '../../../domain/athlete-id';
import type { CompetitorStatusId } from '../../../domain/competitor-status-id';

export interface IAthleteCompetitionStatus {
  /**
   * Find all competitor statuses in organization
   */
  listByOrganization(organizationId: string): Promise<CompetitorStatus[]>;

  /**
   * Find one competitor status by athlete ID
   */
  findActiveByAthleteId(
    athleteId: AthleteId,
    currentUserId: string,
    organizationId: string
  ): Promise<CompetitorStatus>;

  /**
   * Create a new competitor status
   */
  change(
    data: CreateCompetitorStatusInput,
    currentUserId: string,
    organizationId: string
  ): Promise<CompetitorStatus>;

  /**
   * Update an existing competitor status
   */
  amend(
    id: CompetitorStatusId,
    data: UpdateCompetitorStatusInput,
    currentUserId: string,
    organizationId: string
  ): Promise<CompetitorStatus>;
}

/**
 * Injection token for IAthleteCompetitionStatus
 * Use this token in @Inject() decorators in controllers
 */
export const ATHLETE_COMPETITION_STATUS = Symbol('ATHLETE_COMPETITION_STATUS');
