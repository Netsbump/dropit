import { AthleteDto } from '@dropit/schemas';
import { AthleteWithDetails } from './athlete.repository';

export const AthletePresenter = {
  toDto(athlete: AthleteWithDetails): AthleteDto {
    return {
      id: athlete.id,
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      birthday: new Date(athlete.birthday),
      email: athlete.user?.email ?? '',
      avatar: athlete.user?.avatar?.url,
      country: athlete.country,
      metrics: athlete.pm ? { weight: athlete.pm.weight } : undefined,
      personalRecords: athlete.pr?.length
        ? {
            snatch: athlete.pr.find(
              (pr) => pr.exercise.englishName === 'snatch'
            )?.weight,
            cleanAndJerk: athlete.pr.find(
              (pr) => pr.exercise.englishName === 'cleanAndJerk'
            )?.weight,
          }
        : undefined,
      competitorStatus: athlete.cs
        ? {
            level: athlete.cs.level,
            sexCategory: athlete.cs.sexCategory,
            weightCategory: athlete.cs.weightCategory,
          }
        : undefined,
    };
  },

  toDtoList(athletes: AthleteWithDetails[]): AthleteDto[] {
    return athletes.map(this.toDto);
  },
};
