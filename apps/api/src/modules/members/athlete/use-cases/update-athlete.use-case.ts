// update-athlete.use-case.ts
import { AthleteDto, UpdateAthlete } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { AthletePresenter } from '../athlete.presenter';
import { AthleteRepository } from '../athlete.repository';
@Injectable()
export class UpdateAthleteUseCase {
  constructor(
    private readonly athleteRepository: AthleteRepository,
    private readonly em: EntityManager
  ) {}

  async execute(id: string, data: UpdateAthlete): Promise<AthleteDto> {
    const athlete = await this.athleteRepository.updateAthlete(id, data);

    // if (data.userId !== undefined) {
    //   if (data.userId) {
    //     const user = await this.em.findOne(User, { id: data.userId });
    //     if (user) {
    //       athlete.id = user.id;
    //     }
    //   }
    // }

    await this.em.persistAndFlush(athlete);
    return AthletePresenter.toDto(athlete);
  }
}
