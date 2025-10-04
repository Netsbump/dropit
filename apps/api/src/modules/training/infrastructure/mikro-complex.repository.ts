import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { Complex } from "../domain/complex.entity";
import { IComplexRepository } from "../application/ports/complex.repository";
import { Injectable } from "@nestjs/common";
import { CoachFilterConditions } from "../../identity/application/ports/member.repository.port";

@Injectable()
export class MikroComplexRepository extends EntityRepository<Complex> implements IComplexRepository {
  constructor(public readonly em: EntityManager) {
    super(em, Complex);
  }

  async getOne(id: string, coachFilterConditions: CoachFilterConditions): Promise<Complex | null> {
    return await this.em.findOne(
      Complex, 
      { id, $or: coachFilterConditions.$or },
      { 
        populate: [
          'complexCategory',
          'exercises',
          'exercises.exercise',
          'exercises.exercise.exerciseCategory',
          'createdBy'
        ] 
      }
    );
  }

  async getAll(coachFilterConditions: CoachFilterConditions): Promise<Complex[]> {
    return await this.em.find(
      Complex,
      coachFilterConditions,
      {
        populate: [
          'complexCategory',
          'exercises',
          'exercises.exercise',
          'exercises.exercise.exerciseCategory',
          'createdBy'
        ],
      }
    );
  }

  async save(complex: Complex): Promise<void> {
    return await this.em.persistAndFlush(complex);
  }

  async remove(complex: Complex): Promise<void> {
    return await this.em.removeAndFlush(complex);
  }
} 