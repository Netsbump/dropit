import type {
  CreatePersonalRecordInput,
  PersonalRecordDto,
} from '@dropit/schemas';
import { parseAthleteId } from '../../domain/athlete-id';
import type { PersonalRecordRequest } from '../../application/models/personal-record-request';
import { PersonalRecord } from '../../domain/personal-record';
import { generatePersonalRecordId } from '../../domain/personal-record-id';

export const toPersonalRecordRequest = (
  input: CreatePersonalRecordInput,
  athleteId: string
): PersonalRecordRequest => ({
  id: generatePersonalRecordId(),
  athleteId: parseAthleteId(athleteId),
  exerciseId: input.exerciseId,
  weight: input.weight,
  date: input.date,
});

export const toPersonalRecordDto = (
  personalRecord: PersonalRecord
): PersonalRecordDto => {
  if (!personalRecord.id) {
    throw new Error('Personal record id is required to map PersonalRecordDto');
  }

  return {
    id: personalRecord.id,
    weight: personalRecord.weight,
    date: personalRecord.date,
    athleteId: personalRecord.athleteId,
    exerciseId: personalRecord.exercise.id,
    exerciseName: personalRecord.exercise.name,
  };
};

export const toPersonalRecordDtoList = (
  personalRecords: PersonalRecord[]
): PersonalRecordDto[] => personalRecords.map(toPersonalRecordDto);
