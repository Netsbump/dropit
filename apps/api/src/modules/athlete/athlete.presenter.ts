import { AthleteDto } from '@dropit/schemas';
import { Athlete } from '../../entities/athlete.entity';
import { AthleteDetails } from './athlete.repository';

export const AthletePresenter = {
  toDto(athlete: AthleteDetails): AthleteDto {
    return {
      id: athlete.id,
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      birthday: new Date(athlete.birthday),
      email: athlete.email ?? '',
      avatar: athlete.avatar ?? '',
      country: athlete.country,
      club: athlete.club ? { id: athlete.club.id } : undefined,
      metrics: athlete.weight ? { weight: athlete.weight } : undefined,
      personalRecords:
        athlete.pr_snatch || athlete.pr_cleanAndJerk
          ? {
              snatch: athlete.pr_snatch,
              cleanAndJerk: athlete.pr_cleanAndJerk,
            }
          : undefined,
      competitorStatus: athlete.level || athlete.sexCategory || athlete.weightCategory
        ? {
            level: athlete.level ?? '',
            sexCategory: athlete.sexCategory ?? '',
            weightCategory: athlete.weightCategory ? parseInt(athlete.weightCategory) : undefined,
          }
        : undefined,
    };
  },

  toDtoList(athletes: AthleteDetails[]): AthleteDto[] {
    return athletes.map(this.toDto);
  },
};
