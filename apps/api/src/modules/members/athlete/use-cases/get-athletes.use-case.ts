import { Injectable, NotFoundException } from '@nestjs/common';
import { AthleteRepository } from '../athlete.repository';
import { AthletePresenter } from '../athlete.presenter';
import { AthleteDto } from '@dropit/schemas';

@Injectable()
export class GetAthletesUseCase {
  constructor(private readonly athleteRepository: AthleteRepository) {}

  async execute(): Promise<AthleteDto[]> {
    const athletes = await this.athleteRepository.findAllWithDetails();
    if (!athletes) {
      throw new NotFoundException('Athletes not found');
    }
    return AthletePresenter.toDtoList(athletes);
  }
}
