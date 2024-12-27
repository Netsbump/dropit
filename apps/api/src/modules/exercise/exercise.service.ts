import { EntityManager, wrap } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { Exercise } from 'src/entities/exercise.entity';

@Injectable()
export class ExerciseService {
  constructor(private readonly em: EntityManager) {}

  async getExercises() {
    return this.em.find(Exercise, {});
  }

  async getExercise(id: number) {
    return this.em.findOne(Exercise, { id });
  }

  async createExercise(exercise: Exercise) {
    return this.em.persistAndFlush(exercise);
  }

  async updateExercise(id: number, exercise: Exercise) {
    const exerciseToUpdate = await this.em.findOne(Exercise, { id });

    if (!exerciseToUpdate) {
      throw new Error('Exercise not found');
    }

    wrap(exerciseToUpdate).assign(exercise);
    await this.em.flush();
  }

  async deleteExercise(id: number) {
    const exerciseToDelete = await this.em.findOne(Exercise, { id });

    if (!exerciseToDelete) {
      throw new Error('Exercise not found');
    }

    await this.em.removeAndFlush(exerciseToDelete);
  }

  async searchExercises(query: string) {
    return this.em.find(Exercise, {
      name: { $ilike: `%${query}%` },
    });
  }
}
