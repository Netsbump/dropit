import { AthleteDto } from '@dropit/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AthleteRepository, AthleteWithDetails } from '../athlete.repository';
@Injectable()
export class GetAthletesUseCase {
  constructor(private readonly athleteRepository: AthleteRepository) {}

  async execute(): Promise<AthleteDto[]> {
    const athletes = await this.athleteRepository.findAllWithDetails();
    if (!athletes) {
      throw new NotFoundException('Athlete not found');
    }
    return this.mapToDto(athletes);
  }

  private mapToDto(athletes: AthleteWithDetails[]): AthleteDto[] {
    return athletes.map((athlete) => ({
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
    }));
  }
}
