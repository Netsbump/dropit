import { EntityManager, EntityRepository, FilterQuery } from "@mikro-orm/core";
import { Exercise } from "../domain/exercise.entity";
import { IExerciseRepository } from "../application/ports/exercise.repository";
import { Injectable } from "@nestjs/common";
import { CoachFilterConditions } from "../../identity/application/ports/member.repository.port";

@Injectable()
export class MikroExerciseRepository extends EntityRepository<Exercise> implements IExerciseRepository {
  constructor(public readonly em: EntityManager) {
    super(em, Exercise);
  }

  async getOne(id: string, coachFilterConditions: CoachFilterConditions): Promise<Exercise | null> {
    return await this.em.findOne(
      Exercise, 
      { id, $or: coachFilterConditions.$or },
      { populate: ['exerciseCategory', 'video', 'createdBy'] }
    );
  }

  async getAll(coachFilterConditions: CoachFilterConditions): Promise<Exercise[]> {
    return await this.em.find(
      Exercise,
      coachFilterConditions,
      {
        populate: ['exerciseCategory', 'video', 'createdBy'],
      }
    );
  }

  async search(query: string, coachFilterConditions: CoachFilterConditions): Promise<Exercise[]> {

    return await this.em.find(
      Exercise,
      {
        name: { $ilike: `%${query}%` },
        $or: coachFilterConditions.$or
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