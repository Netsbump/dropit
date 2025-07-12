import { EntityManager, EntityRepository } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { Workout } from '../domain/workout.entity';
import { IWorkoutRepository } from '../application/ports/workout.repository';
import { Member } from '../../identity/organization/organization.entity';

@Injectable()
export class MikroWorkoutRepository extends EntityRepository<Workout> implements IWorkoutRepository {
  constructor(public readonly em: EntityManager) {
    super(em, Workout);
  }

  private async getCoachFilterConditions(organizationId: string) {
    // Get coaches of the organization
    const coachMembers = await this.em.find(Member, {
      organization: { id: organizationId },
      role: { $in: ['admin', 'owner'] }
    }, {
      populate: ['user']
    });
  
    const coachUserIds = coachMembers.map(member => member.user.id);
    
    // Filter conditions : workout public OR created by a coach
    return {
      $or: [
        { createdBy: null }, // Public workout
        { createdBy: { id: { $in: coachUserIds } } } // Workout created by a coach
      ]
    };
  }

  async getAll(organizationId: string): Promise<Workout[]> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.find(Workout, filterConditions, {
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
        'createdBy'
      ],
    });
  }

  async getOne(id: string, organizationId: string): Promise<Workout | null> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.findOne(
      Workout, 
      { id, $or: filterConditions.$or },
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
          'createdBy'
        ]
      }
    );
  }

  async getOneWithDetails(id: string, organizationId: string): Promise<Workout | null> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.findOne(
      Workout,
      { id, $or: filterConditions.$or },
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
          'createdBy'
        ],
      }
    );
  }

  async save(workout: Workout): Promise<Workout> {
    await this.em.persistAndFlush(workout);
    return workout;
  }

  async remove(id: string, organizationId: string): Promise<void> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);
    
    const workoutToDelete = await this.em.findOne(
      Workout,
      { id, $or: filterConditions.$or },
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