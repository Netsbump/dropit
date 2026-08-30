import { CoachFilterConditions } from './member.repository.port';
import type { OrganizationRole } from '@dropit/schemas';

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
   * List the IDs of the athletes of an organization.
   * Returns an empty array when the organization has no athletes.
   */
  listAthleteUserIds(organizationId: string): Promise<string[]>;

  /**
   * Check if a user is a coach of an organization
   */
  isUserCoachInOrganization(
    userId: string,
    organizationId: string
  ): Promise<boolean>;

  /**
   * Check if an athlete belongs to an organization
   */
  isUserAthleteInOrganization(
    athleteId: string,
    organizationId: string
  ): Promise<boolean>;

  /**
   * Generate the filter conditions for entities created by coaches
   */
  getCoachFilterConditions(
    organizationId: string
  ): Promise<CoachFilterConditions>;

  /**
   * Get the active organization ID for a user, null if not a member of any org
   */
  getActiveOrganizationId(userId: string): Promise<string | null>;

  /**
   * Get the role of a user in a specific organization, null if not a member
   */
  getMemberRole(
    userId: string,
    organizationId: string
  ): Promise<OrganizationRole | null>;
}

/**
 * Injection token for IMemberUseCases
 */
export const MEMBER_USE_CASES = Symbol('MEMBER_USE_CASES');
