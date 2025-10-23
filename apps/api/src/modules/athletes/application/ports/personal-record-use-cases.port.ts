import {
  CreatePersonalRecord,
  PersonalRecordsSummary,
  UpdatePersonalRecord,
} from '@dropit/schemas';
import { PersonalRecord } from '../../domain/personal-record.entity';

/**
 * Personal Record Use Cases Port
 * 
 * @description
 * Interface defining the contract for personal record business logic operations.
 * This port follows the hexagonal architecture pattern by defining the
 * business logic interface without framework dependencies.
 * 
 * @remarks
 * All methods return raw entities or throw errors. Presentation logic
 * (HTTP responses, DTOs) is handled by controllers, not use cases.
 */
export const PERSONAL_RECORD_USE_CASES = Symbol('PERSONAL_RECORD_USE_CASES');

export interface IPersonalRecordUseCases {
  /**
   * Retrieves all personal records accessible to the current user
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   * @returns Array of personal records
   */
  getAll(currentUserId: string, organizationId: string): Promise<PersonalRecord[]>;

  /**
   * Retrieves a specific personal record by ID
   * @param id - Personal record ID
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   * @returns Personal record entity
   */
  getOne(id: string, currentUserId: string, organizationId: string): Promise<PersonalRecord>;

  /**
   * Retrieves all personal records for a specific athlete
   * @param athleteId - Athlete ID
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   * @returns Array of personal records
   */
  getAllByAthleteId(athleteId: string, currentUserId: string, organizationId: string): Promise<PersonalRecord[]>;

  /**
   * Retrieves personal records summary for a specific athlete
   * @param athleteId - Athlete ID
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   * @returns Personal records summary
   */
  getAllPersonalRecordsSummaryByAthleteId(athleteId: string, currentUserId: string, organizationId: string): Promise<PersonalRecordsSummary>;

  /**
   * Creates a new personal record
   * @param data - Personal record creation data
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   * @returns Created personal record entity
   */
  create(data: CreatePersonalRecord, currentUserId: string, organizationId: string): Promise<PersonalRecord>;

  /**
   * Updates an existing personal record
   * @param id - Personal record ID
   * @param data - Personal record update data
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   * @returns Updated personal record entity
   */
  update(id: string, data: UpdatePersonalRecord, currentUserId: string, organizationId: string): Promise<PersonalRecord>;

  /**
   * Deletes a personal record
   * @param id - Personal record ID
   * @param currentUserId - ID of the current user
   * @param organizationId - ID of the organization
   */
  delete(id: string, currentUserId: string, organizationId: string): Promise<void>;
}
