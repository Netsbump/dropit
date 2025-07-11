import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { Exercise } from "../domain/exercise.entity";
import { IExerciseRepository } from "../application/ports/exercise.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MikroExerciseRepository extends EntityRepository<Exercise> implements IExerciseRepository {
  constructor(public readonly em: EntityManager) {
    super(em, Exercise);
  }

  async getOne(id: string, organizationId: string): Promise<Exercise | null> {
    return await this.em.findOne(
      Exercise, 
      { id, createdBy: { organization: { id: organizationId } } },
      { populate: ['exerciseCategory', 'video', 'createdBy'] }
    );
  }

  async getAll(organizationId: string): Promise<Exercise[]> {
    return await this.em.find(
      Exercise,
      { createdBy: { organization: { id: organizationId } } },
      {
        populate: ['exerciseCategory', 'video', 'createdBy'],
      }
    );
  }

  async search(query: string, organizationId: string): Promise<Exercise[]> {
    return await this.em.find(
      Exercise,
      {
        name: { $ilike: `%${query}%` },
        createdBy: { organization: { id: organizationId } }
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