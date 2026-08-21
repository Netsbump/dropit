import {
  CreatePersonalRecordInput,
  PersonalRecordsSummary,
  UpdatePersonalRecordInput,
} from '@dropit/schemas';
import type { PersonalRecord } from '../../../domain/personal-record';
import type { AthleteId } from '../../../domain/athlete-id';
import type { PersonalRecordId } from '../../../domain/personal-record-id';

export const ATHLETE_PERSONAL_RECORDS = Symbol('ATHLETE_PERSONAL_RECORDS');

export interface IAthletePersonalRecords {
  /**
   * Retrieves all personal records accessible to the current user
   */
  listAccessible(
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord[]>;

  findById(
    id: PersonalRecordId,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord>;

  listByAthleteId(
    athleteId: AthleteId,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord[]>;

  findBestOlympicLiftsByAthleteId(
    athleteId: AthleteId,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecordsSummary>;

  /**
   * Creates a new personal record
   */
  record(
    data: CreatePersonalRecordInput,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord>;

  /**
   * Updates an existing personal record
   */
  amend(
    id: PersonalRecordId,
    data: UpdatePersonalRecordInput,
    currentUserId: string,
    organizationId: string
  ): Promise<PersonalRecord>;

  /**
   * Deletes a personal record
   */
  remove(
    id: PersonalRecordId,
    currentUserId: string,
    organizationId: string
  ): Promise<void>;
}
