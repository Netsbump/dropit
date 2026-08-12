import {
  CreateCompetitorStatusInput,
  UpdateCompetitorStatusInput,
} from '@dropit/schemas';
import type { CompetitorStatus } from '../../../domain/competitor-status';

/**
 * Athlete Competition Status Port
 *
 * @description
 * Defines the contract for competitor status business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 *
 * @remarks
 * Following hexagonal architecture, this port is implemented by
 * AthleteCompetitionStatus and injected into controllers via dependency injection.
 */
export interface IAthleteCompetitionStatus {
  /**
   * Find all competitor statuses in organization
   */
  findAll(organizationId: string): Promise<CompetitorStatus[]>;

  /**
   * Find one competitor status by athlete ID
   */
  findOne(
    athleteId: string,
    currentUserId: string,
    organizationId: string
  ): Promise<CompetitorStatus>;

  /**
   * Create a new competitor status
   */
  create(
    data: CreateCompetitorStatusInput,
    currentUserId: string,
    organizationId: string
  ): Promise<CompetitorStatus>;

  /**
   * Update an existing competitor status
   */
  update(
    id: string,
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
