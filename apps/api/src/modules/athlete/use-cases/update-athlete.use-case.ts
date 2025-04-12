// update-athlete.use-case.ts
import { AthleteDto, UpdateAthlete } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Club } from '../../../entities/club.entity';
import { User } from '../../../entities/user.entity';
import { AthleteRepository } from '../athlete.repository';
import { AthletePresenter } from '../athlete.presenter';
@Injectable()
export class UpdateAthleteUseCase {
  constructor(
    private readonly athleteRepository: AthleteRepository,
    private readonly em: EntityManager
  ) {}

  async execute(id: string, data: UpdateAthlete): Promise<AthleteDto> {
    const athlete = await this.athleteRepository.updateAthlete(id, data);

    // if (data.clubId !== undefined) {
    //   if (data.clubId) {
    //     const club = await this.em.findOne(Club, { id: data.clubId });
    //     if (club) {
    //       athlete.club = club;
    //     }
    //   }
    // }

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
