import { Athlete as DomainAthlete } from '../domain/athlete';
import { AthleteEntity } from '../../database/entities/athlete.entity';

export const toAthleteEntity = (athlete: DomainAthlete): AthleteEntity => {
  const entity = new AthleteEntity();

  if (athlete.id) {
    entity.id = athlete.id;
  }

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

export const toAthleteDomain = (entity: AthleteEntity): DomainAthlete => {
  return new DomainAthlete({
    id: entity.id,
    userId: entity.user.id,
    firstName: entity.firstName,
    lastName: entity.lastName,
    birthday: entity.birthday,
    country: entity.country,
  });
};
