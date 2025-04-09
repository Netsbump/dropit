import { Injectable, NotFoundException } from '@nestjs/common';
import { AthleteRepository, AthleteWithDetails } from '../athlete.repository';
@Injectable()
export class GetAthleteUseCase {
  constructor(private readonly athleteRepository: AthleteRepository) {}

  async execute(id: string): Promise<AthleteWithDetails> {
    const athlete = await this.athleteRepository.findById(id);
    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }
    return athlete;
  }
}
