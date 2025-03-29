import { AthleteDto, CreateAthlete } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Club } from '../../../entities/club.entity';
import { User } from '../../../entities/user.entity';
import { AthleteRepository, AthleteWithDetails } from '../athlete.repository';

// create-athlete.use-case.ts
export class CreateAthleteUseCase {
  constructor(
    private readonly athleteRepository: AthleteRepository,
    private readonly em: EntityManager
  ) {}

  async execute(data: CreateAthlete): Promise<AthleteDto> {
    const athlete = await this.athleteRepository.createAthlete(data);

    if (data.clubId) {
      const club = await this.em.findOne(Club, { id: data.clubId });
      if (club) {
        athlete.club = club;
      }
    }

    if (data.userId) {
      const user = await this.em.findOne(User, { id: data.userId });
      if (user) {
        athlete.user = user;
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
      metrics: {
        weight: athlete.pm?.weight,
      },
      personalRecords: {
        snatch: athlete.pr?.find((pr) => pr.e.englishName === 'snatch')?.weight,
        cleanAndJerk: athlete.pr?.find(
          (pr) => pr.e.englishName === 'cleanAndJerk'
        )?.weight,
      },
      competitorStatus: {
        level: athlete.cs?.level ?? '',
        sexCategory: athlete.cs?.sexCategory ?? '',
        weightCategory: athlete.cs?.weightCategory,
      },
    };
  }
}
