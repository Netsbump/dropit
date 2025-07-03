import { AthleteDetailsDto } from '@dropit/schemas';
import { AthleteDetails } from '../../application/ports/athlete-read.repository';

export const AthletePresenter = {
  toDto(athlete: AthleteDetails): AthleteDetailsDto {
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

  toDtoList(athletes: AthleteDetails[]): AthleteDetailsDto[] {
    return athletes.map(this.toDto);
  },
};
