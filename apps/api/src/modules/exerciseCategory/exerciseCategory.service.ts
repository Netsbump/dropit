import { EntityManager, wrap } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { ExerciseCategory } from '../../entities/exerciseCategory.entity';
import { ExerciseCategoryDto } from './exerciseCategory.dto';

@Injectable()
export class ExerciseCategoryService {
  constructor(private readonly em: EntityManager) {}

  async getExerciseCategories() {
    return this.em.find(ExerciseCategory, {});
  }

  async getExerciseCategory(id: string) {
    return this.em.findOne(ExerciseCategory, { id });
  }

  async createExerciseCategory(exerciseCategory: ExerciseCategoryDto) {
    const exerciseCategoryToCreate = new ExerciseCategory();
    exerciseCategoryToCreate.name = exerciseCategory.name;
    await this.em.persistAndFlush(exerciseCategoryToCreate);
    return exerciseCategoryToCreate;
  }

  async updateExerciseCategory(
    id: string,
    exerciseCategory: ExerciseCategoryDto
  ) {
    const exerciseCategoryToUpdate = await this.em.findOne(ExerciseCategory, {
      id,
    });

    if (!exerciseCategoryToUpdate) {
      throw new Error('Exercise category not found');
    }

    wrap(exerciseCategoryToUpdate).assign(exerciseCategory);

    await this.em.persistAndFlush(exerciseCategoryToUpdate);
    return exerciseCategoryToUpdate;
  }

  async deleteExerciseCategory(id: string) {
    const exerciseCategoryToDelete = await this.em.findOne(ExerciseCategory, {
      id,
    });

    if (!exerciseCategoryToDelete) {
      throw new Error('Exercise category not found');
    }

    await this.em.removeAndFlush(exerciseCategoryToDelete);
  }
}
