import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ATHLETE_WRITE_REPO, AthleteWriteRepository } from '../ports/athlete-write.repository';

@Injectable()
export class DeleteAthleteUseCase {
  constructor(
    @Inject(ATHLETE_WRITE_REPO)
    private readonly athleteWriteRepository: AthleteWriteRepository
  ) {}

  async execute(id: string): Promise<void> {
    const athlete = await this.athleteWriteRepository.ofId(id);

    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }
    
    await this.athleteWriteRepository.remove(athlete);
  }
}
