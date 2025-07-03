import { AthleteDto, UpdateAthlete } from '@dropit/schemas';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { UpdatedAthletePresenter } from '../../interface/presenter/update-athlete.presenter';
import { ATHLETE_WRITE_REPO, AthleteWriteRepository } from '../ports/athlete-write.repository';

@Injectable()
export class UpdateAthleteUseCase {
  constructor(
    @Inject(ATHLETE_WRITE_REPO)
    private readonly athleteWriteRepository: AthleteWriteRepository
  ) {}

  async execute(id: string, data: UpdateAthlete): Promise<AthleteDto> {
    const athlete = await this.athleteWriteRepository.ofId(id);

    if (!athlete) {
      throw new NotFoundException('Athlete not found');
    }

    if (data.firstName !== undefined) {
      athlete.firstName = data.firstName;
    }

    if (data.lastName !== undefined) {
      athlete.lastName = data.lastName;
    }

    if (data.birthday !== undefined) {
      athlete.birthday = new Date(data.birthday);
    }

    if (data.country !== undefined) {
      athlete.country = data.country;
    }

    await this.athleteWriteRepository.save(athlete);

    return UpdatedAthletePresenter.toDto(athlete);
  }
}
