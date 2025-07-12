import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { ExerciseCategory } from "../domain/exercise-category.entity";
import { IExerciseCategoryRepository } from "../application/ports/exercise-category.repository";
import { Injectable } from "@nestjs/common";
import { Member } from "../../identity/organization/organization.entity";

@Injectable()
export class MikroExerciseCategoryRepository extends EntityRepository<ExerciseCategory> implements IExerciseCategoryRepository {
  constructor(public readonly em: EntityManager) {
    super(em, ExerciseCategory);
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
    
    // Filter conditions : exercise category public OR created by a coach
    return {
      $or: [
        { createdBy: null }, // Public exercise category
        { createdBy: { id: { $in: coachUserIds } } } // Exercise category created by a coach
      ]
    };
  }

  async getOne(id: string, organizationId: string): Promise<ExerciseCategory | null> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.findOne(
      ExerciseCategory, 
      { id, $or: filterConditions.$or },
      { populate: ['createdBy'] }
    );
  }

  async getAll(organizationId: string): Promise<ExerciseCategory[]> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.find(
      ExerciseCategory, 
      filterConditions,
      { populate: ['createdBy'] }
    );
  }

  async save(exerciseCategory: ExerciseCategory): Promise<void> {
    return await this.em.persistAndFlush(exerciseCategory);
  }

  async remove(exerciseCategory: ExerciseCategory): Promise<void> {
    return await this.em.removeAndFlush(exerciseCategory);
  }
}