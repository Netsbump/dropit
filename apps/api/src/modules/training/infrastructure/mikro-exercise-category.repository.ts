import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { ExerciseCategory } from "../domain/exercise-category.entity";
import { IExerciseCategoryRepository } from "../application/ports/exercise-category.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MikroExerciseCategoryRepository extends EntityRepository<ExerciseCategory> implements IExerciseCategoryRepository {
  constructor(public readonly em: EntityManager) {
    super(em, ExerciseCategory);
  }

  async getOne(id: string): Promise<ExerciseCategory | null> {
    return await this.em.findOne(ExerciseCategory, { id });
  }

  async getAll(): Promise<ExerciseCategory[]> {
    return await this.em.find(ExerciseCategory, {});
  }

  async save(exerciseCategory: ExerciseCategory): Promise<void> {
    return await this.em.persistAndFlush(exerciseCategory);
  }

  async remove(exerciseCategory: ExerciseCategory): Promise<void> {
    return await this.em.removeAndFlush(exerciseCategory);
  }
}