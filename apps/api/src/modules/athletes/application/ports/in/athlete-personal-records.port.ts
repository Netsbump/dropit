import {
  CreatePersonalRecordInput,
  PersonalRecordsSummary,
  UpdatePersonalRecordInput,
} from '@dropit/schemas';
import type { PersonalRecord } from '../../../domain/personal-record';
import type { AthleteId } from '../../../domain/athlete-id';
import type { PersonalRecordId } from '../../../domain/personal-record-id';
import type {
  OrganizationId,
  UserId,
} from '../../../../../shared/kernel/identity';

export const ATHLETE_PERSONAL_RECORDS = Symbol('ATHLETE_PERSONAL_RECORDS');

export interface IAthletePersonalRecords {
  /**
   * Retrieves all personal records accessible to the current user
   */
  listAccessible(
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PersonalRecord[]>;

  findById(
    id: PersonalRecordId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PersonalRecord>;

  listByAthleteId(
    athleteId: AthleteId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PersonalRecord[]>;

  findBestOlympicLiftsByAthleteId(
    athleteId: AthleteId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PersonalRecordsSummary>;

  /**
   * Creates a new personal record
   */
  record(
    data: CreatePersonalRecordInput,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PersonalRecord>;

  /**
   * Updates an existing personal record
   */
  amend(
    id: PersonalRecordId,
    data: UpdatePersonalRecordInput,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<PersonalRecord>;

  /**
   * Deletes a personal record
   */
  remove(
    id: PersonalRecordId,
    currentUserId: UserId,
    organizationId: OrganizationId
  ): Promise<void>;
}
