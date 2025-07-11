import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { WorkoutCategory } from "../domain/workout-category.entity";
import { IWorkoutCategoryRepository } from "../application/ports/workout-category.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MikroWorkoutCategoryRepository extends EntityRepository<WorkoutCategory> implements IWorkoutCategoryRepository {
  constructor(public readonly em: EntityManager) {
    super(em, WorkoutCategory);
  }

  async getOne(id: string): Promise<WorkoutCategory | null> {
    return await this.em.findOne(WorkoutCategory, { id });
  }

  async getAll(): Promise<WorkoutCategory[]> {
    return await this.em.find(WorkoutCategory, {});
  }

  async save(workoutCategory: WorkoutCategory): Promise<void> {
    return await this.em.persistAndFlush(workoutCategory);
  }

  async remove(workoutCategory: WorkoutCategory): Promise<void> {
    return await this.em.removeAndFlush(workoutCategory);
  }
} 