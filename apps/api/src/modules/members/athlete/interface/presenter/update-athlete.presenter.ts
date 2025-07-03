import { Athlete } from '../../domain/athlete.entity';
import { AthleteDto } from '@dropit/schemas';

export const UpdatedAthletePresenter = {
  toDto(a: Athlete): AthleteDto {
    return {
      id: a.id,
      firstName: a.firstName,
      lastName: a.lastName,
      birthday: a.birthday,
    };
  },
};
