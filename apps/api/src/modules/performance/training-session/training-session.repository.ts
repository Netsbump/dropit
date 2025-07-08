import { TrainingSessionDto } from '@dropit/schemas';
import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Injectable, NotFoundException } from '@nestjs/common';
import { TrainingSession } from './domain/training-session.entity';
import { TrainingSessionMapper } from './interface/training-session.mapper';

@Injectable()
export class TrainingSessionRepository extends EntityRepository<TrainingSession> {
  constructor(public readonly em: EntityManager) {
    super(em, TrainingSession);
  }

  async findAllWithDetails(organizationId: string): Promise<TrainingSessionDto[]> {
    const sessions = await this.em.find(
      TrainingSession,
      { organization: { id: organizationId } },
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

    return TrainingSessionMapper.toDtoList(sessions);
  }

  async findOneWithDetails(id: string, organizationId: string): Promise<TrainingSessionDto> {
    const session = await this.em.findOne(
      TrainingSession,
      { id, organization: { id: organizationId } },
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

    return TrainingSessionMapper.toDto(session);
  }
}
