import { AthleteDetailsDto } from '@dropit/schemas';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AthletePresenter } from '../../interface/presenter/athlete.presenter';
import { ATHLETE_READ_REPO, AthleteReadRepository } from '../ports/athlete-read.repository';

@Injectable()
export class GetAthleteUseCase {
  constructor(
    @Inject(ATHLETE_READ_REPO)
    private readonly athleteReadRepository: AthleteReadRepository
  ) {}

  async execute(id: string): Promise<AthleteDetailsDto> {
    const athlete = await this.athleteReadRepository.findOneWithDetails(id);
    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }
    return AthletePresenter.toDto(athlete);
  }
}
