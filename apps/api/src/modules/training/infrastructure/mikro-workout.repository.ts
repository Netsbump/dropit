import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Workout } from '../domain/workout.entity';
import { IWorkoutRepository } from '../application/ports/workout.repository';

@Injectable()
export class MikroWorkoutRepository extends EntityRepository<Workout> implements IWorkoutRepository {
  constructor(public readonly em: EntityManager) {
    super(em, Workout);
  }

  async getAll(organizationId: string): Promise<Workout[]> {
    return await this.em.find(Workout, { organization: { id: organizationId } }, {
      populate: [
        'category',
        'elements',
        'elements.exercise',
        'elements.exercise.exerciseCategory',
        'elements.complex',
        'elements.complex.complexCategory',
        'elements.complex.exercises',
        'elements.complex.exercises.exercise',
        'elements.complex.exercises.exercise.exerciseCategory',
      ],
    });
  }

  async getOne(id: string, organizationId: string): Promise<Workout | null> {
    return await this.em.findOne(Workout, { id, organization: { id: organizationId } });
  }

  async getOneWithDetails(id: string, organizationId: string): Promise<Workout | null> {
    return await this.em.findOne(
      Workout,
      { id, organization: { id: organizationId } },
      {
        populate: [
          'category',
          'elements',
          'elements.exercise',
          'elements.exercise.exerciseCategory',
          'elements.complex',
          'elements.complex.complexCategory',
          'elements.complex.exercises',
          'elements.complex.exercises.exercise',
          'elements.complex.exercises.exercise.exerciseCategory',
        ],
      }
    );
  }

  async save(workout: Workout): Promise<Workout> {
    await this.em.persistAndFlush(workout);
    return workout;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const workoutToDelete = await this.em.findOne(
      Workout,
      { id, organization: { id: organizationId } },
      { populate: ['elements'] }
    );
    
    if (!workoutToDelete) {
      return;
    }

    // Supprimer d'abord les éléments
    const elements = workoutToDelete.elements.getItems();
    for (const element of elements) {
      this.em.remove(element);
    }

    await this.em.removeAndFlush(workoutToDelete);
  }
} 