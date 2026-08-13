import { PersonalRecord } from '../../../domain/personal-record';

export const PERSONAL_RECORD_REPO = Symbol('PERSONAL_RECORD_REPO');

export interface IPersonalRecordRepository {
  findById(id: string): Promise<PersonalRecord | null>;
  listByAthleteUserIds(athleteUserIds: string[]): Promise<PersonalRecord[]>;
  listByAthleteId(athleteId: string): Promise<PersonalRecord[]>;
  save(personalRecord: PersonalRecord): Promise<PersonalRecord>;
  remove(personalRecord: PersonalRecord): Promise<void>;
}
