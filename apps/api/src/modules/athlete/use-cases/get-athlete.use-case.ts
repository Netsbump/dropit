// get-athlete.use-case.ts
import { AthleteDto } from '@dropit/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AthleteRepository, AthleteWithDetails } from '../athlete.repository';
@Injectable()
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
