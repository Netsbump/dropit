import { AthleteDto } from '@dropit/schemas';
import { Athlete } from '../../entities/athlete.entity';

export const AthletePresenter = {
  toDto(athlete: Athlete): AthleteDto {
    const latestPm = athlete.physicalMetrics?.toArray().sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )[0];

    const latestCs = athlete.competitorStatuses?.toArray().sort(
      (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    )[0];

    const prArray = athlete.personalRecords?.toArray();

    const snatchPr = prArray?.find(
      (pr) => pr.exercise?.englishName === 'snatch'
    );

    const cleanAndJerkPr = prArray?.find(
      (pr) => pr.exercise?.englishName === 'cleanAndJerk'
    );

    return {
      id: athlete.id,
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      birthday: new Date(athlete.birthday),
      email: athlete.user?.email ?? '',
      avatar: athlete.user?.avatar?.url,
      country: athlete.country,
      metrics: latestPm ? { weight: latestPm.weight } : undefined,
      personalRecords:
        snatchPr || cleanAndJerkPr
          ? {
              snatch: snatchPr?.weight,
              cleanAndJerk: cleanAndJerkPr?.weight,
            }
          : undefined,
      competitorStatus: latestCs
        ? {
            level: latestCs.level,
            sexCategory: latestCs.sexCategory,
            weightCategory: latestCs.weightCategory,
          }
        : undefined,
    };
  },

  toDtoList(athletes: Athlete[]): AthleteDto[] {
    return athletes.map(this.toDto);
  },
};
