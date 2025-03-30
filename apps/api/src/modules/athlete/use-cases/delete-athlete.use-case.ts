import { Injectable, NotFoundException } from '@nestjs/common';
import { AthleteRepository } from '../athlete.repository';
@Injectable()
export class DeleteAthleteUseCase {
  constructor(private readonly athleteRepository: AthleteRepository) {}

  async execute(id: string): Promise<void> {
    const athlete = await this.athleteRepository.findById(id);
    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }
    await this.athleteRepository.deleteAthlete(athlete.id);
  }
}
