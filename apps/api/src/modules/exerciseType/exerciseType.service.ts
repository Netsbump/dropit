import { EntityManager, wrap } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ExerciseType } from 'src/entities/exerciseType.entity';

@Injectable()
export class ExerciseTypeService {
  constructor(private readonly em: EntityManager) {}

  async getExerciseTypes() {
    return this.em.find(ExerciseType, {});
  }

  async getExerciseType(id: number) {
    return this.em.findOne(ExerciseType, { id });
  }

  async createExerciseType(exerciseType: ExerciseType) {
    return this.em.persistAndFlush(exerciseType);
  }

  async updateExerciseType(id: number, exerciseType: ExerciseType) {
    const exerciseTypeToUpdate = await this.em.findOne(ExerciseType, { id });

    if (!exerciseTypeToUpdate) {
      throw new Error('Exercise type not found');
    }

    wrap(exerciseTypeToUpdate).assign(exerciseType);
    await this.em.flush();
  }

  async deleteExerciseType(id: number) {
    const exerciseTypeToDelete = await this.em.findOne(ExerciseType, { id });

    if (!exerciseTypeToDelete) {
      throw new Error('Exercise type not found');
    }

    await this.em.removeAndFlush(exerciseTypeToDelete);
  }
}
