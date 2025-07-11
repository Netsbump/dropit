import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { WorkoutElement } from '../domain/workout-element.entity';
import { IWorkoutElementRepository } from '../application/ports/workout-element.repository';

@Injectable()
export class MikroWorkoutElementRepository extends EntityRepository<WorkoutElement> implements IWorkoutElementRepository {
  constructor(public readonly em: EntityManager) {
    super(em, WorkoutElement);
  }

  async save(workoutElement: WorkoutElement): Promise<void> {
    return await this.em.persistAndFlush(workoutElement);
  }

  async remove(id: string): Promise<void> {
    const workoutElement = await this.em.findOne(WorkoutElement, { id });
    
    if (workoutElement) {
      await this.em.removeAndFlush(workoutElement);
    }
  }
} 