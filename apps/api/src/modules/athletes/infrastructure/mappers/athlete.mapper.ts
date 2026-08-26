import { parseUserId } from '../../../../shared/kernel/identity';
import { AthleteEntity } from '../../../database/entities/athlete.entity';
import { Athlete } from '../../domain/athlete';
import { parseAthleteId } from '../../domain/athlete-id';

export const toAthleteEntity = (athlete: Athlete): AthleteEntity => {
  const entity = new AthleteEntity();

  entity.id = athlete.id;

  entity.firstName = athlete.firstName;
  entity.lastName = athlete.lastName;
  entity.birthday = athlete.birthday;
  entity.country = athlete.country;

  return entity;
};

export const toAthleteEntityReference = (athleteId: string): AthleteEntity => {
  const entity = new AthleteEntity();
  entity.id = athleteId;

  return entity;
};

export const toAthleteDomain = (entity: AthleteEntity): Athlete => {
  return new Athlete({
    id: parseAthleteId(entity.id),
    userId: parseUserId(entity.user.id),
    firstName: entity.firstName,
    lastName: entity.lastName,
    birthday: entity.birthday,
    country: entity.country,
  });
};

export const toAthleteDomainList = (entities: AthleteEntity[]): Athlete[] =>
  entities.map(toAthleteDomain);
