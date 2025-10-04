import { EntityManager, EntityRepository } from "@mikro-orm/core";
import { ComplexCategory } from "../domain/complex-category.entity";
import { IComplexCategoryRepository } from "../application/ports/complex-category.repository";
import { Injectable } from "@nestjs/common";
import { CoachFilterConditions } from "../../identity/application/ports/member.repository.port";

@Injectable()
export class MikroComplexCategoryRepository extends EntityRepository<ComplexCategory> implements IComplexCategoryRepository {
  constructor(public readonly em: EntityManager) {
    super(em, ComplexCategory);
  }

  async getOne(id: string, coachFilterConditions: CoachFilterConditions): Promise<ComplexCategory | null> {
    return await this.em.findOne(
      ComplexCategory, 
      { id, $or: coachFilterConditions.$or },
      { populate: ['createdBy'] }
    );
  }

  async getAll(coachFilterConditions: CoachFilterConditions): Promise<ComplexCategory[]> {
    return await this.em.find(
      ComplexCategory, 
      coachFilterConditions,
      { populate: ['createdBy'] }
    );
  }

  async save(complexCategory: ComplexCategory): Promise<void> {
    return await this.em.persistAndFlush(complexCategory);
  }

  async remove(complexCategory: ComplexCategory): Promise<void> {
    return await this.em.removeAndFlush(complexCategory);
  }
} 