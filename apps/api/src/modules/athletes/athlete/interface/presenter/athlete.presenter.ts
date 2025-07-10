import { AthleteDetailsDto, AthleteDto } from '@dropit/schemas';
import { AthleteDetails } from '../../application/ports/athlete-read.repository';
import { Athlete } from '../../domain/athlete.entity';

export const AthletePresenter = {
  toDtoDetails(athlete: AthleteDetails): AthleteDetailsDto {
    return {
      id: athlete.id,
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      birthday: new Date(athlete.birthday),
      email: athlete.email ?? '',
      image: athlete.image ?? '',
      country: athlete.country,
      metrics: athlete.weight ? { weight: athlete.weight } : undefined,
      personalRecords:
        athlete.pr_snatch || athlete.pr_cleanAndJerk
          ? {
              snatch: athlete.pr_snatch,
              cleanAndJerk: athlete.pr_cleanAndJerk,
            }
          : undefined,
      competitorStatus:
        athlete.level || athlete.sex_category || athlete.weight_category
          ? {
              level: athlete.level ?? '',
              sexCategory: athlete.sex_category ?? '',
              weightCategory: athlete.weight_category
                ? parseInt(athlete.weight_category)
                : undefined,
            }
          : undefined,
    };
  },

  toDtoListDetails(athletes: AthleteDetails[]): AthleteDetailsDto[] {
    return athletes.map(this.toDtoDetails);
  },

  toDto(a: Athlete): AthleteDto {
    return {
      id: a.id,
      firstName: a.firstName,
      lastName: a.lastName,
      birthday: a.birthday,
    };
  },

  toDtoList(athletes: Athlete[]): AthleteDto[] {
    return athletes.map(this.toDto);
  },
};
