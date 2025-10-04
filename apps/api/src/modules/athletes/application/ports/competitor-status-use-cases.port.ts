import { CreateCompetitorStatus, UpdateCompetitorStatus } from '@dropit/schemas';
import { CompetitorStatus } from '../../domain/competitor-status.entity';

/**
 * Competitor Status Use Cases Port
 *
 * @description
 * Defines the contract for competitor status business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 *
 * @remarks
 * Following hexagonal architecture, this port is implemented by
 * CompetitorStatusUseCases and injected into controllers via dependency injection.
 */
export interface ICompetitorStatusUseCases {
  /**
   * Find all competitor statuses in organization
   */
  findAll(organizationId: string): Promise<CompetitorStatus[]>;

  /**
   * Find one competitor status by athlete ID
   */
  findOne(athleteId: string, currentUserId: string, organizationId: string): Promise<CompetitorStatus>;

  /**
   * Create a new competitor status
   */
  create(data: CreateCompetitorStatus, currentUserId: string, organizationId: string): Promise<CompetitorStatus>;

  /**
   * Update an existing competitor status
   */
  update(id: string, data: UpdateCompetitorStatus, currentUserId: string, organizationId: string): Promise<CompetitorStatus>;
}

/**
 * Injection token for ICompetitorStatusUseCases
 * Use this token in @Inject() decorators in controllers
 */
export const COMPETITOR_STATUS_USE_CASES = Symbol('COMPETITOR_STATUS_USE_CASES');

