import type { AthleteId } from '../../domain/athlete-id';
import type { PersonalRecordId } from '../../domain/personal-record-id';

export type PersonalRecordRequest = {
  id: PersonalRecordId;
  athleteId: AthleteId;
  exerciseId: string;
  weight: number;
  date?: Date | null;
};
