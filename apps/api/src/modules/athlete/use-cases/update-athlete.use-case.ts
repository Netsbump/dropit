// update-athlete.use-case.ts
import { AthleteDto, UpdateAthlete } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Club } from '../../../entities/club.entity';
import { User } from '../../../entities/user.entity';
import { AthleteRepository, AthleteWithDetails } from '../athlete.repository';

export class UpdateAthleteUseCase {
  constructor(
    private readonly athleteRepository: AthleteRepository,
    private readonly em: EntityManager
  ) {}

  async execute(id: string, data: UpdateAthlete): Promise<AthleteDto> {
    const athlete = await this.athleteRepository.updateAthlete(id, data);

    if (data.clubId !== undefined) {
      if (data.clubId) {
        const club = await this.em.findOne(Club, { id: data.clubId });
        if (club) {
          athlete.club = club;
        }
      }
    }

    if (data.userId !== undefined) {
      if (data.userId) {
        const user = await this.em.findOne(User, { id: data.userId });
        if (user) {
          athlete.user = user;
        }
      }
    }

    await this.em.persistAndFlush(athlete);
    return this.mapToDto(athlete);
  }

  private mapToDto(athlete: AthleteWithDetails): AthleteDto {
    return {
      id: athlete.id,
      firstName: athlete.firstName,
      lastName: athlete.lastName,
      birthday: new Date(athlete.birthday),
      email: athlete.user?.email ?? '',
      avatar: athlete.user?.avatar?.url,
      country: athlete.country,
      metrics: athlete.pm
        ? {
            weight: athlete.pm.weight,
          }
        : undefined,
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
  }
}
