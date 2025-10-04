import { PersonalRecord } from '../../domain/personal-record.entity';

export const PERSONAL_RECORD_REPO = 'PERSONAL_RECORD_REPO';

export interface IPersonalRecordRepository {
  getOne(id: string): Promise<PersonalRecord | null>;
  getAll(athleteUserIds: string[]): Promise<PersonalRecord[]>;
  getAllByAthleteId(athleteId: string): Promise<PersonalRecord[]>;
  save(personalRecord: PersonalRecord): Promise<void>;
  remove(personalRecord: PersonalRecord): Promise<void>;
} 