import { AthleteDto } from '@dropit/schemas';
import { Injectable, NotFoundException } from '@nestjs/common';
import { AthleteRepository } from '../athlete.repository';
import { AthletePresenter } from '../athlete.presenter';
@Injectable()
export class GetAthleteUseCase {
  constructor(private readonly athleteRepository: AthleteRepository) {}

  async execute(id: string): Promise<AthleteDto> {
    const athlete = await this.athleteRepository.findOneWithDetails(id);
    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }
    return AthletePresenter.toDto(athlete);
  }
}
