import { SessionDto } from '@dropit/schemas';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Session } from '../../entities/session.entity';
import { SessionMapper } from './session.mapper';
@Injectable()
export class SessionRepository extends EntityRepository<Session> {
  constructor(public readonly em: EntityManager) {
    super(em, Session);
  }

  async findAllWithDetails(): Promise<SessionDto[]> {
    const sessions = await this.em.find(
      Session,
      {},
      {
        populate: [
          'athletes',
          'athletes.athlete',
          'workout',
          'workout.elements',
          'workout.elements.exercise',
          'workout.elements.exercise.exerciseCategory',
          'workout.elements.complex',
          'workout.elements.complex.complexCategory',
          'workout.elements.complex.exercises',
          'workout.elements.complex.exercises.exercise',
          'workout.elements.complex.exercises.exercise.exerciseCategory',
        ],
      }
    );
    return SessionMapper.toDtoList(sessions);
  }
}
