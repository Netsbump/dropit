import {
  CreatePersonalRecordInput,
  PersonalRecordsSummary,
  UpdatePersonalRecordInput,
} from '@dropit/schemas';
import type { PersonalRecord } from '../../../domain/personal-record';

/**
 * Athlete Personal Records Port
 *
 * @description
 * Interface defining the contract for personal record business logic operations.
 * This port follows the hexagonal architecture pattern by defining the
 * business logic interface without framework dependencies.
 *
 * @remarks
 * Methods return domain objects or throw errors. Presentation logic
 * (HTTP responses, DTOs) is handled by controllers, not application services.
 */
export const ATHLETE_PERSONAL_RECORDS = Symbol('ATHLETE_PERSONAL_RECORDS');

export interface IAthletePersonalRecords {
  /**
   * Retrieves all personal records accessible to the current user
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   * @returns Array of personal records
   */
  listAccessible(
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord[]>;

  /**
   * Retrieves a specific personal record by ID
   * @param id - Personal record ID
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   * @returns Personal record
   */
  findById(
    id: string,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord>;

  /**
   * Retrieves all personal records for a specific athlete
   * @param athleteId - Athlete ID
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   * @returns Array of personal records
   */
  listByAthleteId(
    athleteId: string,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord[]>;

  /**
   * Retrieves personal records summary for a specific athlete
   * @param athleteId - Athlete ID
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   * @returns Personal records summary
   */
  findBestOlympicLiftsByAthleteId(
    athleteId: string,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecordsSummary>;

  /**
   * Creates a new personal record
   * @param data - Personal record creation data
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   * @returns Created personal record
   */
  record(
    data: CreatePersonalRecordInput,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord>;

  /**
   * Updates an existing personal record
   * @param id - Personal record ID
   * @param data - Personal record update data
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   * @returns Updated personal record
   */
  amend(
    id: string,
    data: UpdatePersonalRecordInput,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord>;

  /**
   * Deletes a personal record
   * @param id - Personal record ID
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   */
  remove(
    id: string,
    currentUserId: string,
    organizationId: string
  ): Promise<void>;
}
