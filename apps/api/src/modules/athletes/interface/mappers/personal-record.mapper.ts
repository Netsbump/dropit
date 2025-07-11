import { PersonalRecordDto } from '@dropit/schemas';
import { PersonalRecord } from '../../domain/personal-record.entity';

export const PersonalRecordMapper = {

  toDto(personalRecord: PersonalRecord): PersonalRecordDto {
    return {
      id: personalRecord.id,
      weight: personalRecord.weight,
      date: personalRecord.date,
      createdAt: personalRecord.createdAt,
      updatedAt: personalRecord.updatedAt,
      athleteId: personalRecord.athlete.id,
      exerciseId: personalRecord.exercise.id,
      exerciseName: personalRecord.exercise.name,
    };
  },

  toDtoList(personalRecords: PersonalRecord[]): PersonalRecordDto[] {
    return personalRecords.map((personalRecord) => PersonalRecordMapper.toDto(personalRecord));
  },
}; 