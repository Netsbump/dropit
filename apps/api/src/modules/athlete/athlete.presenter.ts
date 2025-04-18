import { AthleteDto } from '@dropit/schemas';
import { Athlete } from '../../entities/athlete.entity';
import { AthleteDetails } from './athlete.repository';

export const AthletePresenter = {
  toDto(athlete: AthleteDetails): AthleteDto {
    console.log('athlete dans le presenter', athlete);
    return {
      id: athlete.id,
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      birthday: new Date(athlete.birthday),
      email: athlete.email ?? '',
      avatar: athlete.avatar ?? '',
      country: athlete.country,
      club: athlete.club ? athlete.club : undefined,
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

  toDtoList(athletes: AthleteDetails[]): AthleteDto[] {
    return athletes.map(this.toDto);
  },
};
