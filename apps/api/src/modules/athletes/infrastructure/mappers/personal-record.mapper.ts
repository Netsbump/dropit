import { PersonalRecordEntity } from '../../../database/entities/personal-record.entity';
import { PersonalRecord } from '../../domain/personal-record';
import { parseAthleteId } from '../../domain/athlete-id';
import { parsePersonalRecordId } from '../../domain/personal-record-id';

export const toPersonalRecordDomain = (
  entity: PersonalRecordEntity
): PersonalRecord => {
  return new PersonalRecord({
    id: parsePersonalRecordId(entity.id),
    athleteId: parseAthleteId(entity.athlete.id),
    exercise: {
      id: entity.exercise.id,
      name: entity.exercise.name,
    },
    weight: entity.weight,
    date: entity.date,
  });
};

export const toPersonalRecordDomainList = (
  entities: PersonalRecordEntity[]
): PersonalRecord[] => entities.map(toPersonalRecordDomain);
