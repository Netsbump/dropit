import { EntityManager } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Athlete } from '../../domain/athlete.entity';
import { AthleteWriteRepository } from '../../application/ports/athlete-write.repository';


@Injectable()
export class MikroAthleteWriteRepository implements AthleteWriteRepository {
  constructor(
    private readonly em: EntityManager,
  ) {}

  save(athlete: Athlete) {
    return this.em.persistAndFlush(athlete);
  }

  ofId(id: string) {
    return this.em.findOne(Athlete, { id });
  }

  remove(athlete: Athlete) {
    return this.em.removeAndFlush(athlete);
  }
}
  
