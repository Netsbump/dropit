import { SessionDto } from '@dropit/schemas';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingSession } from './session.entity';
import { SessionMapper } from './session.mapper';
@Injectable()
export class SessionRepository extends EntityRepository<TrainingSession> {
  constructor(public readonly em: EntityManager) {
    super(em, TrainingSession);
  }

  async findAllWithDetails(): Promise<SessionDto[]> {
    const sessions = await this.em.find(
      TrainingSession,
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

    if (!sessions) {
      throw new NotFoundException('Sessions not found');
    }

    return SessionMapper.toDtoList(sessions);
  }

  async findOneWithDetails(id: string): Promise<SessionDto> {
    const session = await this.em.findOne(
      TrainingSession,
      { id },
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

    if (!session) {
      throw new NotFoundException('TrainingSession not found');
    }

    return SessionMapper.toDto(session);
  }
}
