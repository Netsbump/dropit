import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { Complex } from "../domain/complex.entity";
import { IComplexRepository } from "../application/ports/complex.repository";
import { Injectable } from "@nestjs/common";

@Injectable()
export class MikroComplexRepository extends EntityRepository<Complex> implements IComplexRepository {
  constructor(public readonly em: EntityManager) {
    super(em, Complex);
  }

  async getOne(id: string, organizationId: string): Promise<Complex | null> {
    return await this.em.findOne(
      Complex, 
      { id },
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

  async getAll(organizationId: string): Promise<Complex[]> {
    return await this.em.find(
      Complex,
      {},
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