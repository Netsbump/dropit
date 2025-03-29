// get-athlete.use-case.ts
import { AthleteDto } from '@dropit/schemas';
import { NotFoundException } from '@nestjs/common';
import { AthleteRepository, AthleteWithDetails } from '../athlete.repository';

export class GetAthleteUseCase {
  constructor(private readonly athleteRepository: AthleteRepository) {}

  async execute(id: string): Promise<AthleteDto> {
    const athlete = await this.athleteRepository.findById(id);
    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }
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
