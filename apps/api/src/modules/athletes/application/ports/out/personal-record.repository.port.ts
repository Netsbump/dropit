import type { AthleteId } from '../../../domain/athlete-id';
import { PersonalRecord } from '../../../domain/personal-record';
import type { PersonalRecordId } from '../../../domain/personal-record-id';

export const PERSONAL_RECORD_REPO = Symbol('PERSONAL_RECORD_REPO');

export interface IPersonalRecordRepository {
  findById(id: PersonalRecordId): Promise<PersonalRecord | null>;
  listByAthleteUserIds(athleteUserIds: string[]): Promise<PersonalRecord[]>;
  listByAthleteId(athleteId: AthleteId): Promise<PersonalRecord[]>;
  add(personalRecord: PersonalRecord): Promise<PersonalRecord>;
  save(personalRecord: PersonalRecord): Promise<PersonalRecord>;
  remove(personalRecord: PersonalRecord): Promise<void>;
}
