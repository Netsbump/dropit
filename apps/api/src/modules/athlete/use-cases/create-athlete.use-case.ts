import { AthleteDto, CreateAthlete } from '@dropit/schemas';
import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Club } from '../../../entities/club.entity';
import { User } from '../../../entities/user.entity';
import { AthleteRepository, AthleteWithDetails } from '../athlete.repository';

@Injectable()
export class CreateAthleteUseCase {
  constructor(
    private readonly athleteRepository: AthleteRepository,
    private readonly em: EntityManager
  ) {}

  async execute(data: CreateAthlete): Promise<AthleteWithDetails> {
    const athlete = await this.athleteRepository.createAthlete(data);

    if (data.clubId) {
      const club = await this.em.findOne(Club, { id: data.clubId });
      if (club) {
        athlete.club = club;
      }
    }

    if (data.userId) {
      const user = await this.em.findOne(User, { id: data.userId });
      if (user) {
        athlete.user = user;
      }
    }

    await this.em.persistAndFlush(athlete);

    return athlete;
  }
}
