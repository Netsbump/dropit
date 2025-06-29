import { AthleteDto, CreateAthlete } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { AthletePresenter } from '../athlete.presenter';
import { AthleteRepository } from '../athlete.repository';

@Injectable()
export class CreateAthleteUseCase {
  constructor(
    private readonly athleteRepository: AthleteRepository,
    private readonly em: EntityManager
  ) {}

  async execute(data: CreateAthlete): Promise<AthleteDto> {
    const athlete = await this.athleteRepository.createAthlete(data);

    // if (data.userId) {
    //   const user = await this.em.findOne(User, { id: data.userId });
    //   if (user) {
    //     athlete.id = user.id;
    //   }
    // }

    await this.em.persistAndFlush(athlete);

    return AthletePresenter.toDto(athlete);
  }
}
