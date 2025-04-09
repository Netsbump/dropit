import { AthleteDto } from '@dropit/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AthleteRepository, AthleteWithDetails } from '../athlete.repository';
@Injectable()
export class GetAthletesUseCase {
  constructor(private readonly athleteRepository: AthleteRepository) {}

  async execute(): Promise<AthleteWithDetails[]> {
    const athletes = await this.athleteRepository.findAllWithDetails();
    if (!athletes) {
      throw new NotFoundException('Athlete not found');
    }
    return athletes;
  }
}
