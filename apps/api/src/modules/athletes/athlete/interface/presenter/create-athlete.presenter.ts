// interface/presenter/created-athlete.presenter.ts
import { Athlete } from '../../domain/athlete.entity';
import { AthleteDto } from '@dropit/schemas';

export const CreatedAthletePresenter = {
  toDto(a: Athlete): AthleteDto {
    return {
      id: a.id,
      firstName: a.firstName,
      lastName: a.lastName,
      birthday: a.birthday,
    };
  },
};
