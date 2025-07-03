import { AthleteDetailsDto } from '@dropit/schemas';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AthletePresenter } from '../../interface/presenter/athlete.presenter';
import { ATHLETE_READ_REPO, AthleteReadRepository } from '../ports/athlete-read.repository';

@Injectable()
export class GetAthletesUseCase {
  constructor(
    @Inject(ATHLETE_READ_REPO)
    private readonly athleteReadRepository: AthleteReadRepository
  ) {}

  async execute(): Promise<AthleteDetailsDto[]> {
    const athletes = await this.athleteReadRepository.findAllWithDetails();
    if (!athletes) {
      throw new NotFoundException('Athletes not found');
    }
    return AthletePresenter.toDtoList(athletes);
  }
}
