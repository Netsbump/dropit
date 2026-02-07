import { CoachFilterConditions } from './member.repository.port';

/**
 * Member Use Cases Port
 *
 * @description
 * Defines the contract for member/organization business operations.
 * This interface ensures the application layer remains independent
 * from any framework (NestJS, Express, etc.)
 */
export interface IMemberUseCases {
  /**
   * Get the IDs of the coaches (admin/owner) of an organization
   */
  getCoachUserIds(organizationId: string): Promise<string[]>;

  /**
   * Get the IDs of the athletes of an organization
   */
  getAthleteUserIds(organizationId: string): Promise<string[]>;

  /**
   * Check if a user is a coach of an organization
   */
  isUserCoachInOrganization(userId: string, organizationId: string): Promise<boolean>;

  /**
   * Check if an athlete belongs to an organization
   */
  isUserAthleteInOrganization(athleteId: string, organizationId: string): Promise<boolean>;

  /**
   * Generate the filter conditions for entities created by coaches
   */
  getCoachFilterConditions(organizationId: string): Promise<CoachFilterConditions>;
}

/**
 * Injection token for IMemberUseCases
 */
export const MEMBER_USE_CASES = Symbol('MEMBER_USE_CASES');
