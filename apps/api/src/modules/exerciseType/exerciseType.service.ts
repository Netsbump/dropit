import { EntityManager, wrap } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ExerciseType } from '../../entities/exerciseType.entity';
import { ExerciseTypeDto } from './exerciseType.dto';

@Injectable()
export class ExerciseTypeService {
  constructor(private readonly em: EntityManager) {}

  async getExerciseTypes() {
    return this.em.find(ExerciseType, {});
  }

  async getExerciseType(id: number) {
    return this.em.findOne(ExerciseType, { id });
  }

  async createExerciseType(exerciseType: ExerciseTypeDto) {
    const exerciseTypeToCreate = new ExerciseType();
    exerciseTypeToCreate.name = exerciseType.name;
    await this.em.persistAndFlush(exerciseTypeToCreate);
    return exerciseTypeToCreate;
  }

  async updateExerciseType(id: number, exerciseType: ExerciseTypeDto) {
    const exerciseTypeToUpdate = await this.em.findOne(ExerciseType, { id });

    if (!exerciseTypeToUpdate) {
      throw new Error('Exercise type not found');
    }

    wrap(exerciseTypeToUpdate).assign(exerciseType);

    await this.em.persistAndFlush(exerciseTypeToUpdate);
    return exerciseTypeToUpdate;
  }

  async deleteExerciseType(id: number) {
    const exerciseTypeToDelete = await this.em.findOne(ExerciseType, { id });

    if (!exerciseTypeToDelete) {
      throw new Error('Exercise type not found');
    }

    await this.em.removeAndFlush(exerciseTypeToDelete);
  }
}
