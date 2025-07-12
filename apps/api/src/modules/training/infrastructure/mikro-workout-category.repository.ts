import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { WorkoutCategory } from "../domain/workout-category.entity";
import { IWorkoutCategoryRepository } from "../application/ports/workout-category.repository";
import { Injectable } from "@nestjs/common";
import { Member } from "../../identity/organization/organization.entity";

@Injectable()
export class MikroWorkoutCategoryRepository extends EntityRepository<WorkoutCategory> implements IWorkoutCategoryRepository {
  constructor(public readonly em: EntityManager) {
    super(em, WorkoutCategory);
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
    
    // Filter conditions : workout category public OR created by a coach
    return {
      $or: [
        { createdBy: null }, // Public workout category
        { createdBy: { id: { $in: coachUserIds } } } // Workout category created by a coach
      ]
    };
  }

  async getOne(id: string, userId: string, organizationId: string): Promise<WorkoutCategory | null> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.findOne(
      WorkoutCategory, 
      { id, $or: filterConditions.$or },
      { populate: ['createdBy'] }
    );
  }

  async getAll(userId: string, organizationId: string): Promise<WorkoutCategory[]> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.find(
      WorkoutCategory, 
      filterConditions,
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