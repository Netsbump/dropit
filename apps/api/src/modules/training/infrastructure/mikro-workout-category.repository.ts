import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { WorkoutCategory } from "../domain/workout-category.entity";
import { IWorkoutCategoryRepository } from "../application/ports/workout-category.repository";
import { Injectable } from "@nestjs/common";
import { CoachFilterConditions } from "../../identity/application/ports/member.repository";

@Injectable()
export class MikroWorkoutCategoryRepository extends EntityRepository<WorkoutCategory> implements IWorkoutCategoryRepository {
  constructor(public readonly em: EntityManager) {
    super(em, WorkoutCategory);
  }

  async getOne(id: string, coachFilterConditions: CoachFilterConditions): Promise<WorkoutCategory | null> {
    return await this.em.findOne(
      WorkoutCategory, 
      { id, $or: coachFilterConditions.$or },
      { populate: ['createdBy'] }
    );
  }

  async getAll(coachFilterConditions: CoachFilterConditions): Promise<WorkoutCategory[]> {
    return await this.em.find(
      WorkoutCategory, 
      coachFilterConditions,
      { populate: ['createdBy'] }
    );
  }

  async save(workoutCategory: WorkoutCategory): Promise<void> {
    return await this.em.persistAndFlush(workoutCategory);
  }

  async remove(workoutCategory: WorkoutCategory): Promise<void> {
    return await this.em.removeAndFlush(workoutCategory);
  }
} 