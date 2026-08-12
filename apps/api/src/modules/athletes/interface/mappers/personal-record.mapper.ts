import type { PersonalRecordDto } from '@dropit/schemas';
import { PersonalRecord } from '../../domain/personal-record';

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
