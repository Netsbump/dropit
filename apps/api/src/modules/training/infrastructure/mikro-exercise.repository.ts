import { EntityManager, EntityRepository, FilterQuery } from "@mikro-orm/core";
import { Exercise } from "../domain/exercise.entity";
import { IExerciseRepository } from "../application/ports/exercise.repository";
import { Injectable } from "@nestjs/common";
import { Member } from "../../identity/organization/organization.entity";

@Injectable()
export class MikroExerciseRepository extends EntityRepository<Exercise> implements IExerciseRepository {
  constructor(public readonly em: EntityManager) {
    super(em, Exercise);
  }

  private async getCoachFilterConditions(organizationId: string) {
    // Get coaches of the organization
    const coachMembers = await this.em.find(Member, {
      organization: { id: organizationId },
      role: { $in: ['admin', 'owner'] }
    });
  
    const coachUserIds = coachMembers.map(member => member.user.id);
    
    // Filter conditions : public exercise OR created by a coach
    return {
      $or: [
        { createdBy: null }, // Public exercise
        { createdBy: { id: { $in: coachUserIds } } } // Exercise created by a coach
      ]
    };
  }

  async getOne(id: string, organizationId: string): Promise<Exercise | null> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.findOne(
      Exercise, 
      { id, $or: filterConditions.$or },
      { populate: ['exerciseCategory', 'video', 'createdBy'] }
    );
  }

  async getAll(organizationId: string): Promise<Exercise[]> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.find(
      Exercise,
      filterConditions,
      {
        populate: ['exerciseCategory', 'video', 'createdBy'],
      }
    );
  }

  async search(query: string, organizationId: string): Promise<Exercise[]> {
    const filterConditions = await this.getCoachFilterConditions(organizationId);

    return await this.em.find(
      Exercise,
      {
        name: { $ilike: `%${query}%` },
        $or: filterConditions.$or
      },
      {
        populate: ['exerciseCategory', 'video', 'createdBy'],
      }
    );
  }

  async save(exercise: Exercise): Promise<void> {
    return await this.em.persistAndFlush(exercise);
  }

  async remove(exercise: Exercise): Promise<void> {
    return await this.em.removeAndFlush(exercise);
  }
} 