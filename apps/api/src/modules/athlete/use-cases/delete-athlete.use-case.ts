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
    // Todo: vérifier tous les on delete cascade quand on supprime un athlète
    await this.athleteRepository.deleteAthlete(athlete.id);
  }
}
